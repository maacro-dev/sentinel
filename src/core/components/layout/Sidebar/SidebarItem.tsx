import { Link } from "@tanstack/react-router"
import { SidebarMenuItem, SidebarMenuButton } from "@/core/components/ui/sidebar"
import { LucideIcon } from "lucide-react"
import { cn } from "@/core/utils/style"

interface SidebarLinkProps {
  label: string
  path: string
  icon: LucideIcon
  disabled?: boolean
}

export function SidebarLink(item: SidebarLinkProps) {

  if (item.disabled) {
    return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={"Not yet implemented"} className="cursor-not-allowed opacity-50">
        <div className="flex items-center gap-2.5 text-primary/70 transition-colors">
          <item.icon className="size-4" />
        </div>
        <span className="text-[0.7rem]">{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
    )
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip={item.label}>
        <Link
          to={item.path}
          className={cn("flex items-center gap-2.5 text-primary/70 transition-colors")}
          activeProps={{ className: "text-primary/100 font-semibold bg-accent" }}
        >
          <item.icon className="size-4" />
          <span className="text-[0.7rem]">{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
