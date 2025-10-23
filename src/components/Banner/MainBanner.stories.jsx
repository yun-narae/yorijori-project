import MainBanner from "./MainBanner";

export default {
    title: "Components/Banner/MainBanner",
    component: MainBanner,
    parameters: {
        layout: "fullscreen",
    },
    argTypes: {
        onBannerClick: { action: "banner clicked" },
    },
};

export const Default = {
    args: {},
};

export const Mobile = {
    args: {},
    parameters: {
        viewport: {
            defaultViewport: "mobile1",
        },
    },
};

export const Tablet = {
    args: {},
    parameters: {
        viewport: {
            defaultViewport: "tablet",
        },
    },
};

export const Desktop = {
    args: {},
    parameters: {
        viewport: {
            defaultViewport: "desktop",
        },
    },
};
