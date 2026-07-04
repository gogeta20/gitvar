import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": resolve(__dirname, "src/app"),
      "@core": resolve(__dirname, "src/core"),
      "@modules": resolve(__dirname, "src/modules"),
      "@pages": resolve(__dirname, "src/pages"),
      "@shared": resolve(__dirname, "src/shared"),
      "@mocks": resolve(__dirname, "src/mocks")
    }
  }
});

