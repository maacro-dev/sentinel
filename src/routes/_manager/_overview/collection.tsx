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
    queryClient.ensureQueryData(collectionTasksOptions(seasonId))
    return { breadcrumb: createCrumbLoader({ label: "Data Collection" }) };
  },
  validateSearch: defaultPaginationSearchSchema,
});

function RouteComponent() {
  const { seasonId } = Route.useSearch();
  const { data: currentSeasonId } = useCurrentSeasonId();
  const { navigate, preloadRoute } = useRouter()

  const handleRowClick = useCallback((row: CollectionTask) => {
    console.log("Clicked a collection task row:", row)
    navigate({
      to: "/mfid/$mfid",
      params: { mfid: row.mfid }
    })
  }, [navigate]);

  const handleOnRowIntent = useCallback((row: CollectionTask) => {
    preloadRoute({
      to: "/mfid/$mfid",
      params: { mfid: row.mfid }
    })
  }, [preloadRoute])

  const effectiveSeasonId = seasonId ?? currentSeasonId;

  return (
    <PageContainer className="flex-col">
      <CollectionTable
        seasonId={effectiveSeasonId}
        onRowClick={handleRowClick}
        onRowIntent={handleOnRowIntent}
      />
    </PageContainer>
  );
}
