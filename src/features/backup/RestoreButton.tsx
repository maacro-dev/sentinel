// import { useState } from "react";

// export const RestoreButton = () => {
//   const [restoring, setRestoring] = useState(false);
//   const [message, setMessage] = useState<string | null>(null);

//   const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     setRestoring(true);
//     setMessage(null);

//     try {
//       const formData = new FormData();
//       formData.append("backup", file);

//       const response = await fetch(
//         `${import.meta.env.VITE_SUPABASE_DEV_URL}/functions/v1/backup-restore`,
//         {
//           method: "POST",
//           body: formData,
//         }
//       );

//       const result = await response.json();
//       if (!response.ok) throw new Error(result.error || "Restore failed");

//       setMessage(`Restore successful: ${result.success}`);
//     } catch (err) {
//       setMessage(`Error: ${err.message}`);
//     } finally {
//       setRestoring(false);
//     }
//   };

//   return (
//     <div>
//       <input
//         type="file"
//         accept=".bak"
//         onChange={handleRestore}
//         disabled={restoring}
//       />
//       {restoring && <p>Restoring...</p>}
//       {message && <p>{message}</p>}
//     </div>
//   );
// };
