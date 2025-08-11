import React from "react";
import PropTypes from "prop-types";
import RadioListItem from "../RadioListItem/RadioListItem";
import SelectImageList from "./SelectImageList";

export default function SelectImageGroup({
    label = "",
    radioOptions = [],
    selectedValue,
    onChangeValue,
    images = [],
    onAddImage,
    onRemoveImage,
    className,
    RadioListItemclassName,
    SelectImageclassName,
    state = "default",
    maxCount = 3,
    hideRadioList = false,
}) {
    const showUploadButton = images.length < maxCount;

    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            {label && (
                <h3 className="
                    font-bold 
                    text-[var(--color-gray-6)]
                    text-mo-title-sm
                    tablet:text-tab-title
                    desktop:text-pc-title
                ">
                    {label}
                </h3>
            )}

            {/* 라디오 옵션 숨기기 */}
            {!hideRadioList && (
                <RadioListItem
                    options={radioOptions}
                    name="select-image-group"
                    value={selectedValue}
                    onChange={onChangeValue}
                    RadioListItemclassName={RadioListItemclassName}
                    state={state === "disable" ? "disable" : selectedValue === "checked" ? "checked" : state}
                />
            )}

            {/* hideRadioList가 true이거나 선택된 값이 checked일 때만 이미지 리스트 렌더링 */}
            {(hideRadioList || selectedValue === "checked") && (
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
    label: PropTypes.string,
    radioOptions: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string,
            label: PropTypes.string,
        })
    ),
    selectedValue: PropTypes.string,
    onChangeValue: PropTypes.func,
    images: PropTypes.arrayOf(PropTypes.instanceOf(File)).isRequired,
    onAddImage: PropTypes.func.isRequired,
    onRemoveImage: PropTypes.func.isRequired,
    RadioListItemclassName: PropTypes.string,
    SelectImageclassName: PropTypes.string,
    state: PropTypes.oneOf(["default", "hover", "disable", "checked"]),
    maxCount: PropTypes.number,
    hideRadioList: PropTypes.bool, // ✅ 추가
};

{/* <SelectImageGroup
    label="요리모임 이미지 선택"
    hideRadioList={true} // 라디오 옵션 숨기기
    images={images}
    onAddImage={handleAddImage}
    onRemoveImage={handleRemoveImage}
    SelectImageclassName=""
    state="default"
/> */}