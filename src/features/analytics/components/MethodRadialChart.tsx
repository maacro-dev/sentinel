import { CropMethodSummary } from '../schemas/summary/method';
import { ChartConfig } from '@/core/components/ui/chart';
import { RadialBar } from 'recharts';
import { Lightbulb } from 'lucide-react';
import { RadialChart } from './RadialChart/RadialChart';
import { RadialChartDefaults } from './RadialChart/Defaults';

interface MethodRadialChartProps {
  summary: CropMethodSummary;
}

export function MethodRadialChart({ summary }: MethodRadialChartProps) {
  const { direct_seeded_count, transplanted_count, percent_difference } = summary;
  const total = direct_seeded_count + transplanted_count;

  const chartData = [{ method: 'methods', direct: direct_seeded_count, transplant: transplanted_count }];

  const chartConfig = {
    direct: { label: 'Direct‑seeded', color: 'var(--chart-1)' },
    transplant: { label: 'Transplanted', color: 'var(--chart-2)' },
  } satisfies ChartConfig;

  const dominant = direct_seeded_count > transplanted_count ? 'Direct‑seeded' : transplanted_count > direct_seeded_count ? 'Transplanted' : 'Equal';
  const dominantCount = dominant === 'Direct‑seeded' ? direct_seeded_count : dominant === 'Transplanted' ? transplanted_count : 0;
  const dominantPercent = total > 0 ? ((dominantCount / total) * 100).toFixed(1) : '0';

  const percentText =
    dominant === 'Equal'
      ? 'Both methods are equally used.'
      : `${Math.abs(percent_difference).toFixed(1)}% more than the other.`;

  const centerLabel = ({ viewBox }: any) => {
    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
      return (
        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
          <tspan
            x={viewBox.cx}
            y={(viewBox.cy || 0) - 16}
            className="fill-foreground text-xl font-semibold"
          >
            {dominantPercent}%
          </tspan>
          <tspan
            x={viewBox.cx}
            y={(viewBox.cy || 0) + 4}
            className="fill-muted-foreground text-xs"
          >
            of fields
          </tspan>
        </text>
      );
    }
    return null;
  };

  const insightContent = (
    <div className="flex items-start gap-2">
      <Lightbulb className="size-4 mt-0.5 shrink-0" />
      <p>
        {dominant === 'Equal' ? (
          <>Both methods are equally used, each on {direct_seeded_count} fields.</>
        ) : (
          <>
            <span className="font-medium text-foreground">{dominant}</span> is the most used method (
            <span className="font-medium text-foreground">{dominantCount}</span> fields),{' '}
            <span className="font-medium text-foreground">{percentText}</span>
          </>
        )}
      </p>
    </div>
  );

  return (
    <RadialChart
      data={chartData}
      header={{ title: 'Establishment Method', description: 'Most used method this season' }}
      config={chartConfig}
      isEmpty={total === 0}
      containerClass="mx-auto h-fit w-full max-w-55"
      chartProps={{ centerLabel, ...RadialChartDefaults.chart }}
      insight={insightContent}
    >
      <RadialBar dataKey="direct" fill="var(--color-humay)" {...RadialChartDefaults.bar} />
      <RadialBar dataKey="transplant" fill="var(--color-humay-light)" {...RadialChartDefaults.bar} />
    </RadialChart>
  );
}
