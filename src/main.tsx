import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/core/tanstack/query/client";
import "@/styles/global.css";
import { StrictMode } from "react";
import { LazyMotion } from "motion/react";
import { router } from "./core/tanstack/router";

const rootElement = document.getElementById("root");

// Add react scan for development
// if (import.meta.env.DEV) {
//   const script = document.createElement("script");
//   script.src = "https://cdn.jsdelivr.net/npm/react-scan/dist/auto.global.js";
//   document.head.appendChild(script);
// }

const features = () => import("motion/react").then(m => m.domAnimation);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LazyMotion features={features} strict>
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
