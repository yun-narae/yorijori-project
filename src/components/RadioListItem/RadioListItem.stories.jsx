import React, { useState } from "react";
import RadioListItem from "./RadioListItem";

export default {
    title: "Components/RadioListItem",
    component: RadioListItem,
    argTypes: {},
};

const Template = (args) => {
    const [selected, setSelected] = useState("option1");
    return (
        <RadioListItem
            {...args}
            value={selected}
            onChange={setSelected}
        />
    );
};

export const Default = Template.bind({});
Default.args = {
    name: "radio",
    options: [
        { value: "option1", label: "옵션 1" },
        { value: "option2", label: "옵션 2" },
        { value: "option3", label: "옵션 3" },
    ],
    state: "default",
};

export const Hover = Template.bind({});
Hover.args = {
    name: "radio",
    options: [
        { value: "option1", label: "옵션 1" },
        { value: "option2", label: "옵션 2" },
    ],
    state: "hover",
};

export const Disable = Template.bind({});
Disable.args = {
    name: "radio",
    options: [
        { value: "option1", label: "옵션 1" },
    ],
    state: "disable",
};

export const Checked = Template.bind({});
Checked.args = {
    name: "radio",
    options: [
        { value: "option1", label: "옵션 1" },
    ],
    state: "checked",
};
