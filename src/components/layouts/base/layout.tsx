import { Suspense } from "react";
import { BaseContent } from "./content";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FadeInDiv } from "@/components/animation";
import { BaseHeader, HeaderSkeleton } from "./header";
import { SidebarSkeleton } from "./sidebar";
import { BaseSidebarProps } from "./sidebar";

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
          <FadeInDiv direction="down">
            <SidebarSkeleton />
          </FadeInDiv>
        }>
        <FadeInDiv direction="up">
          {sidebarSlot}
        </FadeInDiv>
      </Suspense>
      <SidebarInset>
        <Suspense
          fallback={
            <FadeInDiv direction="down">
              <HeaderSkeleton />
            </FadeInDiv>
          }
        >
          <FadeInDiv direction="up">
            {headerSlot}
          </FadeInDiv>
        </Suspense>
        <Suspense
          fallback={
            <FadeInDiv direction="down">
              <div className="h-full" />
            </FadeInDiv>
          }
        >
          <FadeInDiv direction="up" className="h-full">
            <BaseContent>{children}</BaseContent>
          </FadeInDiv>
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
};
