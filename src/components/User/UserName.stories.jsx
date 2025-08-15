// src/components/User/UserName.stories.jsx
import React from "react";
import PocketBase from "pocketbase";
import UserName from "./UserName";

export default {
    title: "Components/User/UserName",
    component: UserName,
    tags: ["autodocs"],
    argTypes: {
        size: { control: { type: "select" }, options: ["sm", "md", "lg"] },
        className: { control: "text" },
    },
};

// 고정 유저 ID (필요 시 변경)
const TARGET_USER_ID = "8busfev0o579wu2";

/**
 * PocketBase에서 유저를 불러와 nickname을 표시
 */
export const UserTrue = {
    args: {
        size: "md",
        className: "",
    },
    loaders: [
        async () => {
            const url = import.meta.env.VITE_PB_URL;
            if (!url) {
                console.warn("VITE_PB_URL is not set. Please set it in your .env");
                return { user: null };
            }

            const pb = new PocketBase(url);
            const user = await pb.collection("users").getOne(TARGET_USER_ID);

            // nickname 필드가 없을 가능성 대비해 기본값 보강 (스토리 깨짐 방지)
            if (!user.nickname) user.nickname = "(no nickname)";

            return { user };
        },
    ],
    render: (args, { loaded }) => {
        const { user } = loaded || {};
        return <UserName {...args} user={user} />;
    },
};

/**
 * user가 없을 때 렌더링 (아무것도 표시하지 않음)
 */
export const UserNot = {
    args: {
        user: null,
        size: "md",
        className: "",
    },
    render: (args) => <UserName {...args} />,
};
