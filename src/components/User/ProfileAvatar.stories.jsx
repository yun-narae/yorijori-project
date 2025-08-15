// src/components/ProfileAvatar.pb.stories.jsx
import React from "react";
import PocketBase from "pocketbase";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProfileAvatar from "./ProfileAvatar";

// Router 컨텍스트를 제공하는 Storybook 데코레이터
const withRouter = (Story) => (
  <MemoryRouter initialEntries={["/"]}>
    <Routes>
      <Route path="*" element={<Story />} />
    </Routes>
  </MemoryRouter>
);

export default {
  title: "Components/User/ProfileAvatar",
  component: ProfileAvatar,
  decorators: [withRouter],
  tags: ["autodocs"],
  argTypes: {
    size: { control: { type: "select" }, options: ["md", "lg"] },
    linkBehavior: { control: { type: "select" }, options: ["auto", "self", "none"] },
    click: { control: "boolean" },
  },
};

// 고정 유저 ID
const TARGET_USER_ID = "8busfev0o579wu2";

export const UserTrue = {
    args: {
        currentUserId: TARGET_USER_ID, // 내 계정이면 /myPage, 아니면 상대 마이페이지
        size: "md",
        linkBehavior: "auto",
        click: true,
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
            user.collectionName = user.collectionName || "users";

            return { user };
        },
    ],
    render: (args, { loaded }) => {
        const { user } = loaded || {};
        return <ProfileAvatar {...args} user={user} />;
    },
};

export const UserNot = {
    args: {
        user: null,                 // user가 없는 상태
        currentUserId: "someId",    // 로그인 유저 id (무의미, null이니까)
        size: "md",
        linkBehavior: "auto",
        click: true,
    },
    render: (args) => <ProfileAvatar {...args} />,
};
