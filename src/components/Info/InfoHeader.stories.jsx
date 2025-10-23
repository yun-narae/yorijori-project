import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import ConfirmProvider from "../Modal/ConfirmProvider";
import InfoHeader from "./InfoHeader";

const meta = {
    title: "components/Info/InfoHeader",
    component: InfoHeader,
    parameters: { layout: "padded" },
    decorators: [
        (Story) => (
            <MemoryRouter>
                <AuthProvider>
                    <ConfirmProvider>
                        <div className="w-fit">
                            <Story />
                        </div>
                    </ConfirmProvider>
                </AuthProvider>
            </MemoryRouter>
        ),
    ],
};
export default meta;

const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

export const Playground = {
    args: {
        user: {
            nickname: "홍길동",
        },
        createdAt: twoHoursAgo,
    },
};
