
import { Label } from '@/core/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { Sanitizer } from '@/core/utils/sanitizer';
import { LocationFilters, MoreFilters } from '../types';

interface PredictiveFiltersProps {
  location: LocationFilters;
  onLocationChange: (key: keyof LocationFilters, value: string) => void;
  provinces: Array<{ value: string; label: string }>;
  municipalities: Array<{ value: string; label: string }>;
  barangays: Array<{ value: string; label: string }>;
  riceVarieties: Array<{ value: string; label: string }>;
  soilTypes: Array<{ value: string; label: string }>;
  moreFilters: MoreFilters;
  onMoreFiltersChange: (key: keyof MoreFilters, value: string[]) => void;
  onResetAll: () => void;
  isLoadingProvinces?: boolean;
  isLoadingMunicipalities?: boolean;
  isLoadingBarangays?: boolean;
  prefetchLocationData: (province?: string, municipality?: string, barangay?: string) => void;
  prefetchMoreFilterData?: (method?: string, riceVarietyName?: string, soilType?: string) => void;
}

export function PredictiveFilters({
  location, onLocationChange,
  provinces, municipalities, barangays,
  riceVarieties, soilTypes,
  moreFilters, onMoreFiltersChange,
  isLoadingProvinces = false, isLoadingMunicipalities = false, isLoadingBarangays = false,
  prefetchLocationData, prefetchMoreFilterData
}: PredictiveFiltersProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Province */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Province</Label>
        <Select value={location.province} onValueChange={(val) => onLocationChange('province', val === 'all' ? '' : val)} disabled={isLoadingProvinces}>
          <SelectTrigger className="w-full h-8 text-2xs">
            <SelectValue placeholder="All Provinces" />
          </SelectTrigger>
          <SelectContent position='popper' className="max-h-96">
            <SelectGroup>
              <SelectItem value="all">All Provinces</SelectItem>
              <SelectLabel>Provinces</SelectLabel>
              {provinces.map(p => (
                <SelectItem key={p.value} value={p.value} onMouseEnter={() => prefetchLocationData(p.value, undefined, undefined)}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Municipality */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Municipality</Label>
        <Select value={location.municipality} onValueChange={(val) => onLocationChange('municipality', val === 'all' ? '' : val)} disabled={!location.province || isLoadingMunicipalities}>
          <SelectTrigger className="w-full h-8 text-2xs">
            <SelectValue placeholder="All Municipalities" />
          </SelectTrigger>
          <SelectContent position='popper' className="max-h-96">
            <SelectGroup>
              <SelectItem value="all">All Municipalities</SelectItem>
              <SelectLabel>Municipalities</SelectLabel>
              {municipalities.map(m => (
                <SelectItem key={m.value} value={m.value} onMouseEnter={() => prefetchLocationData(location.province, m.value, undefined)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Barangay */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Barangay</Label>
        <Select value={location.barangay} onValueChange={(val) => onLocationChange('barangay', val === 'all' ? '' : val)} disabled={!location.municipality || isLoadingBarangays}>
          <SelectTrigger className="w-full h-8 text-2xs">
            <SelectValue placeholder="All Barangays" />
          </SelectTrigger>
          <SelectContent position='popper' className="max-h-96">
            <SelectGroup>
              <SelectItem value="all">All Barangays</SelectItem>
              <SelectLabel>Barangays</SelectLabel>
              {barangays.map(b => (
                <SelectItem key={b.value} value={b.value} onMouseEnter={() => prefetchLocationData(location.province, location.municipality, b.value)}>
                  {b.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Rice Variety (exact) */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Rice Variety</Label>
        <Select
          value={moreFilters.riceVarietyName[0] || ''}
          onValueChange={(val) => onMoreFiltersChange('riceVarietyName', val === 'all' ? [] : [val])}
        >
          <SelectTrigger className="w-full h-8 text-2xs">
            <SelectValue placeholder="All Varieties" />
          </SelectTrigger>
          <SelectContent position='popper' className="max-h-96">
            <SelectItem value="all">All Varieties</SelectItem>
            {riceVarieties.map(v => (
              <SelectItem key={v.value} value={v.value} onMouseEnter={() => prefetchMoreFilterData?.(undefined, v.value, undefined)}>
                {v.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Soil Type */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Soil Type</Label>
        <Select
          value={moreFilters.soilType[0] || ''}
          onValueChange={(val) => onMoreFiltersChange('soilType', val === 'all' ? [] : [val])}
        >
          <SelectTrigger className="w-full h-8 text-2xs">
            <SelectValue placeholder="All Soil Types" />
          </SelectTrigger>
          <SelectContent position='popper' className="max-h-96">
            <SelectItem value="all">All Soil Types</SelectItem>
            {soilTypes.map(s => (
              <SelectItem key={s.value} value={s.value} onMouseEnter={() => prefetchMoreFilterData?.(undefined, undefined, s.value)}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Method */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Method</Label>
        <Select
          value={moreFilters.method[0] || ''}
          onValueChange={(val) => onMoreFiltersChange('method', val === 'all' ? [] : [val])}
        >
          <SelectTrigger className="w-full h-8 text-2xs">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent position='popper' className="max-h-96">
            <SelectItem value="all">All Methods</SelectItem>
            {['direct-seeded', 'transplanted'].map(m => (
              <SelectItem key={m} value={m} onMouseEnter={() => prefetchMoreFilterData?.(m, undefined, undefined)}>
                {Sanitizer.key(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
