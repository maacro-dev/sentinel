import { CropMethodSummary } from '../schemas/summary/method';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/core/components/ui/chart';
import { RadialBarChart, PolarRadiusAxis, RadialBar, Label } from 'recharts';
import { ChartCard } from './ChartCard';
import { Lightbulb } from 'lucide-react';

interface MethodRadialChartProps {
  summary: CropMethodSummary;
}

export function MethodRadialChart({ summary }: MethodRadialChartProps) {
  const { direct_seeded_count, transplanted_count, percent_difference } = summary;
  const total = direct_seeded_count + transplanted_count;

  const chartData = [{ method: 'methods', direct: direct_seeded_count, transplant: transplanted_count }];

  const chartConfig = {
    direct: {
      label: 'Direct‑seeded',
      color: 'var(--chart-1)',
    },
    transplant: {
      label: 'Transplanted',
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig;

  const dominant = direct_seeded_count > transplanted_count ? 'Direct‑seeded' : transplanted_count > direct_seeded_count ? 'Transplanted' : 'Equal';
  const dominantCount = dominant === 'Direct‑seeded' ? direct_seeded_count : dominant === 'Transplanted' ? transplanted_count : 0;

  const dominantPercent = total > 0 ? ((dominantCount / total) * 100).toFixed(1) : '0';

  const percentText =
    dominant === 'Equal'
      ? 'Both methods are equally used.'
      : `${Math.abs(percent_difference).toFixed(1)}% more than the other.`;

  return (
    <ChartCard header={{ title: 'Establishment Method', description: 'Most used method this season' }}>
      <ChartContainer config={chartConfig} className="mx-auto h-fit w-full max-w-55">
        <RadialBarChart data={chartData} endAngle={180} innerRadius={60} outerRadius={100} cy="80%">
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
                        className="fill-foreground text-xl font-semi"
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
            dataKey="direct"
            stackId="a"
            cornerRadius={5}
            fill="var(--color-humay)"
            className="stroke-transparent stroke-2"
            animationDuration={600}
          />
          <RadialBar
            barSize={16}
            dataKey="transplant"
            stackId="a"
            cornerRadius={5}
            fill="var(--color-humay-light)"
            className="stroke-transparent stroke-2"
            animationDuration={600}
          />
        </RadialBarChart>
      </ChartContainer>

      <div className="flex items-start gap-2 text-sm text-muted-foreground/75 pt-1.5">
        <Lightbulb className="size-4 mt-0.5 shrink-0" />
        <p>
          {dominant === 'Equal' ? (
            <>Both methods are equally used, each on {direct_seeded_count} fields.</>
          ) : (
            <>
              <span className="font-meduum text-foreground">{dominant}</span> is the most used method (
              <span className="font-medium text-foreground">{dominantCount}</span> fields),{' '}
              <span className="font-medium text-foreground">{percentText}</span>
            </>
          )}
        </p>
      </div>
    </ChartCard>
  );
}
