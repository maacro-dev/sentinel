import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 960;
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    if (mql.addEventListener) {
      mql.addEventListener("change", handler);
    } else {
      mql.addListener(handler);
    }
    return () => {
      mql.removeEventListener("change", handler);
    };
  }, []);

  return isMobile;
}
