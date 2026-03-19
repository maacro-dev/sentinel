import { ReportBuilder } from "../builder";
import { addKeyValueTable, safeNumber } from "../utils";

export function damageComparativeReport(
  builder: ReportBuilder,
  locationData: any,
  causeData: any
) {
  if (locationData) {
    addKeyValueTable(builder, 'Damage by Location', [
      ['Total Reports', safeNumber(locationData?.total_damage_reports)],
      ['Total Area', `${safeNumber(locationData?.total_affected_area_ha)} ha`],
      ['Highest Count', safeNumber(locationData?.highest_damage_count?.value)],
      ['Highest Area', `${safeNumber(locationData?.highest_affected_area?.value)} ha`],
    ]);
  }

  if (causeData) {
    const rows = causeData?.ranking ?? [];
    if (rows.length) {
      builder.addTable(
        ['Cause', 'Reports', 'Area (ha)'],
        rows.map((c: any) => [
          c.cause ?? '-',
          safeNumber(c.damage_count),
          safeNumber(c.total_affected_area),
        ]),
        'Damage by Cause'
      );
    }
  }
}
