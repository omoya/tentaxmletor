import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

// Custom plugin to copy _redirects file and restructure build output
const prepareNetlifyBuildPlugin = () => {
  return {
    name: "prepare-netlify-build",
    closeBundle() {
      console.log("Preparing build for Netlify deployment...");

      // Copy _redirects file
      const redirectsSourcePath = path.resolve(
        __dirname,
        "client/public/_redirects"
      );
      const redirectsDestPath = path.resolve(__dirname, "dist/_redirects");

      if (fs.existsSync(redirectsSourcePath)) {
        fs.copyFileSync(redirectsSourcePath, redirectsDestPath);
        console.log("✅ _redirects file copied to dist");
      } else {
        // Create _redirects file if it doesn't exist
        fs.writeFileSync(redirectsDestPath, "/* /index.html 200");
        console.log("✅ _redirects file created in dist");
      }

      // Copy index.html to root level if it's in public subfolder
      const publicIndexPath = path.resolve(__dirname, "dist/public/index.html");
      const rootIndexPath = path.resolve(__dirname, "dist/index.html");

      if (fs.existsSync(publicIndexPath) && !fs.existsSync(rootIndexPath)) {
        fs.copyFileSync(publicIndexPath, rootIndexPath);
        console.log("✅ index.html copied to root level");
      }

      // Copy assets to root level if they're in public subfolder
      const publicAssetsPath = path.resolve(__dirname, "dist/public/assets");
      const rootAssetsPath = path.resolve(__dirname, "dist/assets");

      if (fs.existsSync(publicAssetsPath) && !fs.existsSync(rootAssetsPath)) {
        // Create assets directory at root level
        if (!fs.existsSync(rootAssetsPath)) {
          fs.mkdirSync(rootAssetsPath, { recursive: true });
        }

        // Copy all files from public/assets to assets
        const files = fs.readdirSync(publicAssetsPath);
        for (const file of files) {
          const srcPath = path.join(publicAssetsPath, file);
          const destPath = path.join(rootAssetsPath, file);
          fs.copyFileSync(srcPath, destPath);
        }
        console.log("✅ assets copied to root level");
      }
    },
  };
};

export default defineConfig({
  plugins: [react(), prepareNetlifyBuildPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  root: "client",
});
