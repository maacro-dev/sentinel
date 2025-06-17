import { HumayBaseContent } from "./content";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { HumayBaseHeader } from "./header";

type HumayBaseLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};
export const HumayBaseLayout = ({ children, sidebar }: HumayBaseLayoutProps) => {
  return (
    <SidebarProvider>
      {sidebar}
      <SidebarInset>
        <HumayBaseHeader />
        <HumayBaseContent>{children}</HumayBaseContent>
      </SidebarInset>
    </SidebarProvider>
  );
};
