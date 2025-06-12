const white = '#ffffff';

const gray = {
    100: '#eaeaea',
    200: '#d8d8d8',
    300: '#bababa',
    400: '#9e9e9e',
    500: '#818181',
    600: '#636363',
    700: '#464646',
    800: '#282828',
    900: '#101010',
};

const red = {
    100: '#f24444',
    200: '#ff5555',
};

const blue = {
    100: '#255ae5',
    200: '#4575f5',
    300: '#1d54e4',
    400: '#0142ee',
};

const green = {
    100: '#01b63e',
    200: '#20c858',
};

const yellow = {
    100: '#f59920',
    200: '#f5a945',
};

const redorange = {
    100: '#ff6533',
    200: '#ff5a28',
    300: '#f74910',
    400: '#ee440d',
};

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
        extend: {
            screens: {
                mobile: '23.4375rem', // 375px
                tablet: '48.75rem',   // 780px
                desktop: '80rem',     // 1280px
            },
            colors: {
                semantic: {
                    light: {
                        grayScale: {
                            gray1: gray[100],
                            gray2: gray[200],
                            gray3: gray[300],
                            gray4: gray[400],
                            gray5: gray[500],
                            gray6: gray[700],
                            gray7: gray[800],
                            gray8: gray[900],
                        },
                        primary: white,
                        secondary: redorange[200],
                        red1: red[200],
                        blue1: blue[200],
                        blue2: blue[400],
                        green1: green[200],
                        yellow1: yellow[200],
                        redorange1: redorange[200],
                        redorange2: redorange[400],
                    },
                    dark: {
                        grayScale: {
                            gray1: gray[800],
                            gray2: gray[700],
                            gray3: gray[600],
                            gray4: gray[500],
                            gray5: gray[400],
                            gray6: gray[300],
                            gray7: gray[200],
                            gray8: gray[100],
                        },
                        primary: gray[900],
                        secondary: redorange[100],
                        red1: red[100],
                        blue1: blue[100],
                        blue2: blue[300],
                        green1: green[100],
                        yellow1: yellow[100],
                        redorange1: redorange[100],
                        redorange2: redorange[300],
                    }
                }
            },
            spacing: {
                1: '0.3125rem',  // 5px
                2: '0.625rem',   // 10px
                3: '0.9375rem',  // 15px
                4: '1.25rem',    // 20px
                5: '1.875rem',   // 30px
                6: '2.5rem',     // 40px
                7: '3.75rem',    // 60px
                8: '5rem',       // 80px
                9: '6.25rem',    // 100px
            },
            fontSize: {
                // MO
                'mo-title-xl': '1.375rem',   // 22px
                'mo-title-lg': '1.125rem',   // 18px
                'mo-title': '0.875rem',      // 14px
                'mo-title-sm': '0.75rem',    // 12px

                'mo-text-xl': '1.375rem',    // 22px
                'mo-text-lg': '1.125rem',    // 18px
                'mo-text': '0.875rem',       // 14px
                'mo-text-sm': '0.75rem',     // 12px

                'mo-button': '0.875rem',     // 14px
                'mo-button-sm': '0.75rem',   // 12px

                'mo-active': '0.875rem',     // 14px
                'mo-active-sm': '0.75rem',   // 12px

                // TAB
                'tab-title-xl': '1.625rem',  // 26px
                'tab-title-lg': '1.25rem',   // 20px
                'tab-title': '0.875rem',     // 14px
                'tab-title-sm': '0.625rem',  // 10px

                'tab-text-xl': '1.625rem',   // 26px
                'tab-text-lg': '1.25rem',    // 20px
                'tab-text': '0.875rem',      // 14px
                'tab-text-sm': '0.625rem',   // 10px

                'tab-button': '0.875rem',    // 14px
                'tab-button-sm': '0.625rem', // 10px

                'tab-active': '0.875rem',    // 14px
                'tab-active-sm': '0.625rem', // 10px

                // PC
                'pc-title-xl': '2.1875rem',  // 35px
                'pc-title-lg': '1.625rem',   // 26px
                'pc-title': '0.9375rem',     // 15px
                'pc-title-sm': '0.75rem',    // 12px

                'pc-text-xl': '2.1875rem',   // 35px
                'pc-text-lg': '1.625rem',    // 26px
                'pc-text': '0.9375rem',      // 15px
                'pc-text-sm': '0.75rem',     // 12px

                'pc-button': '0.9375rem',    // 15px
                'pc-button-sm': '0.75rem',   // 12px

                'pc-active': '0.9375rem',    // 15px
                'pc-active-sm': '0.75rem',   // 12px
            }
        }
    },
    plugins: [],
}