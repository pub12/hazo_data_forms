import { defineConfig } from "tsup";
import fs from "fs";
import path from "path";

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
    "hazo_connect",
    "hazo_logs",
    "hazo_files",
    "hazo_pdf",
    "react-icons",
  ],
  treeshake: true,
  minify: false,
  // esbuild strips "use client" directives in bundle mode.
  // Use onSuccess to prepend the directive to output files after esbuild finishes.
  async onSuccess() {
    const directive = '"use client";\n';
    const files = [
      path.resolve("dist/index.js"),
      path.resolve("dist/index.cjs"),
    ];
    for (const file of files) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, "utf8");
        if (!content.startsWith('"use client"')) {
          fs.writeFileSync(file, directive + content, "utf8");
          console.log(`Added "use client" directive to ${path.basename(file)}`);
        }
      }
    }
  },
});
