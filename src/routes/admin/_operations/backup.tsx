import { PageContainer } from '@/core/components/layout'
import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef } from "react";
import { Button } from "@/core/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { Input } from "@/core/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/core/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2, Download } from "lucide-react";
import { handleBackup } from "@/features/backup/backup";
import { Field, FieldDescription, FieldLabel } from '@/core/components/ui/field';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/core/components/ui/dialog";
import { useQueryClient } from '@tanstack/react-query';

export const Route = createFileRoute('/admin/_operations/backup')({
  component: RouteComponent,
  loader: () => {
    return { breadcrumb: createCrumbLoader({ label: "Backup" }) }
  },
  head: () => ({
    meta: [{ title: "Backup | Humay" }],
  }),
})

function RouteComponent() {
  const [backupStatus, setBackupStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [backupMessage, setBackupMessage] = useState<string>("");
  const [restoreStatus, setRestoreStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [restoreMessage, setRestoreMessage] = useState<string>("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient()

  const onBackup = async () => {
    setBackupStatus("loading");
    setBackupMessage("");
    try {
      await handleBackup();
      setBackupStatus("success");
      setBackupMessage("Backup downloaded successfully.");
    } catch (err: any) {
      setBackupStatus("error");
      setBackupMessage(err.message || "Backup failed");
    } finally {
      setTimeout(() => {
        if (backupStatus === "success" || backupStatus === "error") {
          setBackupStatus("idle");
          setBackupMessage("");
        }
      }, 5000);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setConfirmOpen(true);
  };

  const handleConfirmRestore = async () => {
    if (!pendingFile) return;
    setConfirmOpen(false);
    setRestoreStatus("loading");
    setRestoreMessage("");

    try {
      const formData = new FormData();
      formData.append("backup", pendingFile);

      const url =
        import.meta.env.DEV
          ? import.meta.env.VITE_SUPABASE_DEV_URL
          : import.meta.env.VITE_SUPABASE_URL;

      if (!url) throw new Error("Missing Supabase URL");

      const response = await fetch(`${url}/functions/v1/backup-restore`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Restore failed");

      setRestoreStatus("success");
      setRestoreMessage("Restore completed successfully.");

      queryClient.invalidateQueries()
    } catch (err: any) {
      setRestoreStatus("error");
      setRestoreMessage(err.message || "Restore failed");
    } finally {
      setTimeout(() => {
        if (restoreStatus === "success" || restoreStatus === "error") {
          setRestoreStatus("idle");
          setRestoreMessage("");
        }
      }, 5000);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setPendingFile(null);
    }
  };

  const handleCancelRestore = () => {
    setConfirmOpen(false);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <PageContainer>
      <Card className='flex flex-col gap-6'>
        <CardHeader>
          <CardTitle>Database Backup</CardTitle>
          <CardDescription> Download a complete backup of all your data (users, forms, fields, etc.) as a compressed file. </CardDescription>
        </CardHeader>
        <CardContent className="">
          <Button onClick={onBackup} disabled={backupStatus === "loading"} className="gap-2 w-fit">
            {backupStatus === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {backupStatus === "loading" ? "Creating backup..." : "Download Backup"}
          </Button>

          {backupStatus === "success" && (
            <Alert variant="default" className="mt-8">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{backupMessage}</AlertDescription>
            </Alert>
          )}

          {backupStatus === "error" && (
            <Alert variant="destructive" className="mt-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{backupMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className='flex flex-col gap-6'>
        <CardHeader>
          <CardTitle>Restore from Backup</CardTitle>
          <CardDescription>
            Upload a previously downloaded backup file (.bak) to restore your database.
            <strong className="block mt-2 text-amber-600 font-medium">
              Warning: This will overwrite existing data. Proceed with caution.
            </strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field className='w-96 '>
            <FieldLabel htmlFor="backup-file" className='text-xs'>Restore</FieldLabel>
            <Input
              ref={fileInputRef}
              id="backup-file"
              type="file"
              accept=".bak"
              onChange={handleFileSelect}
              disabled={restoreStatus === "loading"}
              className='text-sm flex flex-col h-5 text-primary/75 px-1'
            />
            <FieldDescription>Select a file to use as backup.</FieldDescription>
          </Field>
          {restoreStatus === "loading" && (
            <div className="flex items-center gap-2 mt-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Restoring database... Please wait.</span>
            </div>
          )}

          {restoreStatus === "success" && (
            <Alert variant="default" className="mt-8">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{restoreMessage}</AlertDescription>
            </Alert>
          )}

          {restoreStatus === "error" && (
            <Alert variant="destructive" className="mt-8">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{restoreMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Restore</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore from the selected backup? This will overwrite all existing data in the database. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelRestore}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmRestore}>Restore</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
