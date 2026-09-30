import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": import.meta.dirname },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["{app,components,lib,hooks,mocks}/**/*.test.{ts,tsx}"],
  },
});
