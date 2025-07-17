export const NAV_ITEMS = [
    {
        to: "/",
        label: "Home",
        header: {
            byScreen: {
                mobile: { 
                    showLogo: true,
                    showHamburger: true,
                    showBack: false,
                    showNav: false,
                    showTitle: false,
                    Icon2Name: null,
                    showButtonTitle: ({ isLoggedIn }) => !isLoggedIn,
                },
                tablet: { 
                    showLogo: true,
                    showHamburger: true,
                    showBack: false,
                    showNav: false,
                    showTitle: false,
                    Icon2Name: null,
                    showButtonTitle: ({ isLoggedIn }) => !isLoggedIn,
                },
                desktop: { 
                    showLogo: true,
                    showHamburger: false,
                    showBack: false,
                    showNav: true,
                    showTitle: false,
                    Icon2Name: null,
                    showButtonTitle: ({ isLoggedIn }) => !isLoggedIn,
                },
            },
        },
    },
    {
        to: "/register",
        label: "회원가입",
        header: {
            onShowIcon2: () => console.log("Register 페이지 아이콘 클릭"),
            showButtonTitle: ({ isLoggedIn }) => false,
            byScreen: {
                mobile: { 
                    showLogo: false,
                    showHamburger: false,
                    showBack: true,
                    showNav: false,
                    showTitle: true,
                    Icon2Name: null,
                },
                tablet: { 
                    showLogo: false,
                    showHamburger: false,
                    showBack: true,
                    showNav: false,
                    showTitle: true,
                    Icon2Name: null,
                },
                desktop: { 
                    showLogo: true,
                    showHamburger: false,
                    showBack: false,
                    showNav: false,
                    showTitle: false,
                    Icon2Name: null,
                },
            },
        },
    },
    {
        to: "/test",
        label: "Test-Pages",
        header: {
            byScreen: {
                mobile: { 
                    showLogo: false,
                    showHamburger: true,
                    showBack: true,
                    showNav: false,
                    showTitle: true,
                    Icon2Name: null,
                    showButtonTitle: ({ isLoggedIn }) => !isLoggedIn,
                },
                tablet: { 
                    showLogo: false,
                    showHamburger: true,
                    showBack: true,
                    showNav: false,
                    showTitle: true,
                    Icon2Name: null,
                    showButtonTitle: ({ isLoggedIn }) => !isLoggedIn,
                },
                desktop: { 
                    showLogo: true,
                    showHamburger: false,
                    showBack: false,
                    showNav: true,
                    showTitle: false,
                    Icon2Name: null,
                    showButtonTitle: ({ isLoggedIn }) => !isLoggedIn,
                },
            },
        },
    },
];
  