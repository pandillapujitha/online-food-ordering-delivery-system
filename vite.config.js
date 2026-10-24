import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" makes the build work on any host or sub-folder (Netlify, Vercel, GitHub Pages)
export default defineConfig({ base: "./", plugins: [react()] });
