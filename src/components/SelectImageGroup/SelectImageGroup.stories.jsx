import React, { useState } from "react";
import SelectImageGroup from "./SelectImageGroup";

export default {
  title: "Components/Common/SelectImageGroup",
  component: SelectImageGroup,
};

const Template = (args) => {
    const [selectedValue, setSelectedValue] = useState(
        args.selectedValue || "default"
    );
    const [images, setImages] = useState(
        args.initialImages || []
    );
    const MAX_COUNT = 3;

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
        <SelectImageGroup
        {...args}
        selectedValue={selectedValue}
        onChangeValue={setSelectedValue}
        images={images}
        onAddImage={handleAddImage}
        onRemoveImage={handleRemoveImage}
        maxCount={MAX_COUNT}
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
    ...Default.args,
    state: "hover",
};

export const Disable = Template.bind({});
Disable.args = {
    ...Default.args,
    state: "disable",
};

export const Checked = Template.bind({});
Checked.args = {
    ...Default.args,
    state: "checked",
    selectedValue: "checked",
    initialImages: [
        "https://picsum.photos/200/200?random=1"
    ],
};
