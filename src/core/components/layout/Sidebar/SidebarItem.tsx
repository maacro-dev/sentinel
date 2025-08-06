import { Link } from "@tanstack/react-router"
import { SidebarMenuItem, SidebarMenuButton } from "@/core/components/ui/sidebar"
import { cn } from "@/core/utils/style"
import { SidebarNode } from "./types"

export function SidebarItem({ node }: { node: SidebarNode }) {

  if (node.disabled) {
    return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={"Not yet implemented"} className="cursor-not-allowed opacity-50">
        <div className="flex items-center gap-2.5 text-primary/70 transition-colors">
          <node.icon className="size-4" />
        </div>
        <span className="text-[0.7rem]">{node.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
    )
  }

  if (node.isDynamic) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={node.label}>
          <Link
            replace
            to={node.path}
            params={node.params}
            className={cn("flex items-center gap-2.5 text-primary/70 transition-all")}
            activeProps={{ className: "text-primary/100 font-medium bg-accent" }}
          >
            <node.icon className="size-4" />
            <span className="text-[0.7rem]">{node.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }


  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={node.label}>
        <Link
          replace
          to={node.path}
          className={cn("flex items-center gap-2.5 text-primary/70 transition-all")}
          activeProps={{ className: "text-primary/100 font-medium bg-accent" }}
        >
          <node.icon className="size-4" />
          <span className="text-[0.7rem]">{node.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
