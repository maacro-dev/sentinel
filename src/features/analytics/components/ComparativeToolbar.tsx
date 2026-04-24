import { ToggleGroup, ToggleGroupItem } from '@/core/components/ui/toggle-group';
import { Label } from '@/core/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/core/utils/style';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/core/components/ui/dropdown-menu';
import { Separator } from '@/core/components/ui/separator';
import { ComparativeView, LocationFilters, MoreFilters } from '../types';
import { SeasonPicker } from './SeasonPicker';
import { Button } from '@/core/components/ui/button';


interface ComparativeToolbarProps {
  className?: string;
  view: ComparativeView;
  onViewChange: (view: ComparativeView) => void;

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

  compareSeasonIds: number[];
  onCompareSeasonIdsChange: (ids: number[]) => void;
  onClearComparison: () => void;

  maxCompareSeasons?: number;
}

export function ComparativeToolbar({
  className,
  view,
  onViewChange,
  location,
  onLocationChange,
  provinces,
  municipalities,
  barangays,
  moreFilters,
  onMoreFiltersChange,
  onResetAll,
  isLoadingProvinces = false,
  isLoadingMunicipalities = false,
  isLoadingBarangays = false,
  prefetchLocationData,
  prefetchMoreFilterData,
  compareSeasonIds,
  onCompareSeasonIdsChange,
  onClearComparison,
  maxCompareSeasons = 3,
}: ComparativeToolbarProps) {

  const handleYieldChange = (view: ComparativeView) => {
    if (view) onViewChange(view);
  };

  const handleDamageChange = (view: ComparativeView) => {
    if (view) onViewChange(view);
  };

  const handleVarietyToggle = (variety: string) => {
    const newSelection = moreFilters.variety.includes(variety)
      ? moreFilters.variety.filter(v => v !== variety)
      : [...moreFilters.variety, variety];
    onMoreFiltersChange('variety', newSelection);
  };

  const handleMethodToggle = (method: string) => {
    const newSelection = moreFilters.method.includes(method)
      ? moreFilters.method.filter(m => m !== method)
      : [...moreFilters.method, method];
    onMoreFiltersChange('method', newSelection);
  };

  const hasActiveFilters = !!location.province || !!location.municipality || !!location.barangay ||
    moreFilters.variety.length > 0 || moreFilters.method.length > 0;

  return (
    <div className={cn('w-full flex flex-col gap-4 py-4 items-start', className)}>
      <div>
        <div className='flex gap-2 items-start'>
          <div className="flex gap-4 items-start">
            <div className='flex flex-col gap-2'>
              <Label className="text-xs text-muted-foreground">Compare with</Label>
              <div className='flex items-start gap-2'>
                <SeasonPicker
                  values={compareSeasonIds}
                  onChange={onCompareSeasonIdsChange}
                  maxSelections={maxCompareSeasons}
                />
                {compareSeasonIds.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearComparison}
                    className="h-9 px-2 text-xs shrink-0"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>
            {/* <div className="flex items-center mt-8.5">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="size-4 text-muted-foreground/75 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Seasons with no data are not included in the options.</p>
                    <p className="text-xs">Up to {maxCompareSeasons} seasons can be compared at once.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div> */}
          </div>
          <Separator orientation='vertical' className="self-stretch" />
          <div className="flex gap-2 flex-col min-w-50">
            <Label className="text-xs font-medium text-muted-foreground">Yield</Label>
            <ToggleGroup variant="outline" type="single" value={view} onValueChange={handleYieldChange}>
              <ToggleGroupItem className="text-2xs data-[state=off]:text-muted-foreground" value="yield-location">By Location</ToggleGroupItem>
              <ToggleGroupItem className="text-2xs data-[state=off]:text-muted-foreground" value="yield-method">By Method</ToggleGroupItem>
              <ToggleGroupItem className="text-2xs data-[state=off]:text-muted-foreground" value="yield-variety">By Variety</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <div className="flex gap-2 flex-col min-w-40">
            <Label className="text-xs font-medium text-muted-foreground">Damage</Label>
            <ToggleGroup variant="outline" type="single" value={view} onValueChange={handleDamageChange}>
              <ToggleGroupItem className="text-2xs data-[state=off]:text-muted-foreground" value="damage-location">By Location</ToggleGroupItem>
              <ToggleGroupItem className="text-2xs data-[state=off]:text-muted-foreground" value="damage-cause">By Cause</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      {/* <Separator orientation='vertical' className="self-stretch" /> */}

      <div>
        <div className="flex flex-wrap items-end gap-2 ">
          {/* <div className="flex items-center mb-2 mr-1.5 ">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="size-4 text-muted-foreground/75 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Locations with no data are not included in the options.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div> */}
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Province</Label>
            <Select
              value={location.province}
              onValueChange={(val) => onLocationChange('province', val === 'all' ? '' : val)}
              disabled={isLoadingProvinces}
            >
              <SelectTrigger className="w-37.5 h-8 text-2xs">
                <SelectValue placeholder="All Provinces" />
              </SelectTrigger>
              <SelectContent position='popper' className="max-h-96">
                <SelectGroup>
                  <SelectItem className="rounded-lg text-3xs lt:text-2xs hd:text-xs" value="all">All Provinces</SelectItem>
                  <SelectLabel>Provinces</SelectLabel>
                  {provinces.map(p => (
                    <SelectItem
                      key={p.value}
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
            <Select
              value={location.municipality}
              onValueChange={(val) => onLocationChange('municipality', val === 'all' ? '' : val)}
              disabled={!location.province || isLoadingMunicipalities}
            >
              <SelectTrigger className="w-37.5 h-8 text-2xs">
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
            <Select
              value={location.barangay}
              onValueChange={(val) => onLocationChange('barangay', val === 'all' ? '' : val)}
              disabled={!location.municipality || isLoadingBarangays}
            >
              <SelectTrigger className="w-37.5 h-8 text-2xs">
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

          <Separator orientation='vertical' className="self-stretch" />

          <div className='flex gap-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="border-input text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-2xs whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                  More Filters
                  <div>
                    <ChevronDownIcon className="size-4 opacity-50" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Rice Variety</DropdownMenuLabel>
                  {['NSIC', 'PSB', 'Others'].map(v => (
                    <DropdownMenuCheckboxItem
                      key={v}
                      checked={moreFilters.variety.includes(v)}
                      onCheckedChange={() => handleVarietyToggle(v)}
                      onMouseEnter={() => prefetchMoreFilterData?.(undefined, v)}
                    >
                      {v}
                    </DropdownMenuCheckboxItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Planting Method</DropdownMenuLabel>
                  {['direct-seeded', 'transplanted'].map(m => (
                    <DropdownMenuCheckboxItem
                      key={m}
                      checked={moreFilters.method.includes(m)}
                      onCheckedChange={() => handleMethodToggle(m)}
                      className="capitalize"
                      onMouseEnter={() => prefetchMoreFilterData?.(m, undefined)}
                    >
                      {m.replace('-', ' ')}
                    </DropdownMenuCheckboxItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    disabled={!hasActiveFilters}
                    className='justify-center border text-xs text-muted-foreground'
                    onClick={onResetAll}
                  >
                    Reset All Filters
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
