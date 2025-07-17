import React from "react";
import PropTypes from "prop-types";
import RadioListItem from "../RadioListItem/RadioListItem";
import SelectImageList from "./SelectImageList";

export default function SelectImageGroup({
    label = "",
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
    label: PropTypes.string,
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


{/* <SelectImageGroup
    label="프로필 이미지 선택"
    SelectImageGroupclassName="py-4"
    RadioListItemclassName="py-2"
    SelectImageclassName=""
    selectedValue={selectedValue}
    onChangeValue={setSelectedValue}
    radioOptions={[
        { value: "default", label: "기본 이미지" },
        { value: "checked", label: "선택 이미지" },
    ]}
    images={images}           // ✅ 배열!
    onAddImage={handleAddImage}   // ✅ 파일 선택
    onRemoveImage={handleRemoveImage} // ✅ 개별 삭제
    state="default" // "default", "hover", "disable", "checked"
    className = "mb-6"
/> */}