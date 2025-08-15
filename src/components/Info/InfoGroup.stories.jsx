import { MemoryRouter } from "react-router-dom";
import InfoGroup from "./InfoGroup";

const meta = {
    title: "components/Info/InfoGroup",
    component: InfoGroup,
    parameters: { layout: "padded" },
    decorators: [
        (Story) => (
            <MemoryRouter>
                <div className="w-fit">
                    <Story />
                </div>
            </MemoryRouter>
        ),
    ],
};
export default meta;

const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

export const Playground = {
    args: {
        user: {
            nickname: "테스트",
        },
        createdAt: twoHoursAgo,
    },
};
