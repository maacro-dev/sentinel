
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

  moreFilters: MoreFilters;
  onMoreFiltersChange: (key: keyof MoreFilters, value: string[]) => void;

  onResetAll: () => void;

  isLoadingProvinces?: boolean;
  isLoadingMunicipalities?: boolean;
  isLoadingBarangays?: boolean;

  prefetchLocationData: (province?: string, municipality?: string, barangay?: string) => void;
  prefetchMoreFilterData?: (method?: string, variety?: string) => void;
}

export function PredictiveFilters({
  location, onLocationChange,
  provinces,
  municipalities,
  barangays,
  moreFilters, onMoreFiltersChange,
  // onResetAll,
  isLoadingProvinces = false, isLoadingMunicipalities = false, isLoadingBarangays = false,
  prefetchLocationData, prefetchMoreFilterData
}: PredictiveFiltersProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Province</Label>
        <Select value={location.province} onValueChange={(val) => onLocationChange('province', val === 'all' ? '' : val)} disabled={isLoadingProvinces}>
          <SelectTrigger className="w-full h-8 text-2xs">
            <SelectValue placeholder="All Provinces" />
          </SelectTrigger>
          <SelectContent position='popper' className="max-h-96">
            <SelectGroup>
              <SelectItem className="rounded-lg text-3xs lt:text-2xs hd:text-xs" value="all">All Provinces</SelectItem>
              <SelectLabel>Provinces</SelectLabel>
              {provinces.map(p => (
                <SelectItem
                  className="rounded-lg text-3xs lt:text-2xs hd:text-xs"
                  value={p.value}
                  onMouseEnter={() => prefetchLocationData(p.value, undefined, undefined)}
                >
                  {p.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Municipality</Label>
        <Select value={location.municipality} onValueChange={(val) => onLocationChange('municipality', val === 'all' ? '' : val)} disabled={!location.province || isLoadingMunicipalities}>
          <SelectTrigger className="w-full h-8 text-2xs">
            <SelectValue placeholder="All Municipalities" />
          </SelectTrigger>
          <SelectContent position='popper' className="max-h-96">
            <SelectGroup>
              <SelectItem className="rounded-lg text-3xs lt:text-2xs hd:text-xs" value="all">All Municipalities</SelectItem>
              <SelectLabel>Municipalities</SelectLabel>
              {municipalities.map(m => (
                <SelectItem
                  key={m.value}
                  value={m.value}
                  onMouseEnter={() => prefetchLocationData(location.province, m.value, undefined)}
                >
                  {m.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

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
                <SelectItem
                  key={b.value}
                  value={b.value}
                  onMouseEnter={() => prefetchLocationData(location.province, location.municipality, b.value)}
                >
                  {b.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Rice Variety</Label>
        <Select
          value={moreFilters.variety[0] || ''}
          onValueChange={(val) => onMoreFiltersChange('variety', val === 'all' ? [] : [val])}
        >
          <SelectTrigger className="w-full h-8 text-2xs">
            <SelectValue placeholder="All Varieties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Varieties</SelectItem>
            {['NSIC', 'PSB', 'Others'].map(v => (
              <SelectItem key={v} value={v} onMouseEnter={() => prefetchMoreFilterData?.(undefined, v)}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Method</Label>
        <Select
          value={moreFilters.method[0] || ''}
          onValueChange={(val) => onMoreFiltersChange('method', val === 'all' ? [] : [val])}
        >
          <SelectTrigger className="w-full h-8 text-2xs">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            {['direct-seeded', 'transplanted'].map(m => (
              <SelectItem key={m} value={m} onMouseEnter={() => prefetchMoreFilterData?.(m, undefined)}>
                {Sanitizer.key(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
