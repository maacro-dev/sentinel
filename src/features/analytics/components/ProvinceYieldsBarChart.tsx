import { memo, useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/core/utils/style";
import { TickProps } from "../types";
import { DefaultTicks } from "./DefaultTicks";
import { Analytics } from "../services/Analytics";
import { Spinner } from "@/core/components/ui/spinner";
import { GroupedBarChart } from "./GroupedBarChart/GroupedBarChart";
import { descriptiveAnalyticsDataOptions } from "../queries/options";

interface ProvinceYieldsBarChartProps {
  seasonId: number | undefined;
  variety?: string | undefined;
  fertilizer?: string | undefined;
  onFilterChange?: (filter: {
    province: string | null;
    municipality: string | null;
    barangay: string | null;
  }) => void;
}

export const ProvinceYieldsBarChart = memo(({ seasonId, variety, fertilizer, onFilterChange }: ProvinceYieldsBarChartProps) => {

  const queryClient = useQueryClient()

  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<string | null>(null);

  const { data: hierarchy, isLoading, isError } = useQuery({
    queryKey: ["hierarchical-yields", seasonId, variety, fertilizer] as const,
    queryFn: () => Analytics.getHierarchicalYields(seasonId, variety, fertilizer),
  });

  const updateFilter = useCallback(
    (province: string | null, municipality: string | null, barangay: string | null) => {
      onFilterChange?.({ province, municipality, barangay });
    },
    [onFilterChange]
  );

  const handleSetProvince = useCallback(
    (name: string) => {
      setSelectedProvince(name);
      setSelectedMunicipality(null);
      setSelectedBarangay(null);
      updateFilter(name, null, null);
    },
    [updateFilter]
  );

  const handleSetMunicipality = useCallback(
    (name: string) => {
      setSelectedMunicipality(name);
      setSelectedBarangay(null);
      updateFilter(selectedProvince!, name, null);
    },
    [selectedProvince, updateFilter]
  );

  const provinceChartData = useMemo(() => {
    if (!hierarchy) return [];
    return hierarchy.map((p) => ({
      name: p.province,
      avg_yield_t_per_ha: p.avg_yield_t_per_ha,
    }));
  }, [hierarchy]);

  const municipalityChartData = useMemo(() => {
    if (!selectedProvince || !hierarchy) return [];
    const province = hierarchy.find((p) => p.province === selectedProvince);
    if (!province) return [];
    return province.municipalities.map((m) => ({
      name: m.municipality,
      avg_yield_t_per_ha: m.avg_yield_t_per_ha,
    }));
  }, [selectedProvince, hierarchy]);

  const barangayChartData = useMemo(() => {
    if (!selectedProvince || !selectedMunicipality || !hierarchy) return [];
    const province = hierarchy.find((p) => p.province === selectedProvince);
    if (!province) return [];
    const municipality = province.municipalities.find(
      (m) => m.municipality === selectedMunicipality
    );
    if (!municipality) return [];
    return municipality.barangays.map((b) => ({
      name: b.barangay,
      avg_yield_t_per_ha: b.avg_yield_t_per_ha,
    }));
  }, [selectedProvince, selectedMunicipality, hierarchy]);

  const chartData = selectedMunicipality ? barangayChartData : selectedProvince ? municipalityChartData : provinceChartData;

  const handleBarClick = useCallback(
    (item: any) => {
      const name = item?.name;
      if (!name) return;

      if (selectedMunicipality) {
        if (selectedBarangay === name) {
          setSelectedBarangay(null);
          updateFilter(selectedProvince!, selectedMunicipality, null);
        } else {
          setSelectedBarangay(name);
          updateFilter(selectedProvince!, selectedMunicipality, name);
        }
      } else if (selectedProvince) {
        handleSetMunicipality(name);
      } else {
        handleSetProvince(name);
      }
    },
    [selectedProvince, selectedMunicipality, selectedBarangay, handleSetProvince, handleSetMunicipality, updateFilter]
  );

  const handleBarHover = useCallback((item: any) => {
    const name = item?.name;

    if (!name) return;

    let filter = {
      province: null as string | null,
      municipality: null as string | null,
      barangay: null as string | null,
    };

    if (!selectedProvince) {
      filter.province = name;
    } else if (!selectedMunicipality) {
      filter.province = selectedProvince;
      filter.municipality = name;
    } else {
      filter.province = selectedProvince;
      filter.municipality = selectedMunicipality;
      filter.barangay = name;
    }

    queryClient.prefetchQuery(descriptiveAnalyticsDataOptions(seasonId, { ...filter, variety, fertilizer }));
  },
    [queryClient, seasonId, selectedProvince, selectedMunicipality]
  );

  const goBack = useCallback(() => {
    if (selectedBarangay) {
      setSelectedBarangay(null);
      updateFilter(selectedProvince!, selectedMunicipality, null);
    } else if (selectedMunicipality) {
      setSelectedMunicipality(null);
      setSelectedBarangay(null);
      updateFilter(selectedProvince!, null, null);
    } else {
      setSelectedProvince(null);
      setSelectedMunicipality(null);
      setSelectedBarangay(null);
      updateFilter(null, null, null);
    }
  }, [selectedBarangay, selectedMunicipality, selectedProvince, updateFilter]);

  const isEmpty =
    chartData.length === 0 ||
    chartData.every((d) => d.avg_yield_t_per_ha === 0);

  let domain: [number, number] | undefined;
  if (!selectedProvince) {
    const yields = chartData
      .map((d) => d.avg_yield_t_per_ha)
      .filter((y) => y > 0);
    if (yields.length > 0) {
      const minVal = Math.min(...yields);
      const maxVal = Math.max(...yields);
      const padding = (maxVal - minVal) * 0.1;
      domain = [Math.max(0, minVal - padding), maxVal + padding];
    }
  }

  const floatingLabel = selectedBarangay
    ? "Clear Barangay Filter"
    : selectedMunicipality
      ? "Back to Municipalities"
      : selectedProvince
        ? "Back to Provinces"
        : null;


  const chartKey = `yields-${seasonId}-${variety ?? 'all'}`;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spinner className="size-10" />
        <p className="text-muted-foreground text-sm ml-2">Loading data…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-sm text-destructive">Failed to load chart data.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className={cn(
          "absolute left-1/2 transform -translate-x-1/2 top-8 z-10 transition-all duration-300 ease-in-out",
          floatingLabel
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <button
          onClick={goBack}
          className="bg-muted text-foreground px-4 py-2 rounded-full text-xs shadow-sm hover:bg-accent transition-colors cursor-pointer"
        >
          {floatingLabel}
        </button>
      </div>

      <GroupedBarChart
        key={chartKey}
        data={chartData}
        categoryKey={"name"}
        barKeys={[{
          key: "avg_yield_t_per_ha",
          name: "Yield (t/ha)",
          color: "var(--color-humay)",
        }]}
        header={
          selectedMunicipality
            ? {
              title: `Barangay Yields for ${selectedMunicipality}, ${selectedProvince}`,
              description: "Average yield per barangay (t/ha)",
            }
            : selectedProvince
              ? {
                title: `Municipality Yields for ${selectedProvince}`,
                description: "Average yield per municipality (t/ha)",
              }
              : {
                title: "Season Summary",
                description:
                  "Average yield per province (Avg. Bag Weight (kg) × Number of Bags / Harvested Area (ha) × 1000)",
              }
        }
        isEmpty={isEmpty}
        activeBar={selectedBarangay}
        onBarClick={handleBarClick}
        onBarHover={handleBarHover}
        layout="horizontal"
        valueUnit=" t/ha"
        cardClass="h-120"
        getBarSize={() => 56}
        axisOptions={{
          X: {
            tick: ({ x, y, payload }: TickProps) => (
              <DefaultTicks x={x} y={y} payload={payload} />
            ),
          },
          Y: {
            tickFormatter: (value: number) => `${value} t/ha`,
            domain: selectedProvince ? undefined : domain,
          },
        }}
      />
    </div>
  );
}
);
