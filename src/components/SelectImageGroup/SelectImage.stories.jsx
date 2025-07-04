import React from "react";
import SelectImage from "./SelectImage";

export default {
    title: "Components/SelectImage",
    component: SelectImage,
    argTypes: {},
};

const Template = (args) => <SelectImage {...args} />;

export const Default = Template.bind({});
Default.args = {
    imageUrl: "",
    state: "default",
    onSelectImage: () => alert("이미지 선택"),
};

export const Hover = Template.bind({});
Hover.args = {
    imageUrl: "",
    state: "hover",
    onSelectImage: () => alert("이미지 선택"),
};

export const Disable = Template.bind({});
Disable.args = {
    imageUrl: "",
    state: "disable",
    onSelectImage: () => alert("이미지 선택"),
};
