import React from "react";
import SvgIcon from "./SvgIcon";

export default {
    title: "Components/SvgIcon",
    component: SvgIcon,
    argTypes: {
        name: {
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
        frameSize: {
            control: "",
            options: ["xs", "sm", "md", "lg"],
        },
        iconSize: {
            control: "",
            options: ["xs", "sm", "md", "lg"],
        },
        state: {
            control: "",
            options: ["default", "hover", "active", "disabled"],
        },
        fill: {
            control: "boolean",
        },
        className: {
            control: "text",
        },
    },
};

const Template = (args) => <SvgIcon {...args} />;

export const Default = Template.bind({});
Default.args = {
    name: "plus",
    frameSize: "md",
    iconSize: "xs",
    state: "default",
    fill: true,
};
Default.parameters = {
    controls: {
        exclude: ["className", "state"],
    },
};

export const Hover = Template.bind({});
Hover.args = {
    ...Default.args,
    state: "hover",
    fill: true,
    className: "bg-[var(--color-gray-2)]"
};
Hover.parameters = {
    controls: {
        exclude: ["fill", "className", "state"],
    },
};

export const Active = Template.bind({});
Active.args = {
    ...Default.args,
    state: "active",
};
Active.parameters = {
    controls: {
        exclude: ["className", "state"],
    },
};

export const Disabled = Template.bind({});
Disabled.args = {
    ...Default.args,
    state: "disabled",
    fill: true,
};
Disabled.parameters = {
    controls: {
        exclude: ["fill", "className", "state"],
    },
};

export const AllSizes = () => (
    <div className="flex gap-4">
        {["xs", "sm", "md", "lg"].map((size) => (
            <SvgIcon key={size} name="menu" frameSize={size} fill />
        ))}
    </div>
);
