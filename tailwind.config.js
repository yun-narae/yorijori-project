/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './.storybook/**/*.{js,jsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}