import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/core/tanstack/query/client";
import "@/styles/global.css";
import { StrictMode } from "react";
import { LazyMotion } from "motion/react";
import { router } from "./core/tanstack/router";
import { useState, useEffect } from "react";
import { getSupabase } from "@/core/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

// Add react scan for development
// if (import.meta.env.DEV) {
//   const script = document.createElement("script");
//   script.src = "https://cdn.jsdelivr.net/npm/react-scan/dist/auto.global.js";
//   document.head.appendChild(script);
// }

const rootElement = document.getElementById("root");

const features = () => import("motion/react").then(m => m.domAnimation);

function SupabaseRealtimeProvider() {
  const queryClient = useQueryClient();
  const [client, setClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {

    let active = true;

    async function init() {
      const s = await getSupabase();
      await s.realtime.setAuth();

      if (active) setClient(s);
    }

    init();
    return () => { active = false };
  }, []);

  useEffect(() => {
    if (!client) return;

    const channel = client
      .channel("analytics-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
          queryClient.invalidateQueries({ queryKey: ["form-summary"] });
          queryClient.invalidateQueries({ queryKey: ["data-collection-rate"] });
          queryClient.invalidateQueries({ queryKey: ["form-count-summary"] });
        }
      )
      .subscribe();

    return () => { client.removeChannel(channel) }
  }, [client, queryClient]);


  return null;
}

function InnerApp() {

  return (
    <>
      <SupabaseRealtimeProvider />
      <LazyMotion features={features} strict>
        <RouterProvider router={router} />
      </LazyMotion>
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InnerApp />
    </QueryClientProvider>
  );
}

if (rootElement && !rootElement.innerHTML) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
