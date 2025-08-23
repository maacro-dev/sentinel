import { useCallback, useEffect, useState } from "react";

interface UseSheetDataOptions<T> {
  key: string | number | undefined;
  data: T | null | undefined;
  onClose: () => void;
}

export const useSheetData = <T,>({
  key,
  data,
  onClose
}: UseSheetDataOptions<T>) => {
  const [cachedData, setCachedData] = useState<T | null>(null);
  const open = Boolean(key)
  const onOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) onClose()
  }, [onClose])

  useEffect(() => {
    if (data) setCachedData(data);
  }, [data]);

  return {
    open,
    data: cachedData,
    onOpenChange
  } as const
}
