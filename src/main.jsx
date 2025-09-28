import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tailwind.css";
import App from "./App.jsx";
import ConfirmProvider from "./components/Modal/ConfirmProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <ConfirmProvider>
                <App />
            </ConfirmProvider>
        </QueryClientProvider>
    </StrictMode>
)
