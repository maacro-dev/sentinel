import { memo, useCallback, useMemo } from "react";
import { cn } from "@/core/utils/style";
import { OptionalLocationFilters, TickProps } from "../types";
import { DefaultTicks } from "./DefaultTicks";
import { GroupedBarChart } from "./GroupedBarChart/GroupedBarChart";
import { ProvinceYieldNode } from "../schemas/yieldByProvince";

interface ProvinceYieldsBarChartProps {
  hierarchy: ProvinceYieldNode[];
  locationFilter: OptionalLocationFilters;
  onLocationFilterChange?: (filter: OptionalLocationFilters) => void;
  onBarHover?: (filter: OptionalLocationFilters) => void;
}

export const ProvinceYieldsBarChart = memo(({ hierarchy, locationFilter, onLocationFilterChange, onBarHover }: ProvinceYieldsBarChartProps) => {

  const updateLocationFilter = useCallback(
    (partial: Partial<OptionalLocationFilters>) => {
      onLocationFilterChange?.(partial);
    },
    [onLocationFilterChange],
  );

  const provinceChartData = useMemo(() => {
    if (!hierarchy) return [];
    return hierarchy.map(p => ({ name: p.province, avg_yield_t_per_ha: p.avg_yield_t_per_ha }));
  }, [hierarchy]);

  const municipalityChartData = useMemo(() => {
    if (!locationFilter.province || !hierarchy) return [];
    const province = hierarchy.find(p => p.province === locationFilter.province);
    return province
      ? province.municipalities.map(m => ({
        name: m.municipality,
        avg_yield_t_per_ha: m.avg_yield_t_per_ha,
      }))
      : [];
  }, [locationFilter.province, hierarchy]);

  const barangayChartData = useMemo(() => {
    if (!locationFilter.province || !locationFilter.municipality || !hierarchy) return [];
    const province = hierarchy.find(p => p.province === locationFilter.province);
    if (!province) return [];
    const municipality = province.municipalities.find(
      m => m.municipality === locationFilter.municipality,
    );
    return municipality
      ? municipality.barangays.map(b => ({
        name: b.barangay,
        avg_yield_t_per_ha: b.avg_yield_t_per_ha,
      }))
      : [];
  }, [locationFilter.province, locationFilter.municipality, hierarchy]);

  const chartData = locationFilter.municipality
    ? barangayChartData
    : locationFilter.province
      ? municipalityChartData
      : provinceChartData;

  const handleBarClick = useCallback(
    (item: any) => {
      const name = item?.name;
      if (!name) return;

      if (locationFilter.municipality) {
        const barangay = name === locationFilter.barangay ? undefined : name;
        updateLocationFilter({ barangay });
      } else if (locationFilter.province) {
        updateLocationFilter({ municipality: name, barangay: undefined });
      } else {
        updateLocationFilter({ province: name, municipality: undefined, barangay: undefined });
      }
    },
    [locationFilter, updateLocationFilter],
  );

  const handleBarHover = useCallback(
    (item: any) => {
      const name = item?.name;
      if (!name) return;

      let filter: OptionalLocationFilters = {};

      if (!locationFilter.province) {
        filter = { province: name };
      } else if (!locationFilter.municipality) {
        filter = { province: locationFilter.province, municipality: name };
      } else {
        filter = {
          province: locationFilter.province,
          municipality: locationFilter.municipality,
          barangay: name,
        };
      }
      onBarHover?.(filter);
    },
    [locationFilter.province, locationFilter.municipality, onBarHover],
  );

  const goBack = useCallback(() => {
    if (locationFilter.barangay) {
      updateLocationFilter({ barangay: undefined });
    } else if (locationFilter.municipality) {
      updateLocationFilter({ municipality: undefined, barangay: undefined });
    } else {
      updateLocationFilter({ province: undefined, municipality: undefined, barangay: undefined });
    }
  }, [locationFilter, updateLocationFilter]);

  const floatingLabel = locationFilter.barangay
    ? "Clear Barangay Filter"
    : locationFilter.municipality
      ? "Back to Municipalities"
      : locationFilter.province
        ? "Back to Provinces"
        : null;

  const isEmpty = chartData.length === 0 || chartData.every(d => d.avg_yield_t_per_ha === 0);

  let domain: [number, number] | undefined;
  if (!locationFilter.province) {
    const yields = chartData.map(d => d.avg_yield_t_per_ha).filter(y => y > 0);
    if (yields.length > 0) {
      const minVal = Math.min(...yields);
      const maxVal = Math.max(...yields);
      const padding = (maxVal - minVal) * 0.1;
      domain = [Math.max(0, minVal - padding), maxVal + padding];
    }
  }

  return (
    <div className="relative">
      <div
        className={cn(
          "absolute left-1/2 transform -translate-x-1/2 top-8 z-10 transition-all duration-300 ease-in-out",
          floatingLabel
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none",
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
        data={chartData}
        categoryKey="name"
        barKeys={[
          {
            key: "avg_yield_t_per_ha",
            name: "Yield (t/ha)",
            color: "var(--color-humay)",
          },
        ]}
        header={
          locationFilter.municipality
            ? {
              title: `Barangay Yields for ${locationFilter.municipality}, ${locationFilter.province}`,
              description: "Average yield per barangay (t/ha)",
            }
            : locationFilter.province
              ? {
                title: `Municipality Yields for ${locationFilter.province}`,
                description: "Average yield per municipality (t/ha)",
              }
              : {
                title: "Season Summary",
                description:
                  "Average yield per province (Avg. Bag Weight (kg) × Number of Bags / Harvested Area (ha) × 1000)",
              }
        }
        isEmpty={isEmpty}
        activeBar={locationFilter.barangay}
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
            domain: locationFilter.province ? undefined : domain,
          },
        }}
      />
    </div>
  );
},
);
