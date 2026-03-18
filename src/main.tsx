import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/core/tanstack/query/client";
import "@/styles/global.css";
import { StrictMode } from "react";
import { LazyMotion } from "motion/react";
import { router } from "./core/tanstack/router";
import { RealtimeListener } from "./core/supabase/realtime";

// if (import.meta.env.DEV) {
//   const script = document.createElement("script");
//   script.src = "https://cdn.jsdelivr.net/npm/react-scan/dist/auto.global.js";
//   document.head.appendChild(script);
// }

const rootElement = document.getElementById("root");

const features = () => import("motion/react").then(m => m.domAnimation);

function InnerApp() {
  return (
    <>
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
