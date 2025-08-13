// vite.config.js
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        // 기본 벤더 분할(그래프 기반) + 아래 manualChunks(명시 분할)를 함께 사용
        splitVendorChunkPlugin(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    css: {
        postcss: {
            plugins: [tailwindcss()],
        },
    },
    build: {
        rollupOptions: {
            output: {
                /**
                 * 🧩 manualChunks:
                 * - node_modules 안의 “무거운” 의존성을 개별 청크로 분리
                 * - 나머지는 공통 'vendor'로 묶음
                 * 필요에 따라 패키지를 추가/삭제하면 됨.
                 */
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;

                    // 👇 자주 무거운 후보들
                    if (id.includes('swiper')) return 'vendor-swiper';
                    if (id.includes('framer-motion')) return 'vendor-framer';
                    if (id.includes('react-hook-form')) return 'vendor-react-hook-form';
                    if (id.includes('pocketbase')) return 'vendor-pocketbase';
                    if (id.includes('/dayjs/')) return 'vendor-dayjs';
                    if (id.includes('lucide-react')) return 'vendor-icons';
                    if (id.includes('recharts')) return 'vendor-charts';

                    // 공통 벤더(그 외)
                    return 'vendor';
                },
            },
        },
    },
});
