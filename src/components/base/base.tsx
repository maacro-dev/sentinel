import { Suspense } from "react";
import { HumayBaseContent } from "./content";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { HeaderSkeleton, HumayBaseHeader } from "./header";
import { SidebarSkeleton } from "./sidebar";
import { FadeIn } from "@/components/motion";

type HumayBaseLayoutProps = {
  sidebar: React.LazyExoticComponent<React.ComponentType>;
  children: React.ReactNode;
};

export const HumayBaseLayout = ({ children, sidebar: Sidebar }: HumayBaseLayoutProps) => {
  return (
    <SidebarProvider>
      <Suspense
        fallback={
          <FadeIn direction="down">
            <SidebarSkeleton />
          </FadeIn>
        }
      >
        <FadeIn direction="up">
          <Sidebar />
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
            <HumayBaseHeader />
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
            <HumayBaseContent>{children}</HumayBaseContent>
          </FadeIn>
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
};
