import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: "./",
  server: {
    port: 3000,
  },
  preview: {
    port: 3001,
  },
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
      routesDirectory: "./src/routes",
      generatedRouteTree: "./src/core/tanstack/router/routeTree.gen.ts",
    }),
    svgr(),
    tailwindcss(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", {
          target: "19",
            sources: (filename: string) => {
              return filename.indexOf("src/core/lib") !== -1;
            },
          }]],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@features": path.resolve(__dirname, "./src/features"),
    },
  },
});
