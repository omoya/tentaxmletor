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

      // Ensure the dist directory exists
      const distDir = path.resolve(__dirname, "dist");
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      // Always create _redirects file directly, without relying on file copying
      const redirectsDestPath = path.resolve(distDir, "_redirects");

      // Create _redirects file
      try {
        fs.writeFileSync(redirectsDestPath, "/* /index.html 200");
        console.log("✅ _redirects file created in dist");
      } catch (error) {
        console.error("Failed to write _redirects file:", error);
      }

      // Copy index.html to root level if it's in public subfolder
      const publicIndexPath = path.resolve(distDir, "public/index.html");
      const rootIndexPath = path.resolve(distDir, "index.html");

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
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  root: "client",
});
