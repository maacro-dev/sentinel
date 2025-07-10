import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { router } from "@/app/router";
import { queryClient } from "@/app/query-client";
import "@/styles/global.css";
import { StrictMode } from "react";
import { logRender } from "chronicle-log";
import { LazyMotion } from "motion/react";

const rootElement = document.getElementById("root");

// Add react scan for development
// if (import.meta.env.DEV) {
//   const script = document.createElement("script");
//   script.src = "https://cdn.jsdelivr.net/npm/react-scan/dist/auto.global.js";
//   document.head.appendChild(script);
// }

const loadFeatures = () => import("@/app/features").then(module => module.default);

function App() {

  logRender("App");

  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={loadFeatures} strict>
        <RouterProvider router={router} />
      </LazyMotion>
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
