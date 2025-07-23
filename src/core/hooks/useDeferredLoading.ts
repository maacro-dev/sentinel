import { useEffect, useState } from "react";

export const useDeferredLoading = (isLoading: boolean = true, delay = 300) => {
  const [deferred, setDeferred] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isLoading) {
      timer = setTimeout(() => setDeferred(true), delay);
    } else {
      setDeferred(false);
      if (timer) clearTimeout(timer);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, delay]);

  return deferred;
};
