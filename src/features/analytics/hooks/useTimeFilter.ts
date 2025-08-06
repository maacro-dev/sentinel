import { useMemo, useState } from "react";
import { Semester } from "@/features/fields/schemas/seasons";
import { TimeRange } from "../types";
import { KeyPath } from "@/core/lib/types";
import { getKeyPathValue } from "@/core/utils/object";

interface SeasonBounds {
  start: { month: number; day: number };
  end: { month: number; day: number };
}

const SEASON_DEFS: Record<Semester, SeasonBounds> = {
  first: { start: { month: 8, day: 16 }, end: { month: 2, day: 15 } }, // Sep 16 – Mar 15
  second: { start: { month: 2, day: 16 }, end: { month: 8, day: 15 } }, // Mar 16 – Sep 15
};

export function getCurrentSeasonBounds(now = new Date()) {
  const m = now.getMonth();
  const d = now.getDate();

  const inSecond =
    (m > SEASON_DEFS.second.start.month ||
      (m === SEASON_DEFS.second.start.month && d >= SEASON_DEFS.second.start.day)) &&
    (m < SEASON_DEFS.second.end.month ||
      (m === SEASON_DEFS.second.end.month && d <= SEASON_DEFS.second.end.day));

  const seasonKey = inSecond ? "second" : "first";
  const { start, end } = SEASON_DEFS[seasonKey];

  const yearForStart =
    m > start.month || (m === start.month && d >= start.day)
      ? now.getFullYear()
      : now.getFullYear() - 1;

  const seasonStart = new Date(yearForStart, start.month, start.day);
  const seasonEndYear = end.month < start.month ? yearForStart + 1 : yearForStart;
  const seasonEnd = new Date(seasonEndYear, end.month, end.day);

  return { seasonStart, seasonEnd };
}

const DAYS_LOOKUP: Record<Extract<TimeRange, `${number}d`>, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
};

interface TimeFilterOptions<T> {
  data: T[];
  dateKey: KeyPath<T>;
  enabled: boolean;
  initialRange?: TimeRange;
}

export function useTimeFilter<T extends object>({
  data,
  dateKey,
  enabled,
  initialRange = "season"
}: TimeFilterOptions<T> ) {

  const [timeRange, setTimeRange] = useState<TimeRange>(initialRange);

  const filteredData = useMemo(() => {
    if (!enabled) return data;

    const now = new Date();

    if (timeRange !== "season") {
      const days = DAYS_LOOKUP[timeRange as keyof typeof DAYS_LOOKUP];
      const cutoff = new Date(+now - days * 24 * 60 * 60 * 1000);
      return data.filter((item) => {
        const d = getKeyPathValue(item, dateKey) as Date;
        return d >= cutoff && d <= now;
      });
    }

    const { seasonStart, seasonEnd } = getCurrentSeasonBounds(now);
    return data.filter((item) => {
      const d = getKeyPathValue(item, dateKey) as Date;
      return d >= seasonStart && d <= seasonEnd;
    });
  }, [data, dateKey, timeRange, enabled]);

  return { timeRange, setTimeRange, filteredData };
}
