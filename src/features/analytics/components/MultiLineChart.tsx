import { CartesianGrid, Line, LineChart, ReferenceArea, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/core/components/ui/chart";
import { ChartCard } from "./ChartCard";
import { ChartHeader } from "../types";
import { cn } from "@/core/utils/style";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import React from "react";
import { Spinner } from "@/core/components/ui/spinner";
import { Button } from "@/core/components/ui/button";
import { Eye, EyeOff, Info } from "lucide-react";

type ZoomState = {
  left: number | string;
  right: number | string;
  bottom: number | string;
  top: number | string;
};

const initialZoom: ZoomState = {
  left: "dataMin",
  right: "dataMax",
  bottom: "dataMin",
  top: "dataMax",
};

interface MultiLineChartProps {
  data: Record<string, any>[];
  categoryKey: string;
  lineKeys: string[];
  containerClass?: string;
  cardClass?: string;
  valueUnit?: string;
  header: ChartHeader;
  colors?: string[];
  onLineClick?: (key: string, event: MouseEvent) => void;
  onLineHover?: (key: string) => void;
  isLoading?: boolean;
  minDataPoints?: number;
}

export function MultiLineChart({
  data,
  categoryKey,
  lineKeys,
  cardClass,
  containerClass,
  valueUnit = "",
  header,
  colors,
  onLineClick,
  onLineHover,
  isLoading = false,
  minDataPoints = 2,
}: MultiLineChartProps) {
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);
  const [zoom, setZoom] = useState<ZoomState>(initialZoom);
  const [showAll, setShowAll] = useState(false);

  const prefetchedRef = useRef<Set<string>>(new Set());
  const dataRef = useRef({ data, categoryKey, lineKeys });
  const refAreaStartRef = useRef<string | undefined>(undefined);
  const refAreaEndRef = useRef<string | undefined>(undefined);
  const isDraggingRef = useRef(false);
  const [selectionBox, setSelectionBox] = useState<{ left: string; right: string } | null>(null);

  // Count valid data points per line and identify sparse ones
  const dataPointCount = useMemo(() => {
    const counts: Record<string, number> = {};
    lineKeys.forEach(key => {
      counts[key] = data.filter(d => d[key] != null && !isNaN(Number(d[key]))).length;
    });
    return counts;
  }, [data, lineKeys]);

  const sparseLineKeys = useMemo(
    () => lineKeys.filter(key => (dataPointCount[key] ?? 0) < minDataPoints),
    [lineKeys, dataPointCount, minDataPoints]
  );

  const filteredLineKeys = useMemo(() => {
    if (showAll) return lineKeys;
    return lineKeys.filter(key => (dataPointCount[key] ?? 0) >= minDataPoints);
  }, [lineKeys, showAll, dataPointCount, minDataPoints]);

  const hiddenLineCount = lineKeys.length - filteredLineKeys.length;

  // Stable color map
  const fullPalette = useMemo(() =>
    colors && colors.length >= lineKeys.length
      ? colors
      : lineKeys.map((_, i) => `var(--chart-${(i % 5) + 1})`),
    [colors, lineKeys]
  );

  const colorMap = useMemo(() =>
    Object.fromEntries(lineKeys.map((key, i) => [key, fullPalette[i]])),
    [lineKeys, fullPalette]
  );

  const filteredColors = useMemo(
    () => filteredLineKeys.map(key => colorMap[key]),
    [filteredLineKeys, colorMap]
  );

  const chartConfig = useMemo(() =>
    Object.fromEntries(
      filteredLineKeys.map(key => [key, { label: key, color: colorMap[key] }])
    ) as ChartConfig,
    [filteredLineKeys, colorMap]
  );

  const lineKeysKey = filteredLineKeys.join(',');

  useEffect(() => { dataRef.current = { data, categoryKey, lineKeys: filteredLineKeys }; }, [data, categoryKey, filteredLineKeys]);
  useEffect(() => { prefetchedRef.current.clear(); }, [filteredLineKeys.join(',')]);
  useEffect(() => {
    setZoom(initialZoom);
    setHoveredLine(null);
  }, [lineKeysKey]);

  const handleMouseDown = useCallback((e: any) => {
    if (!e?.activeLabel) return;
    refAreaStartRef.current = e.activeLabel;
    refAreaEndRef.current = undefined;
    isDraggingRef.current = false;
  }, []);

  const handleMouseMove = useCallback((e: any) => {
    if (!refAreaStartRef.current || !e?.activeLabel) return;
    if (e.activeLabel !== refAreaStartRef.current) {
      isDraggingRef.current = true;
      refAreaEndRef.current = e.activeLabel;
      setSelectionBox({ left: refAreaStartRef.current, right: e.activeLabel });
    }
  }, []);

  const handleMouseUp = useCallback((_e: any) => {
    const wasDragging = isDraggingRef.current;
    const start = refAreaStartRef.current;
    const end = refAreaEndRef.current;
    refAreaStartRef.current = undefined;
    refAreaEndRef.current = undefined;
    isDraggingRef.current = false;
    setSelectionBox(null);

    if (!wasDragging || !start || !end) return;

    const { data, categoryKey, lineKeys } = dataRef.current;
    const leftIdx = data.findIndex(d => String(d[categoryKey]) === start);
    const rightIdx = data.findIndex(d => String(d[categoryKey]) === end);
    const [lo, hi] = leftIdx <= rightIdx ? [leftIdx, rightIdx] : [rightIdx, leftIdx];

    const slice = data.slice(lo, hi + 1);
    let min = Infinity, max = -Infinity;
    slice.forEach(row => lineKeys.forEach(key => {
      const v = Number(row[key]);
      if (!isNaN(v)) { if (v < min) min = v; if (v > max) max = v; }
    }));

    const pad = (max - min) * 0.1 || 0.5;
    setZoom({
      left: data[lo][categoryKey],
      right: data[hi][categoryKey],
      bottom: Math.max(0, min - pad),
      top: max + pad,
    });
  }, []);

  const zoomOut = useCallback(() => setZoom(initialZoom), []);
  const isZoomed = zoom.left !== "dataMin" || zoom.right !== "dataMax";

  const { visibleData, yDomain } = useMemo(() => {
    const lo = isZoomed ? data.findIndex(d => String(d[categoryKey]) === String(zoom.left)) : 0;
    const hi = isZoomed ? data.findIndex(d => String(d[categoryKey]) === String(zoom.right)) : data.length - 1;
    const slice = (lo === -1 || hi === -1) ? data : data.slice(Math.min(lo, hi), Math.max(lo, hi) + 1);

    let min = Infinity, max = -Infinity;
    const visibleData = slice.map(row => {
      const extra: Record<string, any> = {};
      filteredLineKeys.forEach(key => {
        extra[`${key}__hit`] = row[key];
        const v = Number(row[key]);
        if (!isNaN(v)) { if (v < min) min = v; if (v > max) max = v; }
      });
      return { ...row, ...extra };
    });

    const step = 0.5;
    const niceMin = Math.floor((isFinite(min) ? min : 0) / step) * step;
    const niceMax = Math.ceil((isFinite(max) ? max : 0) / step) * step;
    const yDomain: [number, number] = [Math.max(0, niceMin), niceMax];

    return { visibleData, yDomain };
  }, [data, categoryKey, filteredLineKeys, isZoomed, zoom.left, zoom.right]);

  const lineHandlers = useMemo(() =>
    Object.fromEntries(
      filteredLineKeys.map(key => {
        const handleMouseEnter = () => {
          setHoveredLine(key);
          if (onLineHover && !prefetchedRef.current.has(key)) {
            prefetchedRef.current.add(key);
            onLineHover(key);
          }
        };
        return [
          key,
          {
            onMouseEnter: handleMouseEnter,
            onMouseLeave: () => setHoveredLine(null),
            onClick: (_: any, event: any) => onLineClick?.(key, event as MouseEvent),
          },
        ];
      })
    ), [filteredLineKeys, onLineClick, onLineHover]);

  const LegendContent = useCallback(({ payload }: any) => <ChartLegendContent payload={payload} className="mt-8" />, []);
  const tooltipFilter = useCallback((item: any) => {
    return !item.dataKey?.toString().endsWith('__hit') && (hoveredLine === null || item.dataKey === hoveredLine)
  }, [hoveredLine]);

  return (
    <ChartCard header={header} className={cn(cardClass)} config={chartConfig}>
      <div className="relative h-full">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/70 backdrop-blur-[2px]">
            <Spinner className="size-4 text-muted-foreground" />
          </div>
        )}

        {/* Info banner + toggle */}
        {(hiddenLineCount > 0 || showAll) && (
          <div className="flex items-center justify-between px-4 pt-2 gap-2">
            <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
              <Info className="size-3 shrink-0" />
              {showAll ? (
                <span>Showing all locations, including {hiddenLineCount} with data in fewer than {minDataPoints} seasons.</span>
              ) : (
                <span>Showing only locations with data in {minDataPoints}+ seasons. {hiddenLineCount} hidden.</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1.5 shrink-0"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  <EyeOff className="size-3.5" />
                  Hide sparse
                </>
              ) : (
                <>
                  <Eye className="size-3.5" />
                  Show all
                </>
              )}
            </Button>
          </div>
        )}

        {isZoomed && (
          <div className="flex justify-end px-4 pt-2">
            <button
              onClick={zoomOut}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Zoom out
            </button>
          </div>
        )}

        <ChartContainer config={chartConfig} className={cn(containerClass, "w-full")}
          style={{ userSelect: "none", cursor: selectionBox ? "crosshair" : "default" }}
        >
          <LineChart
            data={visibleData}
            margin={{ left: 20, right: 80, top: 40, bottom: 20 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <CartesianGrid vertical={false} />
            <XAxis dataKey={categoryKey} tickLine={false} axisLine={false} tickMargin={32} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={16}
              width={80}
              domain={isZoomed ? [zoom.bottom, zoom.top] : yDomain}
              tickCount={5}
              tickFormatter={value => {
                const num = Number(value);
                return `${isNaN(num) ? value : num.toFixed(2)}${valueUnit ? ` ${valueUnit}` : ''}`;
              }}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent filter={tooltipFilter} />} />
            <ChartLegend content={LegendContent} />
            {filteredLineKeys.map((key, i) => {
              const isSparse = sparseLineKeys.includes(key);
              const showDots = showAll && isSparse;
              return (
                <React.Fragment key={key}>
                  {/* Invisible hit area */}
                  <Line
                    {...lineHandlers[key]}
                    dataKey={`${key}__hit`}
                    type="monotone"
                    stroke="transparent"
                    strokeWidth={20}
                    dot={false} activeDot={false}
                    legendType="none" tooltipType="none"
                    connectNulls={false} isAnimationActive={false}
                  />
                  {/* Visible line */}
                  <Line
                    {...lineHandlers[key]}
                    dataKey={key}
                    type="monotone"
                    stroke={filteredColors[i]}
                    strokeWidth={hoveredLine === key ? 3 : 2}
                    strokeOpacity={hoveredLine === null || hoveredLine === key ? 1 : 0.2}
                    dot={showDots ? { r: 4, strokeWidth: 2, fill: filteredColors[i], stroke: 'white' } : false}
                    activeDot={showDots ? { r: 6, strokeWidth: 2 } : false}
                    connectNulls={false}
                    isAnimationActive={true} animationDuration={800}
                  />
                </React.Fragment>
              );
            })}
            {selectionBox && (
              <ReferenceArea
                x1={selectionBox.left}
                x2={selectionBox.right}
                strokeOpacity={0.3}
                fill="hsl(var(--muted))"
                fillOpacity={0.1}
              />
            )}
          </LineChart>
        </ChartContainer>
      </div>
    </ChartCard>
  );
}
