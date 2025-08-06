import { TableSkeleton } from "@/core/components/TableSkeleton";
import { DataTable } from "@/core/components/DataTable";
import { TablePagination } from "@/core/components/TablePagination";
import { useRouter } from "@tanstack/react-router";
import { useFormDataTable } from "../hooks/useFormDataTable";
import { FormRouteType } from "@/routes/_manager/forms/-config";
import { memo } from "react";
import { SearchBar } from "@/core/components/SearchBar";

export const FormDataTableToolbar = memo(({onSearchChange}: {
  onSearchChange: React.ChangeEventHandler<HTMLInputElement>
}) => {
  return (
    <div className="w-full flex justify-between">
      <SearchBar
        containerClassName="w-64"
        className="text-xs"
        placeholder="Search anything..."
        onChange={onSearchChange}
      />
    </div>
  )
})


export const FormDataTable = ({ formType }: { formType: FormRouteType }) => {
  "use no memo"; // TODO: remove after RC is compatible with TanStack Table v8

  const { table, isLoading: isLoadingFieldData } = useFormDataTable(formType);
  const { navigate, preloadRoute } = useRouter()

  if (isLoadingFieldData) {
    return <TableSkeleton />;
  }

  return (
    <DataTable
      table={table}
      toolbar={
        <FormDataTableToolbar
          onSearchChange={e => table.setGlobalFilter(e.target.value)}
        />
      }
      pagination={<TablePagination table={table}/>}
      onRowClick={row => {
        navigate({
          to: "/forms/$formType/$mfid",
          params: { formType: formType, mfid: row.mfid },
        });
      }}
      onRowIntent={row => {
        preloadRoute({
          to: "/forms/$formType/$mfid",
          params: { formType: formType, mfid: row.mfid },
        });
      }}
    />
  )
}
