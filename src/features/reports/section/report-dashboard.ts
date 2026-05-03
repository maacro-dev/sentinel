import { DashboardData } from "@/features/analytics/types";
import { ReportBuilder } from "../builder";
import { topAndBottom, safeNumber } from "../utils";

export function dashboardReport(builder: ReportBuilder, data: DashboardData) {
  const seasonalStats = data?.seasonalStats;
  if (seasonalStats) {
    let hasAnyPreviousData = false;
    hasAnyPreviousData = seasonalStats.some((s: any) => {
      const prev = s.previous_value;
      return prev != null && prev !== 0;
    });
    const previousColumnLabel = hasAnyPreviousData ? 'Previous Season' : 'Previous Season (No Data)';

    const metricMap: Record<string, { label: string; unit: string }> = {
      field_count: { label: 'Field Count', unit: '' },
      form_submission: { label: 'Forms Submitted', unit: '' },
      yield: { label: 'Avg Yield', unit: 't/ha' },
      harvested_area: { label: 'Harvested Area', unit: 'ha' },
      irrigation: { label: 'Irrigation Issues', unit: 'fields' },
      data_completeness: { label: 'Approved Forms', unit: '' },
      damage_report: { label: 'Damage Report', unit: '' },
      pest_report: { label: 'Pest Report', unit: '' },
    };

    const comparisonRows: [string, string, string][] = [];
    seasonalStats.forEach((s: any) => {
      const key = s.name;
      if (metricMap[key]) {
        const current = s.current_value ?? 0;
        const currentStr = `${current}${metricMap[key].unit ? ` ${metricMap[key].unit}` : ''}`;
        let previousStr: string;
        if (!hasAnyPreviousData) {
          previousStr = 'No Data';
        } else {
          const prev = s.previous_value ?? 0;
          previousStr = `${prev}${metricMap[key].unit ? ` ${metricMap[key].unit}` : ''}`;
        }
        comparisonRows.push([metricMap[key].label, currentStr, previousStr]);
      }
    });

    if (comparisonRows.length > 0) {
      builder.addTable(
        ['Metric', 'Current Season', previousColumnLabel],
        comparisonRows,
        'Season Comparison'
      );
    }
  }

  const rankings = data?.barangayYieldRanking?.ranking ?? [];
  if (rankings.length) {
    const { top, bottom } = topAndBottom(rankings, (r) => safeNumber(r.avg_yield_t_per_ha), 5);

    if (top.length) {
      builder.addTable(
        ['Province', 'Municipality', 'Barangay', 'Yield (t/ha)'],
        top.map((r: any) => [
          r.province ?? '-',
          r.barangay ?? '-',
          r.municipality ?? '-',
          safeNumber(r.avg_yield_t_per_ha),
        ]),
        'Top Barangays'
      );
    }

    if (bottom.length) {
      builder.addTable(
        ['Province', 'Municipality', 'Barangay', 'Yield (t/ha)'],
        bottom.map((r: any) => [
          r.province ?? '-',
          r.barangay ?? '-',
          r.municipality ?? '-',
          safeNumber(r.avg_yield_t_per_ha),
        ]),
        'Lowest Barangays'
      );
    }
  } else {
    builder.addSubheading("Barangay Yield Ranking", 8)
    builder.addParagraph("Insufficient ")
  }
}
