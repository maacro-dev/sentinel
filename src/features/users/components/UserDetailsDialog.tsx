import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { Badge } from "@/core/components/ui/badge";
import { Button } from "@/core/components/ui/button";
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { format, formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Copy,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { User } from "../schemas";
import { KVItem } from "@/core/components/KeyValue";
import { getRoleLabel } from "../utils";

interface UserDetailsDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailsDialog({ user, open, onOpenChange }: UserDetailsDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSuspended, setIsSuspended] = useState(false);

  if (!user) return null;

  const initials = `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  const fullName = `${user.first_name} ${user.last_name}`;

  const passwordsMatch = newPassword === confirmPassword;
  const passwordValid = newPassword.length >= 8;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 h-160 p-0 gap-0 overflow-hidden flex flex-col">
        <div className="px-4 pt-6 pb-4">
          <DialogHeader className="mb-0">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-muted-foreground tracking-tight">{initials}</span>
              </div>

              <div className="min-w-0">
                <DialogTitle className="text-base font-semibold leading-tight">{fullName}</DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <Tabs defaultValue="Overview" className="flex flex-col flex-1 min-h-0 px-4">
          <TabsList variant="line">
            {["Overview", "Security", "More"].map((tab) => (
              <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
            ))}
          </TabsList>

          <UserDetailsOverviewView user={user} isSuspended={isSuspended} />

          <UserDetailsSecurityView
            user={user}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            setNewPassword={setNewPassword}
            setConfirmPassword={setConfirmPassword}
            passwordsMatch={passwordsMatch}
            passwordValid={passwordValid}
          />

          <UserDetailsMoreView
            fullName={fullName}
            isSuspended={isSuspended}
            setIsSuspended={setIsSuspended}
          />
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function UserDetailsOverviewView({ user, isSuspended }: { user: User, isSuspended: boolean }) {
  return (
    <TabsContent value="Overview" className="py-4 flex-1 flex flex-col gap-4">
      <KVItem icon={<UserIcon className="size-4" />} pair={{ key: "Full Name", value: `${user.first_name} ${user.last_name}` }} />
      <KVItem
        icon={<Mail className="size-4" />}
        pair={{
          key: "Email Address",
          value: (
            <div className="flex items-center gap-2">
              <span className="truncate">{user.email}</span>
              <button
                onClick={() => navigator.clipboard.writeText(user.email)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="size-3" />
              </button>
            </div>
          ),
        }}
      />
      <KVItem icon={<ShieldCheck className="size-4" />} pair={{
        key: "Role", value: <span className="capitalize">
          <div className="mt-1.5">
            {isSuspended && <Badge variant="destructive" className="text-3xs py-1.5 px-2">Suspended</Badge>}
            <Badge variant="outline" className="text-3xs py-1.5 px-2">{getRoleLabel(user.role)}</Badge>
          </div>
        </span>
      }} />
      <KVItem icon={<Calendar className="size-4" />} pair={{ key: "Date of Birth", value: format(user.date_of_birth, "PPP") }} />
      <KVItem
        icon={<Clock className="size-4" />}
        pair={{
          key: "Last Sign In",
          value: user.last_sign_in_at
            ? `${format(user.last_sign_in_at, "PPP 'at' p")} (${formatDistanceToNow(user.last_sign_in_at, { addSuffix: true })})`
            : "Never",
        }}
      />
      <KVItem icon={<Calendar className="size-4" />} pair={{ key: "Member Since", value: format(user.created_at, "PPP") }} />
      <div className="pt-4">
        <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2 block">
          Change Role
        </Label>
        <div className="flex gap-2">
          <Select value={"data_manager"} onValueChange={() => { }}>
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="data_collector" className="text-xs">Data Collector</SelectItem>
              <SelectItem value="data_manager" className="text-xs">Data Manager</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8 text-xs px-3">
            Save
          </Button>
        </div>
      </div>
    </TabsContent>
  );
}


interface UserDetailsSecurityViewProps {
  user: User
  newPassword: string
  confirmPassword: string
  setNewPassword: (v: string) => void
  setConfirmPassword: (v: string) => void
  passwordsMatch: boolean
  passwordValid: boolean
}

function UserDetailsSecurityView({
  user,
  newPassword,
  confirmPassword,
  setNewPassword,
  setConfirmPassword,
  passwordsMatch,
  passwordValid,
}: UserDetailsSecurityViewProps) {

  return (
    <TabsContent value="Security" className="py-4 flex-1 flex flex-col gap-4 overflow-y-auto">
      <div className="rounded-md border p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Send Password Reset Email</span>
        </div>

        <p className="text-xs text-muted-foreground">
          An email will be sent to <span className="font-medium text-foreground">{user.email}</span> with a link to reset their password.
        </p>

        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
          <RefreshCw className="size-3" />
          Send Reset Email
        </Button>
      </div>

      <div className="rounded-md border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Set New Password</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Manually set a new password for this user.
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-xs">New Password</Label>
            <Input
              id="new-password"
              type="password"
              className="text-xs"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm-password" className="text-xs">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              className="text-xs"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-destructive">Passwords do not match.</p>
            )}
          </div>

          <Button
            size="sm"
            className="h-8 text-xs gap-1.5 w-full"
            disabled={!passwordValid || !passwordsMatch || !confirmPassword}
          >
            <KeyRound className="size-3" />
            Update Password
          </Button>
        </div>
      </div>
    </TabsContent>
  )
}


interface UserDetailsMoreViewProps {
  fullName: string
  isSuspended: boolean
  setIsSuspended: (v: boolean) => void
}

function UserDetailsMoreView({
  fullName,
  isSuspended,
  setIsSuspended,
}: UserDetailsMoreViewProps) {

  return (
    <TabsContent value="More" className="py-4 flex flex-col gap-4 flex-1 overflow-y-auto">

      <div className="rounded-md border border-amber-200 dark:border-amber-900 p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-4 text-amber-500" />
          <span className="text-sm font-medium">
            {isSuspended ? "Unsuspend Account" : "Suspend Account"}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          {isSuspended
            ? "Restore this user's access."
            : "Prevent this user from signing in."}
        </p>

        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5 border-amber-300 text-amber-700"
          onClick={() => setIsSuspended(!isSuspended)}
        >
          <ShieldAlert className="size-3" />
          {isSuspended ? "Unsuspend User" : "Suspend User"}
        </Button>
      </div>

      <div className="rounded-md border border-destructive/30 p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">
            Delete Account
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          Permanently delete <span className="font-medium text-foreground">{fullName}</span>.
        </p>

        <Button variant="destructive" size="sm" className="h-8 text-xs gap-1.5">
          <AlertTriangle className="size-3" />
          Delete Account
        </Button>
      </div>

    </TabsContent>
  )
}
