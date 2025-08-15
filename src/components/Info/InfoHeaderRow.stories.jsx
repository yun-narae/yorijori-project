import { MemoryRouter } from "react-router-dom";
import InfoHeaderRow from "./InfoHeaderRow";

const meta = {
    title: "components/Info/InfoHeaderRow",
    component: InfoHeaderRow,
    parameters: { layout: "padded" },
    decorators: [
        (Story) => (
            <MemoryRouter>
                <div className="w-full max-w-[480px]">
                    <Story />
                </div>
            </MemoryRouter>
        ),
    ],
};
export default meta;

export const Playground = {
    args: {
        user: {
            nickname: "윤나래",
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        // StatusBadgeIconGroup가 바로 렌더되도록 상태를 강제로 지정
        post: {
            id: "post-1",
            _forceStatus: ["모집중", "마감임박", "무료클래스"],
            editor: "someone-else",
        },
    },
};
