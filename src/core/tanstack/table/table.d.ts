import '@tanstack/react-table'
import { Size } from './size'
import { FilterOption, FilterVariant } from '@/core/components/ColumnHeader'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    textAlign?: 'left' | 'center' | 'right',
    size?: Size,
    filterOptions?: FilterOption[],
    filterVariant?: FilterVariant
  }
  interface FilterFns {
    dateRange: FilterFn<unknown>;
  }
  interface ColumnFiltersOptions<TData extends RowData> {
    filterFns?: Record<string, FilterFn<TData>>;
  }
}
