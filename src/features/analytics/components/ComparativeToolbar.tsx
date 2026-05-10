import { ToggleGroup, ToggleGroupItem } from '@/core/components/ui/toggle-group';
import { Label } from '@/core/components/ui/label';
import { ChevronDownIcon, Info } from 'lucide-react';
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
import { ComparativeView, MoreFilters, MultiLocationFilters } from '../types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/core/components/ui/tooltip';
import { SeasonPicker } from './SeasonPicker';
import { Button } from '@/core/components/ui/button';
import MultiSelect from '@/core/components/MultiSelect';


interface ComparativeToolbarProps {
  className?: string;
  view: ComparativeView;
  onViewChange: (view: ComparativeView) => void;

  location: MultiLocationFilters;
  onLocationChange: (key: keyof MultiLocationFilters, value: string[]) => void;

  provinces: Array<{ value: string; label: string }>;
  municipalities: Array<{ value: string; label: string }>;
  barangays: Array<{ value: string; label: string }>;

  moreFilters: MoreFilters;
  onMoreFiltersChange: (key: keyof MoreFilters, value: string[]) => void;

  onResetAll: () => void;

  isLoadingProvinces?: boolean;
  isLoadingMunicipalities?: boolean;
  isLoadingBarangays?: boolean;

  compareSeasonIds: number[];
  onCompareSeasonIdsChange: (ids: number[]) => void;
  onClearComparison: () => void;

  onPrefetchProvince?: (value: string) => void;
  onPrefetchMunicipality?: (value: string) => void;
}

export function ComparativeToolbar({
  className,
  view,
  onViewChange,
  location,
  onLocationChange,
  provinces,
  municipalities,
  moreFilters,
  onMoreFiltersChange,
  onResetAll,
  isLoadingProvinces = false,
  isLoadingMunicipalities = false,
  compareSeasonIds,
  onCompareSeasonIdsChange,
  onClearComparison,

  onPrefetchProvince,
  onPrefetchMunicipality
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

  const hasActiveFilters =
    location.provinces?.length > 0 ||
    location.municipalities?.length > 0 ||
    moreFilters.variety.length > 0 ||
    moreFilters.method.length > 0;

  return (
    <div className={cn('w-full flex flex-col gap-4 py-4', className)}>
      {/* Row 1: Season comparison + View toggles */}
      <div className='flex gap-6 items-start'>
        <div className="flex gap-4 items-start">
          <div className='flex flex-col gap-2'>
            <Label className="text-xs text-muted-foreground">Compare with</Label>
            <div className='flex items-start gap-2'>
              <SeasonPicker
                values={compareSeasonIds}
                onChange={onCompareSeasonIdsChange}
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
          <div className="flex items-center mt-7">
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Info className="size-4 text-muted-foreground/75 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Seasons with no data are not included in the options.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
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

      <div className="flex flex-wrap items-end gap-2">

        <MultiSelect
          label="Province"
          placeholder="All Provinces"
          options={provinces}
          values={location.provinces}
          onChange={(vals) => onLocationChange('provinces', vals)}
          disabled={isLoadingProvinces}
          className='min-w-50 max-w-none'
          onPrefetch={onPrefetchProvince}
        />

        <MultiSelect
          label="Municipality"
          placeholder="All Municipalities"
          options={municipalities}
          values={location.municipalities}
          onChange={(vals) => onLocationChange('municipalities', vals)}
          disabled={!location.provinces?.length || isLoadingMunicipalities}
          className='min-w-50 max-w-none'
          onPrefetch={onPrefetchMunicipality}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="border-input text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-2xs whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
              More Filters
              <ChevronDownIcon className="size-4 opacity-50" />
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
  );
}
