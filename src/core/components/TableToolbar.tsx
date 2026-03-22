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
    <div className="flex justify-between w-full">
      <SearchBar
        containerClassName="w-64"
        className="text-xs"
        placeholder={ defaultSearchPlaceholder }
        onChange={onSearchChange}
      />
      {actions && (
        <div className="ml-auto">
          {actions}
        </div>
      )}
    </div>
  )
})
