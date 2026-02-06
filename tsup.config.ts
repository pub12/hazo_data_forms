import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "react-hook-form",
    "hazo_config",
    "hazo_files",
    "hazo_pdf",
    "lucide-react",
    "react-icons",
  ],
  treeshake: true,
  minify: false,
  banner: {
    js: '"use client";',
  },
});
