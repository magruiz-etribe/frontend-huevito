import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isWidgetBuild = process.env.BUILD_WIDGET === "true";

  if (isWidgetBuild) {
    return {
      plugins: [react()],
      resolve: {
        alias: { "@": path.resolve(__dirname, "./src") },
      },
      define: {
        "process.env.NODE_ENV": JSON.stringify("production"),
      },
      build: {
        outDir: "dist-widget",
        lib: {
          entry: path.resolve(__dirname, "src/widget.tsx"),
          name: "HuevitoWidget",
          formats: ["iife"],
          fileName: () => "huevito-widget.js",
        },
        rollupOptions: {
          output: {
            assetFileNames: (asset) =>
              asset.name === "style.css" ? "huevito-widget.css" : asset.name || "asset",
            inlineDynamicImports: true,
          },
        },
        cssCodeSplit: false,
        minify: "terser",
      },
    };
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: { overlay: false },
    },
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
  };
});
