import { RiceVarietySummary } from '../schemas/summary/variety';
import { ChartConfig } from '@/core/components/ui/chart';
import { RadialBar } from 'recharts';
import { Lightbulb } from 'lucide-react';
import { RadialChartDefaults } from './RadialChart/Defaults';
import { RadialChart } from './RadialChart/RadialChart';

interface VarietyRadialChartProps {
  summary: RiceVarietySummary;
}

export function VarietyRadialChart({ summary }: VarietyRadialChartProps) {
  const { nsic_count, psb_count, other_count, total, dominant, percent_difference } = summary;

  const chartData = [{ variety: 'varieties', nsic: nsic_count, psb: psb_count, other: other_count }];

  const chartConfig = {
    nsic: { label: 'NSIC', color: 'var(--color-humay-light)' },
    psb: { label: 'PSB', color: 'var(--color-humay)' },
    other: { label: 'Others', color: 'var(--color-humay-3)' },
  } satisfies ChartConfig;

  let dominantLabel: string;
  let dominantCount: number;
  let otherLabel: string;

  if (dominant === 'NSIC') {
    dominantLabel = 'NSIC';
    dominantCount = nsic_count;
    otherLabel = psb_count >= other_count ? 'PSB' : 'Others';
  } else if (dominant === 'PSB') {
    dominantLabel = 'PSB';
    dominantCount = psb_count;
    otherLabel = nsic_count >= other_count ? 'NSIC' : 'Others';
  } else if (dominant === 'Others') {
    dominantLabel = 'Others';
    dominantCount = other_count;
    otherLabel = nsic_count >= psb_count ? 'NSIC' : 'PSB';
  } else {
    dominantLabel = 'None';
    dominantCount = 0;
    otherLabel = '';
  }

  const dominantPercent = total > 0 ? ((dominantCount / total) * 100).toFixed(1) : '0';
  const percentText =
    percent_difference > 0
      ? `${percent_difference.toFixed(1)}% more than ${otherLabel}`
      : 'Only one variety used';

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

  return (
    <div className="flex flex-col">
      <RadialChart
        data={chartData}
        header={{ title: 'Rice Variety', description: 'Most used variety this season' }}
        config={chartConfig}
        isEmpty={total === 0}
        containerClass="mx-auto h-fit w-full max-w-55"
        chartProps={{
          centerLabel,
          ...RadialChartDefaults.chart,
          barGap: 30, // custom prop from original
        }}
      >
        <RadialBar dataKey="psb" fill="var(--color-psb)" {...RadialChartDefaults.bar} />
        <RadialBar dataKey="other" fill="var(--color-other)" {...RadialChartDefaults.bar} />
        <RadialBar dataKey="nsic" fill="var(--color-nsic)" {...RadialChartDefaults.bar} />
      </RadialChart>

      <div className="flex items-start gap-2 text-sm text-muted-foreground/75 pt-1.5">
        <Lightbulb className="size-4 mt-0.5 shrink-0" />
        <p>
          {dominantLabel === 'None' ? (
            <>No clear dominant variety.</>
          ) : percent_difference > 0 ? (
            <>
              <span className="font-medium text-foreground">{dominantLabel}</span> is the most used variety (
              <span className="font-medium text-foreground">{dominantCount}</span> fields),{' '}
              <span className="font-medium text-foreground">{percentText}</span>
            </>
          ) : (
            <>Only <span className="font-medium text-foreground">{dominantLabel}</span> used.</>
          )}
        </p>
      </div>
    </div>
  );
}
