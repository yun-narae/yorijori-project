import React from "react";
import PropTypes from "prop-types";
import SelectImage from "./SelectImage";
import useImagePreview from "@/hooks/useImagePreview";
import ImagePreviewModal from "../ImagePreviewModal/ImagePreviewModal";

export default function SelectImageList({
    images = [],
    onAddImage,
    onRemoveImage,
    SelectImageclassName = "",
    state = "default",
    maxCount = 3,
}) {
    const showUploadButton = images.length < maxCount;

    // ✅ 미리보기 훅
    const { previewUrl, openPreview, closePreview } = useImagePreview();

    return (
        <>
            <div className="flex gap-2 flex-wrap">
                {showUploadButton && (
                <label htmlFor="group-upload">
                    <SelectImage
                    imageUrl=""
                    onSelectImage={() =>
                        document.getElementById("group-upload").click()
                    }
                    className={SelectImageclassName}
                    state={state}
                    />
                    <input
                    id="group-upload"
                    type="file"
                    accept="image/*"
                    onChange={onAddImage}
                    className="hidden"
                    />
                </label>
                )}

                {images.map((file, index) => (
                <SelectImage
                    key={index}
                    imageUrl={URL.createObjectURL(file)}
                    onSelectImage={() => openPreview(URL.createObjectURL(file))}
                    onRemoveImage={() => onRemoveImage(index)}
                    isRemovable
                    className={SelectImageclassName}
                    state={state}
                />
                ))}
            </div>

            {/* ✅ 미리보기 모달 */}
            <ImagePreviewModal previewUrl={previewUrl} onClose={closePreview} />
        </>
    );
}

SelectImageList.propTypes = {
    images: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
    onAddImage: PropTypes.func.isRequired,
    onRemoveImage: PropTypes.func.isRequired,
    SelectImageclassName: PropTypes.string,
    state: PropTypes.oneOf(["default", "hover", "disable", "checked"]),
    maxCount: PropTypes.number,
};
