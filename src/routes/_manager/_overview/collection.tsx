import { createFileRoute, useRouter } from "@tanstack/react-router";
import { PageContainer } from "@/core/components/layout";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { useCallback } from "react";
import { useCurrentSeasonId } from "@/features/fields/hooks/useSeasons";
import { CollectionTable } from "@/features/collection/components/CollectionTable/CollectionTable";
import { defaultPaginationSearchSchema } from "@/core/components/TablePagination";
import { CollectionTask } from "@/features/collection/schemas/collection.schema";
import { collectionTasksOptions } from "@/features/collection/hooks/useCollectionTasks";

export const Route = createFileRoute("/_manager/_overview/collection")({
  component: RouteComponent,
  head: () => ({ meta: [{ title: "Data Collection | Humay" }] }),
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: ({ context: { queryClient }, deps: { seasonId } }) => {
    const sid = seasonId === "all" ? null : seasonId;
    queryClient.ensureQueryData(collectionTasksOptions(sid));
    return { breadcrumb: createCrumbLoader({ label: "Data Collection" }) };
  },
  validateSearch: defaultPaginationSearchSchema,
});

function RouteComponent() {
  const { seasonId } = Route.useSearch();

  const { data: currentSeasonId } = useCurrentSeasonId();
  const effectiveSeasonId = seasonId === "all" ? null : seasonId ?? currentSeasonId;

  const { navigate, preloadRoute } = useRouter();

  const handleRowClick = useCallback((row: CollectionTask) => {
    navigate({ to: "/mfid/$mfid", params: { mfid: row.mfid } });
  }, [navigate]);

  const handleOnRowIntent = useCallback((row: CollectionTask) => {
    preloadRoute({ to: "/mfid/$mfid", params: { mfid: row.mfid } });
  }, [preloadRoute]);

  return (
    <PageContainer className="flex-col">
      <CollectionTable
        seasonId={effectiveSeasonId}
        onRowClick={handleRowClick}
        onRowIntent={handleOnRowIntent}
        showSeasonColumn={seasonId === "all"}
      />
    </PageContainer>
  );
}
