import React from "react"


interface ExpandableStatCardProps {
  statCard: React.ReactNode
}

export const ExpandableStatCard = ({ statCard }: ExpandableStatCardProps) => {
  return statCard
  // return (
  //   <Dialog>
  //     <DialogTrigger>
  //       {statCard}
  //     </DialogTrigger>
  //     <DialogContent>
  //       <DialogHeader>
  //         <DialogTitle>
  //           {/* Stat Detail */}
  //         </DialogTitle>
  //         <DialogDescription>
  //           {/* This is where the details of the stat card should be */}
  //         </DialogDescription>
  //       </DialogHeader>
  //       <div>
  //         <Skeleton className="bg-transparent h-56 flex justify-center items-center text-foreground/20 text-4xl">
  //           (つ•̀ꞈ•̀)つ
  //         </Skeleton>
  //       </div>
  //     </DialogContent>
  //   </Dialog>
  // )
}
