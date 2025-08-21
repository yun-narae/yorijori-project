import CategoryBadgeList from "./CategoryBadgeList";

const meta = {
    title: "components/Badges/CategoryBadgeList",
    component: CategoryBadgeList,
    parameters: { layout: "padded" },
};
export default meta;

const sample = ["양식", "일식", "브런치", "중식"];

export const Playground = {
    args: {
        categories: sample,
    },
};