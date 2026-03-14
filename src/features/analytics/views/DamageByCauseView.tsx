
import { ChartConfig } from '@/core/components/ui/chart';
import { DamageByCauseData } from '../schemas/comparative/damage-cause';
import { DefaultTicks } from '../components/DefaultTicks';
import { StatCardMinimal } from '../components/StatCard';
import { TickProps } from '../types';
import { BarChart } from '../components/BarChart';
import { Lightbulb } from 'lucide-react';
import { useMemo } from 'react';


export function DamageByCauseView({ data }: { data: DamageByCauseData }) {

  const chartData = data.ranking.map(item => ({
    cause: item.cause,
    damage_count: item.damage_count,
    affected_area: Number(item.total_affected_area.toFixed(2)),
  }));

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data.ranking.forEach(item => {
      config[item.cause] = { label: item.cause };
    });
    config.damage_count = { label: 'Damage Reports' };
    config.affected_area = { label: 'Affected Area (ha)' };
    return config;
  }, [data]);

  const header = {
    title: 'Damage by Cause',
    description: 'Damage reports and affected area per cause',
  };

  const totalReports = data.total_damage_reports;
  const totalArea = data.total_affected_area_ha;
  const highestCount = data.highest_damage_count;
  const highestArea = data.highest_affected_area;
  const causeCount = data.ranking.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Stat cards - focused on top causes */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <StatCardMinimal
          title="Total Reports"
          subtitle="All damage incidents"
          current_value={totalReports}
          unit="reports"
        />
        <StatCardMinimal
          title="Total Affected Area"
          subtitle="Sum of affected area"
          current_value={Number(totalArea.toFixed(2))}
          unit="ha"
        />
        <StatCardMinimal
          title="Most Frequent Cause"
          subtitle={highestCount?.cause ?? 'N/A'}
          current_value={highestCount?.value ?? 0}
          unit="reports"
        />
        <StatCardMinimal
          title="Largest Area Cause"
          subtitle={highestArea?.cause ?? 'N/A'}
          current_value={highestArea ? Number(highestArea.value.toFixed(2)) : 0}
          unit="ha"
        />
      </div>

      {/* Horizontal bar chart: cause on Y, count on X */}
      <BarChart
        config={chartConfig}
        data={chartData}
        header={header}
        axisKeys={{ X: 'damage_count', Y: 'cause' }}
        layout="vertical"
        isEmpty={chartData.every(d => d.damage_count === 0)}
        activeBar={{}}
        axisOptions={{
          X: {
            interval: 0,
            tick: ({ x, y, payload }: TickProps) => <DefaultTicks x={x} y={y} payload={payload} />,
          },
          Y: {
            tickFormatter: (value: string) => value,
          },
        }}
        cardClass="min-h-120"
      />

      {/* Insight tip */}
      <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
        <Lightbulb className="size-4 mt-0.5 shrink-0" />
        <p>
          {causeCount === 1 ? (
            <>
              Only <span className="font-medium text-foreground">{data.ranking[0].cause}</span> is recorded,
              with <span className="font-medium text-foreground">{totalReports} report{totalReports !== 1 ? 's' : ''}</span>{' '}
              affecting <span className="font-medium text-foreground">{totalArea.toFixed(2)} ha</span>.
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">{highestCount?.cause}</span> is the most frequent ({highestCount?.value} reports),
              while <span className="font-medium text-foreground">{highestArea?.cause}</span> causes the largest area ({highestArea?.value.toFixed(2)} ha).
              In total, <span className="font-medium text-foreground">{causeCount}</span> distinct causes account for{' '}
              <span className="font-medium text-foreground">{totalReports}</span> reports and{' '}
              <span className="font-medium text-foreground">{totalArea.toFixed(2)} ha</span>.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
