
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { TabsContent } from "@/core/components/ui/tabs";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { User } from "../../schemas";
import { useUpdateUser } from "../../hooks/useUpdateUser";
import { useDeleteUser } from "../../hooks/useDeleteUser";

interface UserDetailsMoreViewProps {
  user: User;
  onUserUpdated?: (updatedUser: User) => void;
  onUserDeleted?: () => void;
  onClose?: () => void;
}

export function UserDetailsMoreView({ user, onUserUpdated, onUserDeleted, onClose }: UserDetailsMoreViewProps) {

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();

  const handleToggleActive = async () => {
    try {
      const result = await updateUser.mutateAsync({
        userId: user.id,
        updates: { is_active: !user.is_active }
      });
      if (result?.user && onUserUpdated) onUserUpdated(result.user);
      onClose?.()
    } catch (err) {
      // toast on mutation
    }
  };

  const handleDelete = async () => {
    setConfirmDeleteOpen(false);
    try {
      await deleteUser.mutateAsync(user.id);
      if (onUserDeleted) onUserDeleted();
      onClose?.()
    } catch (err) {
      // toast on mutation
    }
  };

  return (
    <TabsContent value="More" className="py-4 flex flex-col gap-4 flex-1 overflow-y-auto">
      <div className="rounded-md border border-blue-200 dark:border-blue-900 p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          {user.is_active ? (
            <ShieldCheck className="size-4 text-green-500" />
          ) : (
            <ShieldAlert className="size-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium">
            {user.is_active ? "Activated Account" : "Deactivated Account"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {user.is_active
            ? "This user can log in and use the system."
            : "This user cannot log in. Reactivate to restore access."}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={handleToggleActive}
          disabled={updateUser.isPending}
        >
          {user.is_active ? "Deactivate Account" : "Activate Account"}
        </Button>
      </div>

      <div className="rounded-md border border-destructive/30 p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">Delete Account</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Permanently delete <span className="font-medium text-foreground">{user.first_name} {user.last_name}</span>.
        </p>
        <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteOpen(true)}>
          <AlertTriangle className="size-3" /> Delete Account
        </Button>
      </div>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {user.first_name} {user.last_name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TabsContent>
  );
}
