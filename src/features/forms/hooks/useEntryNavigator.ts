import { useNavigate } from '@tanstack/react-router';
import { useMemo, useEffect, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { FormType } from '@/routes/_manager/forms/-config';
import { useFormEntriesTable } from './useFormDataTable';
import { useTableStore } from '../store';

export function useFormDetailNavigator(formType?: FormType, id?: string, seasonId?: number) {
  const navigate = useNavigate();

  const { table: entriesTable, isLoading: isLoadingEntries } = useFormEntriesTable(formType as FormType, seasonId);
  const { ids, currentIndex, formType: storedFormType, setIds, setCurrentIndex } = useTableStore(
    useShallow((s) => ({
      ids: s.ids,
      currentIndex: s.currentIndex,
      formType: s.formType,
      setIds: s.setIds,
      setCurrentIndex: s.setCurrentIndex,
    }))
  );

  // Build ID list from table rows (strings) when entries load
  useEffect(() => {
    if (!entriesTable) return;
    if (isLoadingEntries) return;

    const rebuiltIds = entriesTable.getCoreRowModel().rows.map((row) => row.id);
    if (rebuiltIds.length === 0) return;

    // Only rebuild if store is empty or form type changed
    if (ids.length === 0 || storedFormType !== formType) {
      setIds(rebuiltIds, formType);
      const idx = rebuiltIds.indexOf(id ?? '');
      setCurrentIndex(idx === -1 ? null : idx);
    }
  }, [entriesTable, isLoadingEntries, ids.length, storedFormType, formType, setIds, setCurrentIndex, id]);

  // Synchronize store with current ID (e.g., when ID changes via browser navigation)
  useEffect(() => {
    if (!id || ids.length === 0 || storedFormType !== formType) return;
    const idx = ids.indexOf(id);
    if (idx === -1) {
      setCurrentIndex(null);
    } else if (idx !== currentIndex) {
      setCurrentIndex(idx);
    }
  }, [id, ids, currentIndex, setCurrentIndex, storedFormType, formType]);

  const hasNext = useMemo(() => currentIndex !== null && currentIndex < ids.length - 1, [currentIndex, ids.length]);
  const hasPrev = useMemo(() => currentIndex !== null && currentIndex > 0, [currentIndex]);

  const navigateToIndex = useCallback(
    (nextIndex: number) => {
      const nextId = ids[nextIndex];
      if (!nextId || !formType) return;
      setCurrentIndex(nextIndex);
      navigate({
        to: '/forms/$formType/$id',
        params: { formType, id: Number(nextId) },
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
