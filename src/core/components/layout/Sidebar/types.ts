import { Path } from "@/core/tanstack/router/types"
import { AnyPathParams } from "@tanstack/react-router"

export type SidebarNode<T extends Path = Exclude<Path, "Unknown">> = BaseSidebarNode<T> & (
  | { isDynamic?: false; children?: SidebarNode<T>[] }
  | { isDynamic: true; params: AnyPathParams; children?: SidebarNode<T>[] }
)

type BaseSidebarNode<T extends Path> = {
  id: string
  label: string
  icon: any
  disabled: boolean
  path: T
}
