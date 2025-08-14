/** @type { import('@storybook/react').Preview } */
import "../src/styles/tailwind.css";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { withThemeByClassName } from "@storybook/addon-themes";

export const decorators = [
    withThemeByClassName({
            themes: {
            light: "",
            dark: "dark",
        },
            defaultTheme: "dark",
    }),
];