import React, { useState } from "react";
import ImagePreviewModal from "./ImagePreviewModal";

export default {
    title: "Components/Common/ImagePreviewModal",
    component: ImagePreviewModal,
    parameters: {
        layout: "centered",
    },
};

const Template = (args) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            <button
                className="px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => setIsOpen(true)}
            >
                Show Preview Modal
            </button>
            <ImagePreviewModal
                {...args}
                previewUrl={isOpen ? args.previewUrl : null}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};

export const Default = Template.bind({});
Default.args = {
    previewUrl:
        "https://placehold.co/600x400?text=Preview+Image",
};