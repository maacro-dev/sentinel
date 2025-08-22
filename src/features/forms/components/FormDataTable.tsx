import { TableSkeleton } from "@/core/components/TableSkeleton";
import { DataTable } from "@/core/components/DataTable";
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { useRouter } from "@tanstack/react-router";
import { useFormDataTable } from "../hooks/useFormDataTable";
import { FormRouteType } from "@/routes/_manager/forms/-config";
import { DefaultTableToolbar } from "@/core/components/TableToolbar";

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
        <DefaultTableToolbar
          onSearchChange={e => table.setGlobalFilter(e.target.value)}
          defaultSearchPlaceholder="Search anything..."
        />
      }
      pagination={<DefaultTablePagination table={table}/>}
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
