import { JSX, memo, useCallback, useMemo } from 'react';
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis,
  CartesianGrid, LabelList, Cell,
  BarRectangleItem,
  Rectangle,
} from 'recharts';
import { ChartCard, ChartCardProps } from '../ChartCard';
import { ChartContainer, ChartLegend, ChartTooltip } from '@/core/components/ui/chart';
import { cn } from '@/core/utils/style';
import { Global } from '@/core/config';
import { chartContainerDefaults } from '../../config';
import { AxisOptions, ChartHeader } from '../../types';
import { BarChartDefaults } from '../BarChart/Defaults';

const LegendContent = memo(({ payload }: { payload?: any[] }) => {
  if (!payload?.length) return null;
  return (
    <div className="flex justify-center gap-4 pt-2 pb-1">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color }} />
          <span className="text-xs text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
});

const renderLegend = (props: any) => <LegendContent payload={props.payload} />;

interface GroupedBarChartProps<T> {
  data: T[];
  header: ChartHeader;
  categoryKey: keyof T;
  barKeys: Array<{ key: keyof T; name: string; color: string }>;
  getBarSize?: () => number;
  isEmpty?: boolean;
  containerClass?: string;
  cardClass?: string;
  layout?: 'vertical' | 'horizontal';
  options?: ChartCardProps['options'];
  axisOptions?: AxisOptions;
  onBarClick?: (item: any) => void;
  onBarHover?: (data: BarRectangleItem, index: number, event: React.MouseEvent<SVGPathElement, MouseEvent>) => void;
  activeBar?: string | null;
  labelFormatter?: (value: any) => string;
  valueUnit?: string;
  isLoading?: boolean;
}

export const GroupedBarChart = memo(<T extends object>({
  data,
  header,
  categoryKey,
  barKeys,
  isEmpty = false,
  containerClass,
  cardClass,
  layout = 'vertical',
  options,
  getBarSize = () => 24,
  axisOptions,
  onBarClick,
  onBarHover,
  activeBar,
  labelFormatter,
  valueUnit = '',
  // isLoading = false,
}: GroupedBarChartProps<T>) => {
  const isVertical = layout === 'vertical';

  const config = useMemo(
    () => barKeys.reduce((acc, { key, name, color }) => {
      acc[key as string] = { label: name, color };
      return acc;
    }, {} as Record<string, { label: string; color: string }>),
    [barKeys],
  );

  const margins = useMemo(
    () => isVertical
      ? { ...BarChartDefaults.margins, left: 60, right: 80, bottom: 20, top: 20 }
      : { ...BarChartDefaults.margins, bottom: 80, left: 40, top: 60, right: 40 },
    [isVertical],
  );

  const resolvedBarSize = useMemo(() => {
    const base = getBarSize();
    return barKeys.length > 1 ? Math.max(10, Math.floor(base / barKeys.length)) : base;
  }, [getBarSize, barKeys.length]);


  const explicitHeight = useMemo(() => {
    if (!isVertical) return undefined;
    const barsHeight = resolvedBarSize * barKeys.length;
    const gapsHeight = (barKeys.length - 1) * 6;
    const rowHeight = barsHeight + gapsHeight + 48;
    return Math.max(300, data.length * rowHeight);
  }, [isVertical, resolvedBarSize, barKeys.length, data.length]);


  const containerStyle = isVertical ? { height: explicitHeight } : undefined;

  const containerClassName = cn(
    !isVertical && chartContainerDefaults.className,
    containerClass,
    'w-full',
  );

  const defaultFormatter = useCallback((value: any) => {
    if (value === 0 || value === '0') return 'N/A';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return String(value);
    const formatted = labelFormatter ? labelFormatter(value) : num.toFixed(2);
    if (formatted === 'N/A') return 'N/A';
    return valueUnit ? `${formatted} ${valueUnit}` : formatted;
  }, [labelFormatter, valueUnit]);

  const handleMouseEnter = useCallback(
    (data: BarRectangleItem, index: number, event: React.MouseEvent<SVGPathElement, MouseEvent>) => onBarHover?.(data, index, event),
    [onBarHover],
  );

  const xAxisType = isVertical ? 'number' : 'category';
  const yAxisType = isVertical ? 'category' : 'number';
  const dataKeyX = isVertical ? undefined : categoryKey as string;
  const dataKeyY = isVertical ? categoryKey as string : undefined;
  const labelPosition = isVertical ? 'right' : 'top';

  return (
    <ChartCard header={header} className={cn(cardClass)} options={options} config={config}>
      {isEmpty ? (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          {Global.NO_DATA_MESSAGE}
        </div>
      ) : (
        <ChartContainer config={config} className={containerClassName} style={containerStyle}>
          <RechartsBarChart
            data={data}
            layout={layout}
            {...BarChartDefaults.barChart}
            margin={margins}
            barCategoryGap="10%"
            barGap={6}
          >
            <CartesianGrid vertical={isVertical} horizontal={!isVertical} strokeDasharray="3 3" />
            <XAxis
              type={xAxisType}
              dataKey={dataKeyX}
              {...BarChartDefaults.axis}
              {...axisOptions?.X}
              tickMargin={20}
            />
            <YAxis
              type={yAxisType}
              dataKey={dataKeyY}
              width={isVertical ? 100 : undefined}
              {...BarChartDefaults.axis}
              {...axisOptions?.Y}
            />
            {barKeys.length > 1 && (
              <ChartLegend verticalAlign='top' wrapperStyle={{ paddingBottom: 20 }} content={renderLegend} />
            )}
            <ChartTooltip {...BarChartDefaults.tooltip} />
            {barKeys.map(({ key, name, color }) => (
              <Bar
                key={key as string}
                dataKey={key as string}
                name={name}
                barSize={resolvedBarSize}
                radius={BarChartDefaults.bar.radius as [number, number, number, number]}
                fill={color}
                shape={(props: any) => <ZeroAwareBar {...props} layout={layout} barSize={resolvedBarSize} />}
                isAnimationActive={true}
                animationDuration={BarChartDefaults.barChart.animationDuration}
                onClick={onBarClick}
                onMouseEnter={handleMouseEnter}
                cursor={onBarClick ? 'pointer' : 'default'}
              >
                {data.map((entry, index) => {
                  const hasActive = activeBar != null && activeBar !== '';
                  const isActive = hasActive && (entry as any)[categoryKey] === activeBar;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={color}
                      opacity={isActive ? '100%' : hasActive ? '75%' : '100%'}
                      stroke={isActive ? 'var(--color-humay-active)' : 'none'}
                      strokeWidth={isActive ? 3 : 0}
                    />
                  );
                })}
                <LabelList
                  dataKey={key as string}
                  position={labelPosition}
                  fontSizeAdjust={0.4}
                  offset={16}
                  className="fill-foreground"
                  fontSize={14}
                  formatter={defaultFormatter}
                />
              </Bar>
            ))}
          </RechartsBarChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}) as <T extends object>(props: GroupedBarChartProps<T>) => JSX.Element;



const ZeroAwareBar = (props: any) => {
  const { x, y, width, height, value, fill, ...rest } = props;
  if (value === 0 || value == null) {
    const stubHeight = 4;
    const stubY = props.layout === 'vertical'
      ? y + (height - stubHeight) / 2
      : y + height - stubHeight;
    return (
      <Rectangle
        {...rest}
        x={x}
        y={stubY}
        width={props.layout === 'vertical' ? stubHeight : width}
        height={props.layout === 'vertical' ? props.barSize ?? 16 : stubHeight}
        fill={fill}
        opacity={0.25}
        radius={2}
      />
    );
  }
  return <Rectangle {...props} x={x} y={y} width={width} height={height} fill={fill} />;
};
