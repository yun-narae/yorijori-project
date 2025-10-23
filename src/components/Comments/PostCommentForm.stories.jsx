import React from "react";
import { MemoryRouter } from "react-router-dom";
import ConfirmProvider from "../Modal/ConfirmProvider";
import { AuthProvider } from "../../contexts/AuthContext";
import PostCommentForm from "./PostCommentForm";

export default {
    title: "Components/Comments/PostCommentForm",
    component: PostCommentForm,
    decorators: [
        (Story) => (
            <MemoryRouter>
                <AuthProvider>
                    <ConfirmProvider>
                        <Story />
                    </ConfirmProvider>
                </AuthProvider>
            </MemoryRouter>
        ),
    ],
    argTypes: {
        postId: { control: "text" },
    },
};

const Template = (args) => (
    <div className="max-w-md p-4">
        <PostCommentForm {...args} />
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">상태 확인:</p>
            <p className="text-xs text-gray-500">
                • 댓글을 입력하면 "댓글 작성" 버튼이 활성화됩니다
                • 빈 댓글일 때는 버튼이 비활성화됩니다
                • 최대 300자까지 입력 가능합니다
            </p>
        </div>
        <p className="mt-4 text-sm text-gray-500">
            * 실제 제출 기능은 PocketBase 연동이 필요합니다.
        </p>
    </div>
);

export const Default = Template.bind({});
Default.args = {
    postId: "mock-post-id",
};
Default.parameters = {
    docs: {
        description: {
            story: "댓글을 입력해보세요. 텍스트가 있을 때만 버튼이 활성화됩니다.",
        },
    },
};

