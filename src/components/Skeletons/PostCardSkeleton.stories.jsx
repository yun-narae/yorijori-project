import React from "react";
import PostCardSkeleton from "./PostCardSkeleton";

export default {
    title: "Components/Skeletons/PostCardSkeleton",
    component: PostCardSkeleton,
    argTypes: {
        variant: {
            control: { type: "select" },
            options: ["simple", "compact", "cover"],
        },
    },
};

const Template = (args) => (
    <div className="p-4 max-w-md">
        <PostCardSkeleton {...args} />
    </div>
);

export const Simple = Template.bind({});
Simple.args = {
    variant: "simple",
};

export const Compact = Template.bind({});
Compact.args = {
    variant: "compact",
};

export const Cover = Template.bind({});
Cover.args = {
    variant: "cover",
};


