import React from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PageTitleBar from "./PageTitleBar";

export default {
    title: "Components/PageTitleBar",
    component: PageTitleBar,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/register"]}>
                <Routes>
                    <Route path="/register" element={<Story />} />
                </Routes>
            </MemoryRouter>
        ),
    ],
};

const Template = () => <PageTitleBar />;

export const Default = Template.bind({});
