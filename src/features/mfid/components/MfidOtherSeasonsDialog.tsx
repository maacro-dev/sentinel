import { useCollectionTasksByMfid } from '@/features/collection/hooks/useCollectionTaskByMfid';
import { format, parseISO } from 'date-fns';
import { Button } from '@/core/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/core/components/ui/dialog';
import { CheckCircle2, ChevronRight, Circle, Clock, History, Import, RotateCcw, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CollectionTask } from '@/features/collection/schemas/collection.schema';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/core/components/ui/table';
import {
  CoreMetadataType,
  CORE_METADATA_TYPES,
} from '@/features/forms/schemas/forms';
import { getActivityTypeLabel } from '@/features/forms/utils';
import { useSeasons } from '@/features/fields/hooks/useSeasons';
import { SeasonRow } from '@/features/fields/schemas/seasons';
import { getSeasonDisplayLabel } from '@/features/fields/util';
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/core/components/ui/tooltip';
import { cn } from '@/core/utils/style';

export function MfidOtherSeasonsDialog({ mfid }: { mfid: string }) {
  const { data: allTasks, isLoading: tasksLoading } = useCollectionTasksByMfid(mfid);
  const { data: seasons = [], isLoading: seasonsLoading } = useSeasons();

  const seasonMap = useMemo(() => {
    const map = new Map<number, SeasonRow>();
    seasons.forEach(s => map.set(s.id, s));
    return map;
  }, [seasons]);

  const groupedBySeason = useMemo(() => {
    if (!allTasks) return new Map<number, CollectionTask[]>();

    const map = new Map<number, CollectionTask[]>();
    allTasks.forEach(task => {
      const seasonTasks = map.get(task.season_id) || [];
      seasonTasks.push(task);
      map.set(task.season_id, seasonTasks);
    });

    return new Map(
      Array.from(map.entries()).sort((a, b) => {
        const seasonA = seasonMap.get(a[0]);
        const seasonB = seasonMap.get(b[0]);
        if (!seasonA?.start_date) return 1;
        if (!seasonB?.start_date) return -1;
        return new Date(seasonB.start_date).getTime() - new Date(seasonA.start_date).getTime();
      })
    );
  }, [allTasks, seasonMap]);

  const isLoading = tasksLoading || seasonsLoading;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs text-muted-foreground">
          <History className="size-3.5 mr-1" />
          Other Seasons
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-none sm:max-w-none w-lvh h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Other Seasons – {mfid}</DialogTitle>
          <DialogDescription>
            Collection task summary across all seasons
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Loading tasks...
          </div>
        ) : groupedBySeason.size === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            No tasks found for other seasons
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            <div className="space-y-6">
              {Array.from(groupedBySeason.entries()).map(([seasonId, tasks]) => {
                const season = seasonMap.get(seasonId);
                return (
                  <SeasonSummaryCard
                    key={seasonId}
                    season={season}
                    tasks={tasks}
                    allSeasons={seasons}
                  />
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

const formatDateShort = (date: Date): string => {
  return format(date, 'MMM d, yyyy');
};

const formatSeasonLabel = (season: SeasonRow): string => {
  const start = new Date(season.start_date);
  const end = new Date(season.end_date);
  return `${formatDateShort(start)} – ${formatDateShort(end)}`;
};


function SeasonSummaryCard({
  season,
  tasks,
  allSeasons,
}: {
  season?: SeasonRow;
  tasks: CollectionTask[];
  allSeasons: SeasonRow[];
}) {
  const seasonLabel = season
    ? getSeasonDisplayLabel(season, allSeasons)
    : 'Unknown Season';
  const dateRangeLabel = season ? formatSeasonLabel(season) : '';

  const groupedTasks = useMemo(() => {
    const groups: Record<CoreMetadataType, CollectionTask[]> = {} as any;
    CORE_METADATA_TYPES.forEach(type => (groups[type] = []));
    tasks.forEach(task => {
      if (CORE_METADATA_TYPES.includes(task.activity_type as any)) {
        groups[task.activity_type as CoreMetadataType].push(task);
      }
    });
    for (const type of CORE_METADATA_TYPES) {
      groups[type].sort(
        (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );
    }
    return groups;
  }, [tasks]);

  const [expandedTypes, setExpandedTypes] = useState<Set<CoreMetadataType>>(
    new Set()
  );

  const toggleExpand = (type: CoreMetadataType) => {
    setExpandedTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const getVerificationIcon = (task: CollectionTask) => {

    console.log("getVerificationIcon", task.verification_status)

    if (task.status !== 'completed') {
      return <Circle className="size-3.5 text-muted-foreground" />;
    }

    switch (task.verification_status) {
      case 'approved':
        return <CheckCircle2 className="size-3.5 text-green-600" />;
      case 'rejected':
        return <XCircle className="size-3.5 text-red-600" />;
      case 'pending':
        return <Clock className="size-3.5 text-amber-500" />;
      case 'unknown':
        return <Import className="size-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-card">
      <div className="mb-3 flex flex-col gap-1">
        <h3 className="font-medium text-sm leading-tight">{dateRangeLabel}</h3>
        {seasonLabel && (
          <p className="text-3xs text-muted-foreground leading-tight">
            {seasonLabel}
          </p>
        )}
      </div>

      <Table className="table-fixed w-full">
        <TableHeader className="text-3xs">
          <TableRow className="border-b">
            <TableHead className="w-6 py-1 h-6"></TableHead>
            <TableHead className="w-1/4 py-1 h-6">Form</TableHead>
            <TableHead className="w-1/4 py-1 h-6 text-center">Status</TableHead>
            <TableHead className="w-1/4 py-1 h-6">Collector</TableHead>
            <TableHead className="w-1/4 py-1 h-6">Dates</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-3xs">
          {CORE_METADATA_TYPES.map(formType => {
            const typeTasks = groupedTasks[formType];
            const hasTasks = typeTasks.length > 0;
            const latestTask = hasTasks ? typeTasks[0] : undefined;
            const previousTasks = hasTasks ? typeTasks.slice(1) : [];
            const isExpanded = expandedTypes.has(formType);

            if (!hasTasks) {
              return (
                <TableRow key={formType} className="border-t hover:bg-muted/30">
                  <TableCell className="py-2.5"></TableCell>
                  <TableCell className="py-2.5 font-medium">
                    {getActivityTypeLabel(formType)}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex items-center justify-center h-full">—</div>
                  </TableCell>
                  <TableCell className="py-2.5">—</TableCell>
                  <TableCell className="py-2.5">—</TableCell>
                </TableRow>
              );
            }

            return (
              <React.Fragment key={formType}>
                <TableRow
                  className={cn(
                    'border-t hover:bg-muted/30 transition-colors',
                    previousTasks.length > 0 && 'cursor-pointer'
                  )}
                  onClick={() => previousTasks.length > 0 && toggleExpand(formType)}
                >
                  <TableCell className="py-2.5 w-4">
                    {previousTasks.length > 0 && (
                      <ChevronRight
                        className={cn(
                          'size-3 text-muted-foreground transition-transform duration-200',
                          isExpanded && 'rotate-90'
                        )}
                      />
                    )}
                  </TableCell>
                  <TableCell className="py-2.5 font-medium">
                    <div className="flex items-center gap-1">
                      {getActivityTypeLabel(formType)}
                      {latestTask!.retake_of && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <RotateCcw className="size-3 text-amber-600" />
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p className="text-3xs">Retake</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className="flex items-center justify-center h-full">
                      {getVerificationIcon(latestTask!)}
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    {latestTask!.collector_name || '—'}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="text-muted-foreground">
                      {format(parseISO(latestTask!.start_date), 'MMM d')} –{' '}
                      {format(parseISO(latestTask!.end_date), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                </TableRow>

                {isExpanded &&
                  previousTasks.map(task => (
                    <TableRow
                      key={task.id}
                      className="bg-muted/20 border-t hover:bg-muted/30"
                    >
                      <TableCell className="py-2.5"></TableCell>
                      <TableCell className="py-2.5 pl-6 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <span className="text-3xs">↳</span>
                          <span className="text-3xs">Previous</span>
                          {task.retake_of && (
                            <RotateCcw className="size-2.5 text-amber-600 ml-1" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <div className="flex items-center justify-center h-full">
                          {getVerificationIcon(task)}
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5 text-muted-foreground">
                        {task.collector_name || '—'}
                      </TableCell>
                      <TableCell className="py-2.5 text-muted-foreground">
                        {format(parseISO(task.start_date), 'MMM d')} –{' '}
                        {format(parseISO(task.end_date), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
