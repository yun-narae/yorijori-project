import { MemoryRouter } from "react-router-dom";
import InfoHeader from "./InfoHeader";

const meta = {
    title: "components/Info/InfoHeader",
    component: InfoHeader,
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
