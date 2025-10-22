import React from "react";
import { MemoryRouter } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";
import { AuthProvider } from "../../contexts/AuthContext";

export default {
    title: "Components/BottomNavigation",
    component: BottomNavigation,
    decorators: [
        (Story) => (
            <AuthProvider>
                <MemoryRouter initialEntries={["/"]}>
                    <div className="min-h-screen pb-20">
                        <div className="p-4">
                            <p className="text-center text-gray-600">
                                하단 네비게이션이 화면 아래에 고정됩니다.
                            </p>
                        </div>
                        <Story />
                    </div>
                </MemoryRouter>
            </AuthProvider>
        ),
    ],
};

export const Default = () => <BottomNavigation />;
Default.parameters = {
    docs: {
        description: {
            story: "로그아웃 상태 - 찜, 모임 만들기, 마이페이지 클릭 시 로그인 페이지로 이동합니다.",
        },
    },
};

