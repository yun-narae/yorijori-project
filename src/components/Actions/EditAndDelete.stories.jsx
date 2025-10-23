import React from "react";
import EditAndDelete from "./EditAndDelete";

export default {
    title: "Components/Actions/EditAndDelete",
    component: EditAndDelete,
    argTypes: {
        variant: {
            control: { type: "select" },
            options: ["menu", "inline"],
        },
        align: {
            control: { type: "select" },
            options: ["right", "left"],
        },
        onEditPost: { action: "edit clicked" },
        onDeletePost: { action: "delete clicked" },
    },
};

const Template = (args) => (
    <div className="p-4 flex items-center justify-center">
        <div className="relative">
            <EditAndDelete {...args} />
        </div>
    </div>
);

export const MenuVariant = Template.bind({});
MenuVariant.args = {
    variant: "menu",
    text: { edit: "수정", delete: "삭제" },
    align: "right",
};

export const InlineVariant = Template.bind({});
InlineVariant.args = {
    variant: "inline",
    text: { edit: "수정", delete: "삭제" },
};

