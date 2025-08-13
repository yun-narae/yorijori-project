import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import path from "path";

const isPkg = (id, pkg) =>
  id.includes(`/node_modules/${pkg}/`) || id.endsWith(`/node_modules/${pkg}`);

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: { "@": path.resolve(__dirname, "./src") },
    },
    css: {
        postcss: { plugins: [tailwindcss()] },
    },
    build: {
        rollupOptions: {
        output: {
            manualChunks(id) {
            if (!id.includes("node_modules")) return;

            // ✅ React/ReactDOM/React Router는 "하나의 청크"로 묶어서 순서/TDZ 이슈 방지
            if (
                isPkg(id, "react") ||
                isPkg(id, "react-dom") ||
                isPkg(id, "react-router") ||
                isPkg(id, "react-router-dom")
            ) {
                return "vendor-react";
            }

            // 무거운 서드파티는 개별 청크
            if (isPkg(id, "swiper")) return "vendor-swiper";
            if (isPkg(id, "pocketbase")) return "vendor-pocketbase";
            if (isPkg(id, "framer-motion")) return "vendor-framer";
            if (isPkg(id, "dayjs")) return "vendor-dayjs";
            if (isPkg(id, "lucide-react")) return "vendor-icons";

            // 그 외 공통
            return "vendor";
            },
        },
        },
    },
});
