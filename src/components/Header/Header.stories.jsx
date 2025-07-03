import React from "react";
import Header from "./Header";
import { MemoryRouter } from "react-router-dom";

export default {
    title: "Components/Header",
    component: Header,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/"]}>
                <Story />
            </MemoryRouter>
        ),
    ],
    argTypes: {
        showTitle: { control: "boolean" },
        showLogo: { control: "boolean" },
        showBack: { control: "boolean" },
        buttonTitle: { control: "text" },
        Icon2Name: { control: "select", options: ["bell", "user", "search", ""] },
        fill: { control: "boolean" },
        onShowIcon2: { action: "Icon2 클릭됨!" },
        onButtonTitleClick: { action: "버튼 클릭됨!" },
    },
};

const Template = (args) => <Header {...args} />;

export const Default = Template.bind({});
Default.args = {
    showTitle: true,
    showLogo: true,
    showBack: true,
    buttonTitle: "회원가입",
    Icon2Name: "bell",
    fill: true,
};

export const HiddenBack = Template.bind({});
HiddenBack.args = {
    showTitle: true,
    showLogo: true,
    showBack: false,
    buttonTitle: "회원가입",
    Icon2Name: "bell",
    fill: true,
};
HiddenBack.parameters = {
    controls: {
        exclude: ["showBack"],
    },
};

export const HiddenLogo = Template.bind({});
HiddenLogo.args = {
    showTitle: true,
    showLogo: false,
    showBack: true,
    buttonTitle: "회원가입",
    Icon2Name: "bell",
    fill: true,
};
HiddenLogo.parameters = {
    controls: {
        exclude: ["showLogo"],
    },
};

export const HiddenTitle = Template.bind({});
HiddenTitle.args = {
    showTitle: false,
    showLogo: true,
    showBack: true,
    buttonTitle: "회원가입",
    Icon2Name: "bell",
    fill: true,
};
HiddenTitle.parameters = {
    controls: {
        exclude: ["showTitle"],
    },
};
