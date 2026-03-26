// @ts-nocheck

import { useImportNotificationStore } from '@/features/import/store/useImportNotificationStore';
import { useCurrentSeason } from '@/features/fields/hooks/useSeasons';
import { Link } from '@tanstack/react-router';
import { cn } from '@/core/utils/style';
import { SidebarMenuItem, SidebarMenuButton } from '@/core/components/ui/sidebar';
import { SidebarNode } from './types';

export function SidebarItem({ node }: { node: SidebarNode }) {
  const { importedSeasonId, importedFormType, clearFormType } = useImportNotificationStore();
  const { selected: currentSeason } = useCurrentSeason();
  const currentSeasonId = currentSeason?.id;

  const isNotified =
    node.params?.formType &&
    importedFormType === node.params.formType &&
    importedSeasonId === currentSeasonId;

  const handleClick = () => {
    if (isNotified) {
      clearFormType();
    }
  };

  const badge = isNotified && (
    <span className="absolute top-1/2 -translate-y-1/2 right-2 flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
    </span>
  );

  if (node.disabled) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Not yet implemented"
          className="relative cursor-not-allowed opacity-50 overflow-visible"
        >
          <node.icon className="size-4" />
          <span className="text-3xs">{node.label}</span>
          {badge}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (node.isDynamic) {
    return (
      <SidebarMenuItem >
        <SidebarMenuButton asChild tooltip={node.label} className="overflow-visible">
          <Link
            replace
            to={node.path}
            params={node.params}
            className={cn(
              "relative flex items-center gap-2.5 text-primary/70 transition-all overflow-visible"
            )}
            activeProps={{ className: "text-primary/100 font-medium bg-accent" }}
            onClick={handleClick}
          >
            <node.icon className="size-4" />
            <span className="text-3xs">{node.label}</span>
            {badge}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem className='overflow-visible'>
      <SidebarMenuButton asChild tooltip={node.label} className="overflow-visible">
        <Link
          replace
          to={node.path}
          className={cn(
            "relative flex items-center gap-2.5 text-primary/70 transition-all overflow-visible"
          )}
          activeProps={{ className: "text-primary/100 font-medium bg-accent" }}
          onClick={handleClick}
        >
          <node.icon className="size-4" />
          <span className="text-3xs">{node.label}</span>
          {badge}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
