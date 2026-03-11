import { Spinner } from '@/core/components/ui/spinner';
import { Lightbulb } from 'lucide-react';
import { YieldVarietyData } from '@/features/analytics/schemas/comparative/yield-variety';
import { useState, useMemo, useCallback } from 'react';
import { BarChart } from '@/features/analytics/components/BarChart';
import { ChartConfig } from '@/core/components/ui/chart';
import { DefaultTicks } from '@/features/analytics/components/DefaultTicks';
import { TickProps } from '@/features/analytics/types';
import { cn } from '@/core/utils/style';

const GROUP_KEYS = ['NSIC', 'PSB', 'Others'] as const;
type GroupKey = typeof GROUP_KEYS[number];

interface GroupedDataItem {
  group: GroupKey;
  yield: number;
  count: number;
  varieties: YieldVarietyData['ranking'];
}

export function YieldByVarietyView({ data, isLoading }: { data?: YieldVarietyData; isLoading: boolean }) {
  const [selectedGroup, setSelectedGroup] = useState<GroupKey | null>(null);

  const groupedData = useMemo((): GroupedDataItem[] => {
    if (!data?.ranking.length) return [];

    const groups: Record<GroupKey, { totalYield: number; count: number; varieties: typeof data.ranking }> = {
      NSIC: { totalYield: 0, count: 0, varieties: [] },
      PSB: { totalYield: 0, count: 0, varieties: [] },
      Others: { totalYield: 0, count: 0, varieties: [] },
    };

    data.ranking.forEach(item => {
      const variety = item.variety.toLowerCase();
      if (variety.includes('nsic')) {
        groups.NSIC.totalYield += item.yield;
        groups.NSIC.count += 1;
        groups.NSIC.varieties.push(item);
      } else if (variety.includes('psb')) {
        groups.PSB.totalYield += item.yield;
        groups.PSB.count += 1;
        groups.PSB.varieties.push(item);
      } else {
        groups.Others.totalYield += item.yield;
        groups.Others.count += 1;
        groups.Others.varieties.push(item);
      }
    });

    return GROUP_KEYS.map(group => ({
      group,
      yield: groups[group].count > 0 ? groups[group].totalYield / groups[group].count : 0,
      count: groups[group].count,
      varieties: groups[group].varieties,
    }));
  }, [data]);

  const selectedGroupData = selectedGroup ? groupedData.find(g => g.group === selectedGroup) : null;

  // Prepare data for the chart (either grouped averages or individual varieties)
  const chartData = useMemo(() => {
    if (selectedGroupData) {
      return selectedGroupData.varieties.map(v => ({
        group: v.variety,
        yield: Number(v.yield.toFixed(2)),
      }));
    }
    return groupedData.map(item => ({
      group: item.group,
      yield: Number(item.yield.toFixed(2)),
    }));
  }, [groupedData, selectedGroupData]);

  // Chart config
  const baseChartConfig: ChartConfig = {
    NSIC: { label: 'NSIC' },
    PSB: { label: 'PSB' },
    Others: { label: 'Others' },
    yield: { label: 'Yield (t/ha)' },
  };

  const drillDownChartConfig = useMemo((): ChartConfig => {
    if (!selectedGroupData) return baseChartConfig;
    const varietyConfig = selectedGroupData.varieties.reduce((acc, v) => {
      acc[v.variety] = { label: v.variety };
      return acc;
    }, {} as ChartConfig);
    return { ...varietyConfig, yield: { label: 'Yield (t/ha)' } };
  }, [selectedGroupData]);

  const handleBarClick = useCallback((item: any) => {
    const group = item?.group ?? item?.payload?.group;
    if (!group) return;

    if (selectedGroup !== null) {
      setSelectedGroup(null);
      return;
    }

    const clickedGroup = groupedData.find(g => g.group === group);
    if (clickedGroup) {
      setSelectedGroup(clickedGroup.group);
    }
  }, [groupedData, selectedGroup]);

  // Compute insight text
  const insightContent = useMemo(() => {
    if (!data || groupedData.length === 0) return null;
    const groupsWithYield = groupedData.filter(g => g.yield > 0);
    if (groupsWithYield.length === 0) {
      return "No yield data available for any variety.";
    }
    if (groupsWithYield.length === 1) {
      const g = groupsWithYield[0];
      return `Only ${g.group} has data, with average yield ${g.yield.toFixed(2)} t/ha across ${g.count} fields.`;
    }
    const highest = groupsWithYield.reduce((max, g) => g.yield > max.yield ? g : max);
    const lowest = groupsWithYield.reduce((min, g) => g.yield < min.yield ? g : min);
    const gap = ((highest.yield - lowest.yield) / highest.yield) * 100;
    return (
      <>
        <span className="font-medium text-foreground">{highest.group}</span> leads with{' '}
        <span className="font-medium text-foreground">{highest.yield.toFixed(2)} t/ha</span> average yield across{' '}
        <span className="font-medium text-foreground">{highest.count}</span> fields, outperforming{' '}
        <span className="font-medium text-foreground">{lowest.group}</span> by{' '}
        <span className="font-medium text-foreground">{gap.toFixed(1)}%</span>.
      </>
    );
  }, [groupedData, data]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Return pill when in drill-down */}
      <div
        className={cn(
          "absolute left-1/2 transform -translate-x-1/2 top-8 z-10 transition-all duration-300 ease-in-out",
          selectedGroup ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <span
          className="bg-muted text-foreground px-4 py-2 rounded-full text-xs shadow-sm cursor-pointer"
          onClick={() => setSelectedGroup(null)}
        >
          Click any bar to return
        </span>
      </div>

      <BarChart
        data={chartData}
        header={{ title: 'Yield By Variety', description: 'Rice variety yield performance ranking' }}
        axisKeys={{ X: 'group', Y: 'yield' }}
        config={selectedGroup ? drillDownChartConfig : baseChartConfig}
        isEmpty={groupedData.every(d => d.yield === 0)}
        onBarClick={handleBarClick}
        cardClass="min-h-120"
        axisOptions={{
          X: {
            interval: 0,
            tick: ({ x, y, payload }: TickProps) => <DefaultTicks x={x} y={y} payload={payload} />,
          },
          Y: {
            tickFormatter: (value: number) => `${value.toFixed(2)} t/ha`,
          },
        }}
      />

      {/* Insight footer */}
      {data && insightContent && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground pt-2">
          <Lightbulb className="size-4 mt-0.5 shrink-0" />
          <p>{insightContent}</p>
        </div>
      )}
    </div>
  );
}
