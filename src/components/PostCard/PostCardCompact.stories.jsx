import React from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../../contexts/AuthContext";
import ConfirmProvider from "../Modal/ConfirmProvider";
import PostCardCompact from "./PostCardCompact";

// Mock QueryClient for Storybook
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            staleTime: Infinity,
        },
    },
});

export default {
    title: "Components/PostCard/PostCardCompact",
    component: PostCardCompact,
    decorators: [
        (Story) => (
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <ConfirmProvider>
                            <div className="p-4 max-w-md">
                                <Story />
                            </div>
                        </ConfirmProvider>
                    </AuthProvider>
                </QueryClientProvider>
            </MemoryRouter>
        ),
    ],
};

const mockPost = {
    id: "mock-post-123",
    title: "함께 만드는 이탈리안 요리",
    category: ["이탈리아", "파스타"],
    date: "2025-08-15",
    timeStart: "14:00",
    timeEnd: "16:00",
    location: "서울시 강남구",
    capacity: 10,
    reservedCount: 5,
    fee: 15000,
    created: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    editor: "user-123",
    expand: {
        editor: {
            id: "user-123",
            nickname: "홍길동",
            email: "test@example.com",
        }
    }
};

const Template = (args) => <PostCardCompact {...args} />;

export const Default = Template.bind({});
Default.args = {
    post: mockPost,
    user: null,
    showInfoHeader: true,
    showStatusBadge: true,
};


