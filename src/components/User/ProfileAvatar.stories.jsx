import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import ConfirmProvider from "../Modal/ConfirmProvider";
import ProfileAvatar from "./ProfileAvatar";

// Router 컨텍스트를 제공하는 Storybook 데코레이터
const withRouter = (Story) => (
  <MemoryRouter initialEntries={["/"]}>
    <AuthProvider>
      <ConfirmProvider>
        <Routes>
          <Route path="*" element={<Story />} />
        </Routes>
      </ConfirmProvider>
    </AuthProvider>
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
    headerName: { control: "boolean" },
  },
};

// Mock 사용자 데이터
const mockUser = {
    id: "user-123",
    nickname: "홍길동",
    email: "test@example.com",
    collectionName: "users",
    images: [],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
};

const mockUserWithImage = {
    id: "user-456",
    nickname: "홍길동",
    email: "kim@example.com",
    collectionName: "users",
    images: [`avatar_${Math.floor(Math.random() * 1000)}.jpg`],
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    // getPbImageURL을 우회하기 위한 직접 이미지 URL
    avatarUrl: `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`,
};

export const Default = {
    args: {
        user: mockUser,
        currentUserId: "user-123",
        size: "md",
        linkBehavior: "auto",
        click: true,
    },
};

export const WithHeaderName = {
    args: {
        user: mockUser,
        currentUserId: "user-123",
        size: "md",
        linkBehavior: "auto",
        click: true,
        headerName: true,
    },
};

export const LargeSize = {
    args: {
        user: mockUser,
        currentUserId: "user-123",
        size: "lg",
        linkBehavior: "auto",
        click: true,
    },
};

export const WithImage = {
    args: {
        user: mockUserWithImage,
        currentUserId: "user-456",
        size: "md",
        linkBehavior: "auto",
        click: true,
        avatarUrl: `https://picsum.photos/200/200?random=${Math.floor(Math.random() * 1000)}`,
    },
};