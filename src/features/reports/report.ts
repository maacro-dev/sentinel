import { QueryClient } from '@tanstack/react-query';
import { formatSeasonLabel } from '@/features/fields/util';
import { Seasons } from '../fields/services/Seasons';
import { SupabaseClient } from '@supabase/supabase-js';

const defaultFilters = {
  seasonId: 0,
  province: undefined,
  municipality: undefined,
  barangay: undefined,
  method: undefined,
  variety: undefined,
};

export async function generateFullReport(
  seasonId: number,
  queryClient: QueryClient,
  supabase: SupabaseClient,
  userName?: string,
) {
  const season = await Seasons.getById(seasonId);
  const seasonLabel = season ? formatSeasonLabel(season) : `Season ${seasonId}`;

  const {
    dashboardDataOptions,
    dataCollectionTrendOptions,
    formCountSummaryOptions,
    formProgressSummaryOptions,
    descriptiveAnalyticsDataOptions,
    yieldByLocationOptions,
    yieldByMethodOptions,
    yieldByVarietyOptions,
    damageByLocationOptions,
    damageByCauseOptions,
  } = await import('@/features/analytics/queries/options');

  const filters = { ...defaultFilters, seasonId };

  const [
    dashboardData,
    _formsTrendData,
    formsCountData,
    formsProgressData,
    descriptiveData,
    yieldLocationData,
    yieldMethodData,
    yieldVarietyData,
    damageLocationData,
    damageCauseData,
  ] = await Promise.allSettled([
    queryClient.fetchQuery(dashboardDataOptions(seasonId)),
    queryClient.fetchQuery(dataCollectionTrendOptions(seasonId)),
    queryClient.fetchQuery(formCountSummaryOptions(seasonId)),
    queryClient.fetchQuery(formProgressSummaryOptions(seasonId)),
    queryClient.fetchQuery(descriptiveAnalyticsDataOptions(seasonId)),
    queryClient.fetchQuery(yieldByLocationOptions(filters)),
    queryClient.fetchQuery(yieldByMethodOptions(filters)),
    queryClient.fetchQuery(yieldByVarietyOptions(filters)),
    queryClient.fetchQuery(damageByLocationOptions(filters)),
    queryClient.fetchQuery(damageByCauseOptions(filters)),
  ]);

  const { loadLogoBase64 } = await import('./utils');
  const { ReportBuilder } = await import('./builder');

  const logoBase64 = await loadLogoBase64();
  const builder = new ReportBuilder(logoBase64);
  builder.addHeader('Comprehensive Analytics Report', seasonLabel);

  let addedAnySection = false;

  const addPageBreakIfNeeded = () => {
    if (addedAnySection) builder.addPageBreak();
  };

  if (dashboardData.status === 'fulfilled') {
    addPageBreakIfNeeded();
    builder.addSectionTitle('Overall Summary');
    const { dashboardReport } = await import('./section/report-dashboard');
    dashboardReport(builder, dashboardData.value);
    addedAnySection = true;
  }

  if (formsProgressData.status === 'fulfilled' || formsCountData.status === 'fulfilled') {
    addPageBreakIfNeeded();
    builder.addSectionTitle('Data Collection Overview');
    const { dataCollectionReport } = await import('./section/report-collection');
    dataCollectionReport(
      builder,
      formsProgressData.status === 'fulfilled' ? formsProgressData.value : null,
      formsCountData.status === 'fulfilled' ? formsCountData.value : null
    );
    addedAnySection = true;
  }

  if (descriptiveData.status === 'fulfilled') {
    addPageBreakIfNeeded();
    builder.addSectionTitle('Descriptive Analytics');
    const { descriptiveReport } = await import('./section/report-descriptive');
    descriptiveReport(builder, descriptiveData.value);
    addedAnySection = true;
  }

  if (
    yieldLocationData.status === 'fulfilled' ||
    yieldMethodData.status === 'fulfilled' ||
    yieldVarietyData.status === 'fulfilled'
  ) {
    addPageBreakIfNeeded();
    builder.addSectionTitle('Comparative Analytics – Yield');
    const { yieldComparativeReport } = await import('./section/report-yield-comparative');
    yieldComparativeReport(
      builder,
      yieldLocationData.status === 'fulfilled' ? yieldLocationData.value : null,
      yieldMethodData.status === 'fulfilled' ? yieldMethodData.value : null,
      yieldVarietyData.status === 'fulfilled' ? yieldVarietyData.value : null
    );
    addedAnySection = true;
  }

  if (damageLocationData.status === 'fulfilled' || damageCauseData.status === 'fulfilled') {
    addPageBreakIfNeeded();
    builder.addSectionTitle('Comparative Analytics – Damage');
    const { damageComparativeReport } = await import('./section/report-damage-comparative');
    damageComparativeReport(
      builder,
      damageLocationData.status === 'fulfilled' ? damageLocationData.value : null,
      damageCauseData.status === 'fulfilled' ? damageCauseData.value : null
    );
    addedAnySection = true;
  }

  console.log(builder.getLog());
  builder.addExportMetadata(userName);
  builder.save('humay-full-report.pdf');

  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;

  await supabase.from('activity_logs').insert({
    occurred_at: new Date().toISOString(),
    user_id: userId || null,
    event_type: 'report_exported',
    table_name: null,
    record_id: seasonId.toString(),
    action: 'export',
    details: {
      report_type: 'full',
      season_id: seasonId,
      season_label: seasonLabel,
      exported_by: userName || 'Unknown user',
      sections_included: [
        dashboardData.status === 'fulfilled' ? 'summary' : null,
        formsProgressData.status === 'fulfilled' || formsCountData.status === 'fulfilled' ? 'collection' : null,
        descriptiveData.status === 'fulfilled' ? 'descriptive' : null,
        (yieldLocationData.status === 'fulfilled' || yieldMethodData.status === 'fulfilled' || yieldVarietyData.status === 'fulfilled') ? 'yield' : null,
        (damageLocationData.status === 'fulfilled' || damageCauseData.status === 'fulfilled') ? 'damage' : null,
      ].filter(Boolean),
    }
  });
}
