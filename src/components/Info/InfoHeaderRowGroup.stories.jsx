import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import ConfirmProvider from "../Modal/ConfirmProvider";
import InfoHeaderRowGroup from "./InfoHeaderRowGroup";

const meta = {
    title: "components/Info/InfoHeaderRowGroup",
    component: InfoHeaderRowGroup,
    parameters: { layout: "padded" },
    decorators: [
        (Story) => (
            <MemoryRouter>
                <AuthProvider>
                    <ConfirmProvider>
                        <div className="w-full max-w-[480px]">
                            <Story />
                        </div>
                    </ConfirmProvider>
                </AuthProvider>
            </MemoryRouter>
        ),
    ],
};
export default meta;

export const Playground = {
    args: {
        author: {
            id: "user-123",
            nickname: "홍길동",
            email: "test@example.com",
        },
        currentUserId: "user-456",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        // StatusBadgeIconGroup가 바로 렌더되도록 상태를 강제로 지정
        post: {
            id: "post-1",
            _forceStatus: ["모집중", "마감임박", "무료클래스"],
            editor: "user-123",
            expand: {
                editor: {
                    id: "user-123",
                    nickname: "홍길동",
                    email: "test@example.com",
                }
            }
        },
    },
};
