import { getSupabase } from "@/core/supabase";

export const handleBackup = async () => {
  try {

    const supabase = await getSupabase()

    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    if (!accessToken) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_DEV_URL}/functions/v1/backup`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

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



export const handleRestore = async (file: File): Promise<void> => {
  const supabase = await getSupabase();

  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  if (!accessToken) {
    throw new Error("User not authenticated");
  }

  const formData = new FormData();
  formData.append("backup", file);

  const url = import.meta.env.DEV
    ? import.meta.env.VITE_SUPABASE_DEV_URL
    : import.meta.env.VITE_SUPABASE_URL;

  if (!url) {
    throw new Error("Missing Supabase URL");
  }

  const response = await fetch(`${url}/functions/v1/backup-restore`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Restore failed");
  }
};
