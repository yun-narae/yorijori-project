// vite.config.js
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        splitVendorChunkPlugin(), // 자동 벤더 분할 보조
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
                 * manualChunks: 자주 쓰는 큰 의존성을 개별 청크로 분리
                 * - 필요 없는 것은 지워도 됨(프로젝트 사용 라이브러리만 남기기)
                 */
                manualChunks(id) {
                    if (!id.includes('node_modules')) return;

                    // 리액트 코어
                    if (id.includes('/react-dom')) return 'vendor-react-dom';
                    if (id.includes('/react/')) return 'vendor-react';

                    // 프로젝트에서 무거운 것들
                    if (id.includes('swiper')) return 'vendor-swiper';
                    if (id.includes('pocketbase')) return 'vendor-pocketbase';
                    if (id.includes('framer-motion')) return 'vendor-framer';
                    if (id.includes('/dayjs/')) return 'vendor-dayjs';
                    if (id.includes('lucide-react')) return 'vendor-icons';

                    // 그 외 공통
                    return 'vendor';
                },
            },
        },
    },
});
