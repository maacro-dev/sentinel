import { BarangayYieldTopBottomRanked } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import { memo } from "react";


interface BarangayYieldRankProps {
  ranking: "top" | "bottom";
  data: BarangayYieldTopBottomRanked;
  title: string;
  titleSuffix?: React.ReactNode;
  description: string;
}

export const BarangayYieldRank = memo(({ ranking, data, title, titleSuffix, description }: BarangayYieldRankProps) => {
  return (
    <Card className="flex-1 shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex flex-row items-center gap-2">{title} {titleSuffix}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {data.map((barangay, index) => (
            <div key={barangay.barangay_name + barangay.category} className="flex flex-row justify-between items-end">
              <div className="flex flex-row items-center">
                <span className="text-muted-foreground text-[0.7rem]">{index + 1}</span>
                <div className="flex flex-col mx-6">
                  <span>{barangay.barangay_name}</span>
                  <span className="text-muted-foreground/75 text-[0.7rem]">{barangay.municipality_name}, {barangay.province_name}</span>
                </div>
              </div>
              <div className="flex flex-col items-end ml-auto">
                <span className={cn("font-semibold text-base",ranking === "top" ? "text-humay" : "text-red-500")}>
                  {barangay.avg_yield_t_per_ha}
                  <span className="text-muted-foreground/60 align-middle ml-2 font-normal text-[0.65rem]">t/ha</span>
                </span>
              </div>
            </div>
        ))}
      </CardContent>
    </Card>
  )
})
