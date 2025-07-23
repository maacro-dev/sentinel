import { SearchBar } from "@/core/components/SearchBar"
import React from "react"
import { memo } from "react"

export const FieldsTableToolbar = memo(({onSearchChange}: {
  onSearchChange: React.ChangeEventHandler<HTMLInputElement>
}) => {
  return (
    <div className="w-full flex justify-between">
      <SearchBar
        containerClassName="w-64"
        className="text-xs"
        placeholder="Search mfid or farmer"
        onChange={onSearchChange}
      />
    </div>
  )
})
