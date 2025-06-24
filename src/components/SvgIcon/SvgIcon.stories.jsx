import React from "react";
import SvgIcon from "./SvgIcon";

export default {
    title: "Components/SvgIcon",
    component: SvgIcon,
    argTypes: {
        name: {
            control: "select",
            options: [
                "arrow-down", "arrow-left", "arrow-right", "arrow-up", "bell",
                "calendar", "camera", "check-circle-1", "check-circle-2", "delete",
                "edit", "heart-1", "heart-2", "menu", "plus", "question",
                "search", "user", "warning",
            ],
        },
        frameSize: {
            control: "select",
            options: ["xs", "sm", "md", "lg"],
        },
        iconSize: {
            control: "select",
            options: ["xs", "sm", "md", "lg"],
        },
        state: {
            control: "select",
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
        exclude: ["className"],
    },
};

export const Hover = Template.bind({});
Hover.args = {
    ...Default.args,
    state: "hover",
    fill: true,
    className: "bg-[var(--color-gray-2)]",
};
Hover.parameters = {
    controls: {
        exclude: ["className"],
    },
};

export const Active = Template.bind({});
Active.args = {
    ...Default.args,
    state: "active",
};
Active.parameters = {
    controls: {
        exclude: ["className"],
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
        exclude: ["className"],
    },
};

export const AllSizes = () => (
    <div className="flex gap-4 p-4 bg-[var(--color-primary)]">
        {["xs", "sm", "md", "lg"].map((size) => (
            <div key={size} className="flex flex-col items-center gap-1">
                <SvgIcon name="menu" frameSize={size} iconSize={size} fill />
                <span className="text-xs text-[var(--color-gray-6)]">{size}</span>
            </div>
        ))}
    </div>
);