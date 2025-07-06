import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";

import { router } from "@/app/router";
import { queryClient } from "@/app/query-client";
import "@/styles/global.css";
import { StrictMode } from "react";
import { log } from "./utils";

const rootElement = document.getElementById("root");

// Add react scan for development
// if (import.meta.env.DEV) {
//   const script = document.createElement("script");
//   script.src = "https://cdn.jsdelivr.net/npm/react-scan/dist/auto.global.js";
//   document.head.appendChild(script);
// }

function App() {
  log("RENDER", "App");

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />;
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
