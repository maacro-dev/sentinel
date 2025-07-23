import { useMemo } from "react"
import { useFields } from "./useFields"
import { FieldColumns } from "../components/FieldsTable/FieldColumns"
import { useDataTable } from "@/core/hooks"

export const useFieldsTable = () => {
  const { data: fields, isLoading } = useFields()
  const columns = useMemo(() => FieldColumns, [])
  const table = useDataTable(fields ?? [], columns).table

  return { table, isLoading }
}
