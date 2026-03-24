// @ts-nocheck

import { RefreshCw } from "lucide-react";
import { PageContainer } from '@/core/components/layout';
import { Spinner } from '@/core/components/ui/spinner';
import { createCrumbLoader } from '@/core/utils/breadcrumb';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import { usePredictedYieldByLocation } from '@/features/analytics/hooks/usePredictiveAnalytics';
import { PredictedYieldByLocationView } from '@/features/analytics/views/predictive/PredictiveYieldByLocationView';
import { useYieldForecast } from '@/features/analytics/hooks/useYieldForecast';
import { YieldForecastView } from '@/features/analytics/views/predictive/YieldForecastView';
import { Button } from '@/core/components/ui/button';
import { usePredictForms } from '@/features/analytics/hooks/usePredictForms';

export const Route = createFileRoute("/_manager/_analytics/predictive")({
  component: RouteComponent,
  loader: () => ({ breadcrumb: createCrumbLoader({ label: "Predictive Analytics" }) }),
  head: () => ({ meta: [{ title: "Predictive Analytics | Humay" }] }),
});

type PredictiveView = 'location' | 'variety' | 'soil' | 'soil-variety' | 'year' | 'distribution';

function RouteComponent() {
  const { seasonId } = Route.useSearch();
  const [view, setView] = useState<PredictiveView>('forecast');

  const [location, setLocation] = useState({ province: '', municipality: '', barangay: '' });
  const [moreFilters, setMoreFilters] = useState({ variety: [] as string[], method: [] as string[] });

  const { mutate: predictForms, isPending: isPredicting } = usePredictForms(seasonId);

  const { data: locationData, isLoading: locationLoading } = usePredictedYieldByLocation({
    seasonId,
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
    variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
  });

  const { data: forecastData, isLoading: forecastLoading } = useYieldForecast({
    seasonId,
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
    variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
  });

  const activeData = locationData; // etc.

  const isLoading = locationLoading; // etc.

  const handlePredictForms = () => {
    predictForms()
  }

  if (isLoading) return <PendingComponent />;

  return (
    <PageContainer>
      <Tabs value={view} onValueChange={(v) => setView(v as PredictiveView)}>
        <TabsList variant="line">
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          {/* <TabsTrigger value="location">By Location</TabsTrigger> */}
          {/* <TabsTrigger value="variety">By Variety</TabsTrigger> */}
          {/* <TabsTrigger value="soil">By Soil Type</TabsTrigger> */}
          {/* <TabsTrigger value="soil-variety">Soil + Variety</TabsTrigger> */}
          {/* <TabsTrigger value="year">Per Year</TabsTrigger> */}
          {/* <TabsTrigger value="distribution">Harvest Distribution</TabsTrigger> */}
        </TabsList>
      </Tabs>

      {/* {view === 'location' && <PredictedYieldByLocationView data={activeData} />} */}
      {view === 'forecast' && <YieldForecastView data={forecastData} />}

      <Button className="mt-8 text-sm gap-1.5" onClick={handlePredictForms} disabled={isPredicting} >
        {isPredicting ? (<RefreshCw className="size-3 animate-spin" />) : (<RefreshCw className="size-3" />)}
        {isPredicting ? "Predicting..." : "Predict Available Forms"}
      </Button>

    </PageContainer>
  );
}

function PendingComponent() {
  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center h-full">
        <Spinner className="size-10" />
        <p className="text-muted-foreground text-sm">Loading</p>
      </div>
    </PageContainer>
  );
}
