import { ChartConfig } from '@/core/components/ui/chart';
import { DamageByLocationData } from '../schemas/comparative/damage-location';
import { DefaultTicks } from '../components/DefaultTicks';
import { StatCardMinimal } from '../components/StatCard';
import { TickProps } from '../types';
import { BarChart } from '../components/BarChart';
import { Lightbulb } from 'lucide-react';
import { useMemo } from 'react';


export function DamageByLocationView({ data }: { data: DamageByLocationData; }) {

  const chartData = data.ranking.map(item => ({
    location: item.location,
    damage_count: item.damage_count,
    affected_area: Number(item.total_affected_area.toFixed(2)),
  }));

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    data.ranking.forEach(item => {
      config[item.location] = { label: item.location };
    });
    config.damage_count = { label: 'Damage Reports' };
    config.affected_area = { label: 'Affected Area (ha)' };
    return config;
  }, [data]);

  const header = {
    title: 'Damage by Location',
    description: 'Damage reports and affected area per location',
  };

  const totalReports = data.total_damage_reports;
  const totalArea = data.total_affected_area_ha;
  const locationsWithData = data.ranking.length;
  const avgArea = locationsWithData > 0 ? totalArea / locationsWithData : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Stat cards - focused on distribution */}
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
          title="Affected Locations"
          subtitle="Locations with damage"
          current_value={locationsWithData}
          unit="locations"
        />
        <StatCardMinimal
          title="Avg Area per Location"
          subtitle="Mean affected area"
          current_value={Number(avgArea.toFixed(2))}
          unit="ha"
        />
      </div>

      {/* Bar chart of damage counts (horizontal) */}
      <BarChart
        config={chartConfig}
        data={chartData}
        header={header}
        axisKeys={{ X: 'damage_count', Y: 'location' }}
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
          {locationsWithData === 1 ? (
            <>
              Only <span className="font-medium text-foreground">{data.ranking[0].location}</span> has damage,
              with <span className="font-medium text-foreground">{totalReports} report{totalReports !== 1 ? 's' : ''}</span>{' '}
              affecting <span className="font-medium text-foreground">{totalArea.toFixed(2)} ha</span>.
            </>
          ) : (
            <>
              Damage spread across <span className="font-medium text-foreground">{locationsWithData}</span> locations.
              On average, each location has <span className="font-medium text-foreground">{avgArea.toFixed(2)} ha</span> affected.
              The location with most reports is{' '}
              <span className="font-medium text-foreground">{data.highest_damage_count?.location}</span> ({data.highest_damage_count?.value} reports),
              while the largest affected area is{' '}
              <span className="font-medium text-foreground">{data.highest_affected_area?.location}</span> ({data.highest_affected_area?.value.toFixed(2)} ha).
            </>
          )}
        </p>
      </div>
    </div>
  );
}
