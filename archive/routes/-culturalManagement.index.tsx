import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { Folder } from "lucide-react";
import { PageContainer } from "@/core/components/layout/PageContainer";

export const Route = createFileRoute("/_manager/forms/culturalManagement/")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Cultural Management | Humay" }],
  }),
  staticData: {
    role: "data_manager",
    label: "Cultural Management",
    sidebar: {
      order: 2,
      icon: Folder,
    },
  },
});

function RouteComponent() {
  return (
    <PageContainer>
      <PlaceholderBody />
    </PageContainer>
  );
}
