import { useNavigate } from "@tanstack/react-router";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/core/components/ui/tooltip";
import { VerificationStatusCell } from "./VerificationStatusCell";
import { Badge } from "@/core/components/ui/badge";
import { capitalizeFirst } from "@/core/utils/string";
import React from "react";

type StatusWithRetakeCellProps = {
  verificationStatus: "approved" | "pending" | "rejected" | "unknown" | null | undefined;
  isRetake: boolean | undefined;
  originalId: number | null | undefined;
  formType: string;
};

export const StatusWithRetakeCell = ({
  verificationStatus,
  isRetake,
  originalId,
  formType,
}: StatusWithRetakeCellProps) => {

  const navigate = useNavigate();

  const handleViewOriginal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (originalId) {
      navigate({ to: '/forms/$formType/$id', params: { formType, id: originalId }, });
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <VerificationStatusCell value={verificationStatus} variant={verificationStatus} />
      {isRetake && originalId && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <RetakeBadgeButton onClick={handleViewOriginal} />
            </TooltipTrigger>
            <TooltipContent>View original rejected form</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};



export const CollectionStatusWithRetakeCell = ({ row }: { row: any }) => {
  const navigate = useNavigate();
  const verificationStatus = row.original.verification_status;
  const isRetake = row.original.is_retake;
  const originalActivityId = row.original.original_activity_id;
  const formType = row.original.activity_type;

  const handleViewOriginal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (originalActivityId) {
      navigate({
        to: '/forms/$formType/$id',
        params: { formType, id: originalActivityId },
      });
    }
  };

  const hasVerification = verificationStatus != null && verificationStatus !== '';

  return (
    <div className="flex flex-col items-start gap-1">
      {hasVerification ? (
        <VerificationStatusCell value={verificationStatus} variant={verificationStatus} />
      ) : (
        <Badge variant={row.original.status === "completed" ? "default" : "warning"}>
          {capitalizeFirst(row.original.status)}
        </Badge>
      )}
      {isRetake && originalActivityId && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <RetakeBadgeButton onClick={handleViewOriginal} />
            </TooltipTrigger>
            <TooltipContent>Click to view original rejected form</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};


function RetakeBadgeButton({ onClick, ...rest }: React.ComponentProps<"button">) {
  return (
    <button
      onClick={onClick}
      className="cursor-pointer text-3xs bg-neutral-200 text-primary/75 rounded-sm px-2 py-1 font-medium w-16 text-center"
      {...rest}
    >
      Retake
    </button>
  )
}
