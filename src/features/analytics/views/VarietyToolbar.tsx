import { Search } from 'lucide-react';
import { Input } from '@/core/components/ui/input';
import { SortMode, VarietyLimit } from '../types';
import { memo } from 'react';
import { VARIETY_LIMIT_OPTIONS } from '../config';
import { SentinelSelect } from '@/core/components/forms/FormSelect';

interface VarietyToolbarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  sortMode: SortMode;
  onSortChange: (v: SortMode) => void;
  limit: VarietyLimit;
  onLimitChange: (v: VarietyLimit) => void;
  totalCount: number;
  shownCount: number;
}

const SORT_LABELS: Record<SortMode, string> = {
  yield_desc: 'Highest yield first',
  yield_asc: 'Lowest yield first',
  name_asc: 'Name (A–Z)',
  coverage_desc: 'Most seasons first',
};

export const VarietyToolbar = memo(function VarietyToolbar({
  searchQuery,
  onSearchChange,
  sortMode,
  onSortChange,
  limit,
  onLimitChange,
  totalCount,
  shownCount,
}: VarietyToolbarProps) {
  const sortOptions = (Object.keys(SORT_LABELS) as SortMode[]).map(mode => ({
    value: mode,
    label: SORT_LABELS[mode],
  }));

  const limitOptions = VARIETY_LIMIT_OPTIONS.map(n => ({
    value: n.toString(),
    label: `Show ${n} varieties`,
  }));

  return (
    <div className="flex flex-wrap items-end gap-2">
      <div className="relative flex-1 min-w-36">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Filter varieties…"
          className="pl-2 text-xs"
        />
      </div>

      <SentinelSelect
        name="sort-variety"
        label="Sort"
        options={sortOptions}
        value={sortMode}
        onChange={(value) => onSortChange(value as SortMode)}
        placeholder="Sort by…"
        triggerClass='w-40'
      />

      <SentinelSelect
        name="limit-variety"
        label="Show"
        options={limitOptions}
        value={limit.toString()}
        onChange={(value) => onLimitChange(Number(value) as VarietyLimit)}
        placeholder="Number…"
        triggerClass='w-40'
      />

      {totalCount > 0 && (
        <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap self-end mb-1">
          {shownCount} of {totalCount}
        </span>
      )}
    </div>
  );
});
