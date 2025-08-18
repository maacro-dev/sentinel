import { Dialog, DialogTrigger, DialogContent } from "@/core/components/ui/dialog"
import React from "react"


interface ExpandableStatCardProps {
  statCard: React.ReactNode
}

export const ExpandableStatCard = ({ statCard }: ExpandableStatCardProps) => {
  return (
    <Dialog>
      <DialogTrigger>
        {statCard}
      </DialogTrigger>
      <DialogContent>
        <h1>Hey, nigga</h1>
      </DialogContent>
    </Dialog>
  )
}