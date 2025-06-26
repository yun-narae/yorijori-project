import React from "react";
import BaseButton from "./BaseButton";

export default {
    title: "Components/BaseButton",
    component: BaseButton,
    argTypes: {
        variant: {
            control: '',
            options: ["primary", "secondary", "tertiary"],
        },
        size: {
            control: '',
            options: ["sm", "md", "lg"],
        },
        state: {
            control: '',
            options: ["default", "hover", "disable"],
        },
        iconName: {
            control: "select",
            options: [
                "arrow-down",
                "arrow-left",
                "arrow-right",
                "arrow-up",
                "bell",
                "calendar",
                "camera",
                "check-circle-1",
                "check-circle-2",
                "delete",
                "edit",
                "heart-1",
                "heart-2",
                "menu",
                "plus",
                "question",
                "search",
                "user",
                "warning",
            ],
        },
        text: {
            control: "text",
        },
        onClick: { action: "clicked" },
    },
};

const Template = (args) => <BaseButton {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    text: "추가하기",
    variant: "primary",
    size: "md",
    state: "default",
    iconName: "plus",
};
Primary.parameters = {
    controls: {
        exclude: ["", "variant"],
    },
};

export const Secondary = Template.bind({});
Secondary.args = {
    text: "추가하기",
    variant: "secondary",
    size: "md",
    state: "default",
    iconName: "plus",
};

export const Tertiary = Template.bind({});
Tertiary.args = {
    text: "추가하기",
    variant: "tertiary",
    size: "md",
    state: "default",
    iconName: "plus",
};

export const Hover = Template.bind({});
Hover.args = {
    text: "호버 버튼",
    variant: "primary",
    size: "md",
    state: "hover",
    iconName: "plus",
};

export const Disabled = Template.bind({});
Disabled.args = {
    text: "비활성 버튼",
    variant: "primary",
    size: "md",
    state: "disable",
    iconName: "plus",
};