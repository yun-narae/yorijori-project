import React, { useState } from "react";
import SelectImageGroup from "./SelectImageGroup";

export default {
    title: "Components/SelectImageGroup",
    component: SelectImageGroup,
    argTypes: {},
};

const Template = (args) => {
    const [selectedValue, setSelectedValue] = useState("default");
    const [imageUrl, setImageUrl] = useState("");

    return (
        <SelectImageGroup
            {...args}
            selectedValue={selectedValue}
            onChangeValue={setSelectedValue}
            imageUrl={imageUrl}
            onSelectImage={() => alert("이미지 선택")}
        />
    );
};

export const Default = Template.bind({});
Default.args = {
    title: "프로필 이미지",
    radioOptions: [
        { value: "default", label: "기본 이미지" },
        { value: "checked", label: "직접 선택" },
    ],
    state: "default",
};

export const Hover = Template.bind({});
Hover.args = {
    title: "프로필 이미지",
    radioOptions: [
        { value: "default", label: "기본 이미지" },
        { value: "checked", label: "직접 선택" },
    ],
    state: "hover",
};

export const Disable = Template.bind({});
Disable.args = {
    title: "프로필 이미지",
    radioOptions: [
        { value: "default", label: "기본 이미지" },
        { value: "checked", label: "직접 선택" },
    ],
    state: "disable",
};

export const Checked = Template.bind({});
Checked.args = {
    title: "프로필 이미지",
    radioOptions: [
        { value: "default", label: "기본 이미지" },
        { value: "checked", label: "직접 선택" },
    ],
    state: "checked",
};
