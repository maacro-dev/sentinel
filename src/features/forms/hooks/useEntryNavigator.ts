import { FormRouteType } from "@/routes/_manager/forms/-config";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useCallback } from "react";
import { useTableStore } from "../store";
import { useFormEntriesTable } from "./useFormDataTable";
import { useShallow } from "zustand/react/shallow";

// TODO: refactor this. sakit sa mata

export function useFormDetailNavigator(formType?: FormRouteType, mfid?: string) {
  const navigate = useNavigate();

  const { table: entriesTable, isLoading: isLoadingEntries } = useFormEntriesTable(formType as FormRouteType);
  const { ids, currentIndex, formType: storedFormType, setIds, setCurrentIndex } = useTableStore(
    useShallow((s) => ({
      ids: s.ids,
      currentIndex: s.currentIndex,
      formType: s.formType,
      setIds: s.setIds,
      setCurrentIndex: s.setCurrentIndex,
    }))
  );

  useEffect(() => {
    if (!mfid) return;

    const shouldRebuild = ids.length === 0 || storedFormType !== formType;
    if (!shouldRebuild) return;
    if (isLoadingEntries) return;
    if (!entriesTable) return;

    const rebuiltIds = entriesTable.getCoreRowModel().rows.map((r) => r.original.field.mfid);

    if (rebuiltIds.length === 0) return;

    setIds(rebuiltIds, formType);

    const idx = rebuiltIds.indexOf(mfid);
    setCurrentIndex(idx === -1 ? null : idx);
  }, [mfid, isLoadingEntries, entriesTable]);

  useEffect(() => {
    if (!mfid || ids.length === 0 || storedFormType !== formType) return;
    const idx = ids.indexOf(mfid);
    if (idx === -1) {
      setCurrentIndex(null);
    } else if (idx !== currentIndex) {
      setCurrentIndex(idx);
    }
  }, [mfid, ids, currentIndex, setCurrentIndex, storedFormType, formType]);

  const hasNext = useMemo(() => currentIndex !== null && currentIndex < ids.length - 1, [currentIndex, ids.length]);
  const hasPrev = useMemo(() => currentIndex !== null && currentIndex > 0, [currentIndex]);

  const navigateToIndex = useCallback(
    (nextIndex: number) => {
      const nextId = ids[nextIndex];
      if (!nextId || !formType) return;
      setCurrentIndex(nextIndex);
      navigate({
        to: "/forms/$formType/$mfid",
        params: { formType, mfid: nextId },
        replace: true,
      });
    },
    [ids, setCurrentIndex, navigate, formType]
  );

  const goNext = useCallback(() => {
    if (!hasNext || currentIndex === null) return;
    navigateToIndex(currentIndex + 1);
  }, [hasNext, currentIndex, navigateToIndex]);

  const goPrev = useCallback(() => {
    if (!hasPrev || currentIndex === null) return;
    navigateToIndex(currentIndex - 1);
  }, [hasPrev, currentIndex, navigateToIndex]);

  const loading = ids.length === 0 && isLoadingEntries;

  return {
    ids,
    currentIndex,
    hasNext,
    hasPrev,
    goNext,
    goPrev,
    loading,
  };
}
