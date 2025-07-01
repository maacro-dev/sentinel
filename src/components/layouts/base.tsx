import { Suspense } from "react";
import { BaseContent } from "../base/content";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FadeIn } from "@/components/animation";
import { BaseHeader, HeaderSkeleton } from "@/components/base/header";
import { SidebarSkeleton } from "@/components/base/sidebar";
import type { BaseSidebarProps } from "@/components/base/sidebar";

type HumayBaseLayoutProps = {
  sidebarSlot?: React.ReactElement<BaseSidebarProps>;
  headerSlot?: React.ReactElement;
  children: React.ReactNode;
};

export const BaseLayout = ({
  children,
  sidebarSlot,
  headerSlot = <BaseHeader />,
}: HumayBaseLayoutProps) => {
  return (
    <SidebarProvider>
      <Suspense
        fallback={
          <FadeIn direction="down">
            <SidebarSkeleton />
          </FadeIn>
        }>
        <FadeIn direction="up">
          {sidebarSlot}
        </FadeIn>
      </Suspense>
      <SidebarInset>
        <Suspense
          fallback={
            <FadeIn direction="down">
              <HeaderSkeleton />
            </FadeIn>
          }
        >
          <FadeIn direction="up">
            {headerSlot}
          </FadeIn>
        </Suspense>
        <Suspense
          fallback={
            <FadeIn direction="down">
              <div className="h-full" />
            </FadeIn>
          }
        >
          <FadeIn direction="up" className="h-full">
            <BaseContent>{children}</BaseContent>
          </FadeIn>
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
};
