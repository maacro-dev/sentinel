/**
 * App Entry Point
 * ----------------
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";

import { router } from "@/app/router";
import { queryClient } from "@/app/query-client";
import { AuthProvider, useAuth } from "@/context/auth-context";

import "@/styles/global.css";

const rootElement = document.getElementById("root");

if (import.meta.env.DEV) {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/react-scan/dist/auto.global.js";
  document.head.appendChild(script);
}

function App() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth }} />;
}

if (rootElement && !rootElement.innerHTML) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}
