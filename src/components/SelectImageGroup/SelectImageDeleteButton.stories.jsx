import React from "react";
import SelectImageDeleteButton from "./SelectImageDeleteButton";

export default {
    title: "Components/Common/SelectImageDeleteButton",
    component: SelectImageDeleteButton,
    argTypes: {
        state: {
        control: "select",
        options: ["default", "hover"],
        },
    },
};

const Template = (args) => (
    <div className="relative w-[100px] h-[100px] bg-[var(--color-gray-2)]">
        <SelectImageDeleteButton {...args} />
    </div>
);

export const Default = Template.bind({});
Default.args = {
    state: "default",
    onClick: () => alert("삭제 버튼 클릭됨!"),
};

export const Hover = Template.bind({});
Hover.args = {
    ...Default.args,
    state: "hover",
};
