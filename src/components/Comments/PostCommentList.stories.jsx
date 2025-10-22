import React from "react";
import { MemoryRouter } from "react-router-dom";
import ConfirmProvider from "../Modal/ConfirmProvider";
import { AuthProvider } from "../../contexts/AuthContext";
import PostCommentList from "./PostCommentList";
// pb를 사용하지 않는 목데이터 전용 스토리

export default {
    title: "Components/Comments/PostCommentList",
    component: PostCommentList,
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
        <PostCommentList {...args} />
        <p className="mt-4 text-sm text-gray-500">
            * 실제 댓글 로드는 PocketBase 연동이 필요합니다.
        </p>
    </div>
);

export const Default = Template.bind({});
Default.args = {
    postId: "mock-post-id",
    currentUser: null,
    mockItems: [],
};

export const OneComment = Template.bind({});
OneComment.args = {
    postId: "mock-post-id",
    currentUser: null,
    mockItems: [
        {
            id: "cmt-1",
            post: "mock-post-id",
            user: "user-1",
            comment: "첫 번째 댓글입니다.",
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            expand: { user: { id: "user-1", nickname: "홍길동" } },
        },
    ],
};

export const TwoComments = Template.bind({});
TwoComments.args = {
    postId: "mock-post-id",
    currentUser: null,
    mockItems: [
        {
            id: "cmt-1",
            post: "mock-post-id",
            user: "user-1",
            comment: "첫 번째 댓글입니다.",
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            expand: { user: { id: "user-1", nickname: "홍길동" } },
        },
        {
            id: "cmt-2",
            post: "mock-post-id",
            user: "user-2",
            comment: "두 번째 댓글입니다.",
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            expand: { user: { id: "user-2", nickname: "임꺽정" } },
        },
    ],
};

