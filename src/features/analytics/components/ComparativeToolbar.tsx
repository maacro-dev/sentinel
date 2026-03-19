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
import { ComparativeView } from '../types';

interface LocationFilters {
  province: string;
  municipality: string;
  barangay: string;
}

interface MoreFilters {
  variety: string[];   // 'NSIC', 'PSB', 'Others'
  method: string[];    // 'direct-seeded', 'transplanted'
}

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
  prefetchMoreFilterData
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
    <div className={cn('w-full flex gap-6 py-4 items-center', className)}>
      <div className='flex gap-4'>
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

      <Separator orientation='vertical' />

      <div className="flex flex-wrap items-end gap-2">
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

        <div className='flex gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* classes copied from SelectTrigger */}
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
                {/* Should be a select and should take from database */}
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
                <DropdownMenuItem disabled={!hasActiveFilters} className='justify-center border text-xs text-muted-foreground' onClick={onResetAll}>
                  Reset All Filters
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-9 gap-1 text-xs text-muted-foreground" onClick={onResetAll}>
              <X className="size-3.5" />
              Reset All
            </Button>
          )} */}
        </div>
      </div>

    </div>
  );
}
