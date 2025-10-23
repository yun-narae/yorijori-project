import NoticeBanner from "./NoticeBanner";

export default {
    title: "Components/Banner/NoticeBanner",
    component: NoticeBanner,
    parameters: {
        layout: "fullscreen",
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
