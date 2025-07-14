export type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

export type {
  RouteMetadata,
  RouteGroup,
  RouteWithStaticData,
  RouteBreadcrumb,
} from "./route";

export type {
  SidebarData,
  SidebarSectionMap,
  SidebarStaticData,
  SidebarItem,
  SidebarSection,
} from "./sidebar";

export type {
  User,
  UserCredentials,
  UserCreate,
  UserStatus,
  Role,
} from "./user";

export type { Result, ErrorResult, SuccessResult } from "./result";

export type {
  FormSubmissionStat,
  SeasonYieldComparisonStat,
  SeasonYieldTimeSeries,
  SeasonIrrigationComparisonStat,
  SeasonHarvestedAreaComparisonStat,
  SeasonFieldCountComparisonStat,
  BarangayYieldTopBottomRanked
} from "./analytics";

export type {
  Field,
  Fields
} from "./field"
