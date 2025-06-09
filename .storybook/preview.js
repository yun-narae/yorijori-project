/** @type { import('@storybook/react').Preview } */
import "../src/styles/tailwind.css";
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