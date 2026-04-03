import React, { memo } from "react"
import { SearchBar } from "./SearchBar"
import { cn } from "../utils/style"

interface DefaultTableToolbarProps extends React.ComponentProps<"div"> {
  onSearchChange: React.ChangeEventHandler<HTMLInputElement>,
  defaultSearchPlaceholder?: string,
  actions?: React.ReactNode,
}

// currently consists of a search bar
export const DefaultTableToolbar = memo(({
  onSearchChange,
  defaultSearchPlaceholder = "Search something...",
  actions,
  className
}: DefaultTableToolbarProps) => {
  return (
    <div className={cn("flex", className)}>
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
