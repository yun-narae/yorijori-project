import React from "react";
import PropTypes from "prop-types";
import RadioListItem from "../RadioListItem/RadioListItem";
import SelectImageList from "./SelectImageList";

export default function SelectImageGroup({
    title = "",
    radioOptions = [],
    selectedValue,
    onChangeValue,
    images = [],         // ✅ 배열로 변경
    onAddImage,          // ✅ 새로 추가
    onRemoveImage,       // ✅ 새로 추가
    className,
    RadioListItemclassName,
    SelectImageclassName,
    state = "default",
    maxCount = 3,        // ✅ 최대 업로드 수
}) {
    const showUploadButton = images.length < maxCount;

    return (
        <div className={`w-full ${className}`}>
            {title && (
                <h3 className="mb-2 font-bold text-[var(--color-gray-8)]">
                    {title}
                </h3>
            )}

            <RadioListItem
                options={radioOptions}
                name="select-image-group"
                value={selectedValue}
                onChange={onChangeValue}
                RadioListItemclassName={RadioListItemclassName}
                state={state === "disable" ? "disable" : selectedValue === "checked" ? "checked" : state}
            />

            {selectedValue === "checked" && (
                <SelectImageList
                    images={images}
                    onAddImage={onAddImage}
                    onRemoveImage={onRemoveImage}
                    SelectImageclassName={SelectImageclassName}
                    state={state}
                    maxCount={maxCount}
                />
            )}
        </div>
    );
}

SelectImageGroup.propTypes = {
    title: PropTypes.string,
    radioOptions: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string,
            label: PropTypes.string,
        })
    ),
    selectedValue: PropTypes.string.isRequired,
    onChangeValue: PropTypes.func.isRequired,
    images: PropTypes.arrayOf(PropTypes.string), // ✅ 배열
    onAddImage: PropTypes.func.isRequired,       // ✅ 필수
    onRemoveImage: PropTypes.func.isRequired,    // ✅ 필수
    RadioListItemclassName: PropTypes.string,
    SelectImageclassName: PropTypes.string,
    state: PropTypes.oneOf(["default", "hover", "disable", "checked"]),
    maxCount: PropTypes.number,
};
