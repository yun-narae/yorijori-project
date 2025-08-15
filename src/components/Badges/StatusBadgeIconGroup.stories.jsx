import StatusBadgeIconGroup from "./StatusBadgeIconGroup";

const meta = {
    title: "components/Badges/StatusBadgeIconGroup",
    component: StatusBadgeIconGroup,
    parameters: { layout: "padded" },
};
export default meta;

export const Playground = {
    args: {
        // _forceStatus로 화면에 보여줄 배지들을 강제로 지정
        post: {
            id: "demo-1",
            _forceStatus: ["마감임박", "모집중", "무료클래스"],
            editor: "someone", // 스토리북에선 소유자 판정 불필요(heart 아이콘)
        },
    },
};
