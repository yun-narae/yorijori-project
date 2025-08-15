import StatusBadgeList from "./StatusBadgeList";

const meta = {
    title: "components/Badges/StatusBadgeList",
    component: StatusBadgeList,
    parameters: { layout: "padded" },

    decorators: [
        (Story) => (
            <div className="flex items-center gap-1 flex-wrap">
                <Story />
            </div>
        ),
    ],
};
export default meta;

export const Playground = {
    args: {
        posts: [
            { id: "1", _forceStatus: ["모집중"] },
            { id: "2", _forceStatus: ["마감임박"] },
            { id: "3", _forceStatus: ["무료클래스"] },
            { id: "4", _forceStatus: ["모집마감"] },
        ],
    },
};
