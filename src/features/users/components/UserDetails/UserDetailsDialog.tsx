import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { User } from "../../schemas";
import { UserDetailsMoreView } from "./MoreView";
import { UserDetailsOverviewView } from "./OverviewView";
import { UserDetailsSecurityView } from "./SecurityView";

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated?: (updatedUser: User) => void;
  onUserDeleted?: () => void;
}

export function UserDetailsDialog({ user, open, onOpenChange, onUserUpdated, onUserDeleted }: UserDetailsDialogProps) {

  const [isEditing, setIsEditing] = useState(false);
  const [onOverview, setOnOverview] = useState(true);

  if (!user) return null;

  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  const fullName = `${user.first_name} ${user.last_name}`;

  const handleTabChange = (value: string) => {
    setOnOverview(value === "Overview")
    if (isEditing) {
      setIsEditing(false);
    }
  };

  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen) {
      setIsEditing(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-150 h-160 p-0 gap-0 overflow-hidden flex flex-col">
        <div className="px-4 pt-6 pb-4">
          <DialogHeader className="mb-0">
            <div className="flex gap-4 items-center">
              <div className="size-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-muted-foreground tracking-tight">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-base font-semibold leading-tight">
                  {fullName}
                  {!isEditing && onOverview && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="ml-2 size-4 p-0 text-muted-foreground cursor-pointer">
                      <Pencil className="size-3.5" />
                    </Button>
                  )}
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <Tabs defaultValue="Overview" onValueChange={handleTabChange} className="flex flex-col flex-1 min-h-0 px-4 w-full ">
          <TabsList variant="line" className="w-full">
            {["Overview", "Security", "More"].map((tab) => (
              <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
            ))}
          </TabsList>

          <UserDetailsOverviewView
            user={user}
            onUserUpdated={onUserUpdated}
            isEditing={isEditing}
            onEditComplete={() => setIsEditing(false)}
            onClose={() => onOpenChange(false)}
          />
          <UserDetailsSecurityView
            user={user}
            onClose={() => onOpenChange(false)}
          />
          <UserDetailsMoreView
            user={user}
            onUserUpdated={onUserUpdated}
            onUserDeleted={onUserDeleted}
            onClose={() => onOpenChange(false)}
          />
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

