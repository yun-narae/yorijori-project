import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tailwind.css";
import App from "./App.jsx";
import ConfirmProvider from "./components/Modal/ConfirmProvider";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ConfirmProvider>
            <App />
        </ConfirmProvider>
    </StrictMode>,
)
