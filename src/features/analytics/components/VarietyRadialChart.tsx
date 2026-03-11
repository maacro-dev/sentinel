import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/core/components/ui/chart';
import { RadialBarChart, PolarRadiusAxis, RadialBar, Label } from 'recharts';
import { ChartCard } from './ChartCard';
import { Lightbulb } from 'lucide-react';
import { RiceVarietySummary } from '../schemas/summary/variety';

interface VarietyRadialChartProps {
  summary: RiceVarietySummary;
}

export function VarietyRadialChart({ summary }: VarietyRadialChartProps) {
  const { nsic_count, psb_count, other_count, total, dominant, percent_difference } = summary;

  const chartData = [{ variety: 'varieties', nsic: nsic_count, psb: psb_count, other: other_count }];

  const chartConfig = {
    nsic: {
      label: 'NSIC',
      color: 'var(--color-humay-light)',
    },
    psb: {
      label: 'PSB',
      color: 'var(--color-humay)',
    },
    other: {
      label: 'Others',
      color: 'var(--color-humay-3)',
    },
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
    // dominant === 'None'
    dominantLabel = 'None';
    dominantCount = 0;
    otherLabel = '';
  }

  const dominantPercent = total > 0 ? ((dominantCount / total) * 100).toFixed(1) : '0';

  const percentText =
    percent_difference > 0
      ? `${percent_difference.toFixed(1)}% more than ${otherLabel}`
      : 'Only one variety used';

  return (
    <ChartCard header={{ title: 'Rice Variety', description: 'Most used variety this season' }}>
      <ChartContainer config={chartConfig} className="mx-auto h-fit w-full max-w-55">
        <RadialBarChart data={chartData} endAngle={180} innerRadius={60} outerRadius={100} cy="80%" barGap={30}>
          <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
          <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
            <Label
              content={({ viewBox }) => {
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
              }}
            />
          </PolarRadiusAxis>
          <RadialBar
            barSize={16}
            dataKey="psb"
            stackId="a"
            cornerRadius={5}
            fill="var(--color-psb)"
            className="stroke-transparent stroke-2"
            animationDuration={600}
          />
          <RadialBar
            barSize={16}
            dataKey="other"
            stackId="a"
            cornerRadius={5}
            fill="var(--color-other)"
            className="stroke-transparent stroke-2"
            animationDuration={600}
          />
          <RadialBar
            barSize={16}
            dataKey="nsic"
            stackId="a"
            cornerRadius={5}
            fill="var(--color-nsic)"
            className="stroke-transparent stroke-2"
            animationDuration={600}
          />
        </RadialBarChart>
      </ChartContainer>

      {/* Insight footer */}
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
    </ChartCard>
  );
}
