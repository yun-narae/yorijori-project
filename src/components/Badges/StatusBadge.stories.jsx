import StatusBadge from "./StatusBadge";

const meta = {
    title: "components/Badges/StatusBadge",
    component: StatusBadge,
    parameters: { layout: "padded" },
};
export default meta;

export const Recruiting = {
    args: {
        status: "모집중",
    },
};

export const Imminent = {
    args: {
        status: "마감임박",
    },
};

export const FreeClass = {
    args: {
        status: "무료클래스",
    },
};

export const Closed = {
    args: {
        status: "모집마감",
    },
};
