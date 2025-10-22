import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import ConfirmProvider from "../Modal/ConfirmProvider";
import PageTitleBar from "./PageTitleBar";

export default {
    title: "Components/PageTitleBar",
    component: PageTitleBar,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/register"]}>
                <AuthProvider>
                    <ConfirmProvider>
                        <Routes>
                            <Route path="/register" element={<Story />} />
                        </Routes>
                    </ConfirmProvider>
                </AuthProvider>
            </MemoryRouter>
        ),
    ],
};

const Template = () => <PageTitleBar />;

export const Default = Template.bind({});
