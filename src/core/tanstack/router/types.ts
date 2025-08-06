import { LucideIcon } from "lucide-react";
import { FileRoutesByTo } from "./routeTree.gen";
import { ColumnDef } from "@tanstack/react-table";
import { AnyPathParams } from "@tanstack/react-router";

// https://github.com/TanStack/router/discussions/824#discussioncomment-12342295
export type Path = keyof FileRoutesByTo;

// marker type
export type ParentPath = string

export type RouteConfig<T extends string = string, P extends Path = Path> = {
  id?: T;
  role: string;
  path?: P;
  params?: AnyPathParams
  label: string;
  icon?: LucideIcon;
  disabled?: boolean;
  meta?: {
    tableColumns?: ColumnDef<any, any>[]
  }
  children?: readonly RouteConfig[];
}

export type RouteConfigIds<T> =
  T extends { id: infer InferID extends string }
    ? InferID
    : never
  | (T extends { children: ReadonlyArray<infer C> }
      ? RouteConfigIds<C>
      : never);
