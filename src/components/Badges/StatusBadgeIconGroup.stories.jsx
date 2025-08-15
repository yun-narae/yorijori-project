import StatusBadgeIconGroup from "./StatusBadgeIconGroup";

const meta = {
    title: "components/Badges/StatusBadgeIconGroup",
    component: StatusBadgeIconGroup,
    parameters: { layout: "padded" },
};
export default meta;

export const Playground = {
    args: {
        post: {
            _forceStatus: ["마감임박", "모집중", "무료클래스"],
        },
    },
};
