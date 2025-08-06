import '@tanstack/react-table'
import { Size } from './size'

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    textAlign?: 'left' | 'center' | 'right',
    size?: Size
  }
}
