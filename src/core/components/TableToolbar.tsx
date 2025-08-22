import { memo } from "react"
import { SearchBar } from "./SearchBar"

interface DefaultTableToolbarProps {
  onSearchChange: React.ChangeEventHandler<HTMLInputElement>,
  defaultSearchPlaceholder?: string,
  actions?: React.ReactNode
}

// currently consists of a search bar
export const DefaultTableToolbar = memo(({
  onSearchChange,
  defaultSearchPlaceholder = "Search something...",
  actions
}: DefaultTableToolbarProps) => {
  return (
    <div className="w-full flex justify-between">
      <SearchBar
        containerClassName="w-64"
        className="text-xs"
        placeholder={ defaultSearchPlaceholder }
        onChange={onSearchChange}
      />
      {actions && actions}
    </div>
  )
})
