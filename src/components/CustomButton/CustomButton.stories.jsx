import React from "react";
import CustomButton from "./CustomButton";

export default {
    title: "Components/CustomButton",
    component: CustomButton,
    argTypes: {
        text: { control: "" },
        iconName: { control: "select", options: ["arrow-right", "arrow-left", "plus", "bell", ""] },
        subIconName: { control: "select", options: ["bell", "plus", "arrow-down", ""] },
        variant: { control: "", options: ["primary", "secondary", "tertiary"] },
        size: { control: "", options: ["sm", "md", "lg"] },
        state: { control: "", options: ["default", "hover", "disable"] },
    },
};

const Template = (args) => <CustomButton {...args} />;

export const Default = Template.bind({});
Default.args = {
    text: "버튼",
    iconName: "arrow-right",
    subIconName: "plus",
    variant: "primary",
    size: "md",
    state: "default",
    subTexts: [
        { text: "안내 문구입니다", type: "info" },
        { text: "에러 문구입니다", type: "error" },
        { text: "승인 문구입니다", type: "finish" },
    ],
    onClick: () => alert("✅ BaseButton 클릭"),
    onSubIconClick: () => alert("🔔 SvgIcon 클릭"),
    custombuttonClass: "tablet:w-[680px]",
};
Default.parameters = {
    controls: {
        exclude: ["text", "onClick", "onSubIconClick"],
    },
};

export const Hover = Template.bind({});
Hover.args = {
    ...Default.args,
    state: "hover",
    iconName: "",
    subIconName: "plus",
    subIconframeClass: "bg-[var(--color-gray-2)] text-[var(--color-gray-7)]",
    custombuttonClass: "tablet:w-[680px]",
};
Hover.parameters = {
    controls: {
        exclude: ["state", "onClick", "onSubIconClick"],
    },
};

export const Disabled = Template.bind({});
Disabled.args = {
    ...Default.args,
    state: "disable",
    custombuttonClass: "tablet:w-[680px]",
};

export const WithoutSubButton = Template.bind({});
WithoutSubButton.args = {
    text: "뒤로가기",
    iconName: "arrow-left",
    subIconName: "",
    variant: "secondary",
    size: "lg",
    state: "default",
    custombuttonClass: "tablet:w-[680px]",
    subTexts: [
        { text: "안내 문구입니다", type: "info" },
        { text: "에러 문구입니다", type: "error" },
        { text: "승인 문구입니다", type: "finish" },
    ],
};