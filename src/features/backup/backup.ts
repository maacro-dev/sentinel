
export const handleBackup = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_DEV_URL}/functions/v1/backup`);
    if (!response.ok) throw new Error("Backup failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_${new Date().toISOString()}.bak`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
  }
};
