import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tailwind.css";
import App from "./App.jsx";
import ConfirmProvider from "./components/Modal/ConfirmProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1분
      gcTime: 300000, // 5분 (이전 cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        // 429 에러는 재시도하지 않음
        if (error?.status === 429) return false;
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: false, // 뮤테이션은 재시도하지 않음
    },
  },
});

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ConfirmProvider>
                <App />
            </ConfirmProvider>
        </QueryClientProvider>
    </StrictMode>
)
