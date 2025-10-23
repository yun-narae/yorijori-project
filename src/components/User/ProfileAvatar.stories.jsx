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

export const Default = {
    args: {
        user: mockUser,
        currentUserId: "user-123",
        size: "md",
        linkBehavior: "auto",
        click: true,
        headerName: true,
    },
};
