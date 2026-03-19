import { ReportBuilder } from "../builder";
import { addKeyValueTable, safeNumber } from "../utils";

export function yieldComparativeReport(
  builder: ReportBuilder,
  locationData: any,
  methodData: any,
  varietyData: any
) {
  if (locationData) {
    addKeyValueTable(builder, 'Yield by Location', [
      ['Average Yield', `${safeNumber(locationData?.average_yield)} t/ha`],
      ['Highest', `${safeNumber(locationData?.highest_yield?.value)} t/ha`],
      ['Lowest', `${safeNumber(locationData?.lowest_yield?.value)} t/ha`],
      ['Gap', `${safeNumber(locationData?.gap_percentage)} %`],
    ]);
  }

  if (methodData) {
    const direct = methodData?.ranking?.find((m: any) => m.method === 'direct-seeded');
    const transplanted = methodData?.ranking?.find((m: any) => m.method === 'transplanted');
    addKeyValueTable(builder, 'Yield by Method', [
      ['Direct-seeded Avg', `${safeNumber(direct?.yield)} t/ha`],
      ['Transplanted Avg', `${safeNumber(transplanted?.yield)} t/ha`],
      ['Gap', `${safeNumber(methodData?.gap_percentage)} %`],
    ]);
  }

  if (varietyData) {
    const rows = varietyData?.ranking ?? [];
    if (rows.length) {
      builder.addTable(
        ['Variety', 'Avg Yield (t/ha)'],
        rows.map((v: any) => [v.variety ?? '-', safeNumber(v.yield)]),
        'Top Varieties'
      );
    }
  }
}
