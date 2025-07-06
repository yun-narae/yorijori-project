import React, { useState } from "react";
import SelectImageList from "./SelectImageList";

export default {
    title: "Components/Common/SelectImageList",
    component: SelectImageList,
    argTypes: {},
};

const Template = (args) => {
    const [images, setImages] = useState(args.initialImages || []);
    const MAX_COUNT = args.maxCount || 3;

    const handleAddImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (images.length >= MAX_COUNT) {
        alert(`이미지는 최대 ${MAX_COUNT}개까지 업로드할 수 있어요.`);
        return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
        e.target.value = null;
    };

    const handleRemoveImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        alert("이미지가 삭제되었습니다.");
    };

    return (
        <SelectImageList
        {...args}
        images={images}
        onAddImage={handleAddImage}
        onRemoveImage={handleRemoveImage}
        maxCount={MAX_COUNT}
        />
    );
};

export const Default = Template.bind({});
Default.args = {
    state: "default",
    maxCount: 3,
};

export const Hover = Template.bind({});
Hover.args = {
    ...Default.args,
    state: "hover",
};

export const Disable = Template.bind({});
Disable.args = {
    ...Default.args,
    state: "disable",
};

export const Filled = Template.bind({});
Filled.args = {
    ...Default.args,
    initialImages: [
        "https://picsum.photos/100/100?random=1",
        "https://picsum.photos/100/100?random=2",
    ],
};
