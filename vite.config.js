import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.js"),
      name: "Select",
      formats: ["es", "cjs"],
      fileName: format =>
        format === "es" ? "index.js" : "index.cjs"
    },
    rollupOptions: {
      external: ["react", "react-dom"]
    }
  }
});
