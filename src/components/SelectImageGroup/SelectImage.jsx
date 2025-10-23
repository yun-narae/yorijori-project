import React from "react";
import PropTypes from "prop-types";
import SvgIcon from "../SvgIcon/SvgIcon";
import SelectImageDeleteButton from "./SelectImageDeleteButton";

export default function SelectImage({
    imageUrl,
    onSelectImage,
    onRemoveImage,
    isRemovable = false,
    className = "",
    state = "default",
}) {
    const isDisabled = state === "disable";
    const isUploaded = !!imageUrl;

    // ✅ 업로드된 상태 스타일
    const uploadedClasses = [
        "relative",
        "w-[80px] h-[80px]",
        "border border-dashed rounded-lg border-[var(--color-gray-3)]",
        "bg-cover bg-center",
        "flex items-center justify-center",
        "hover:shadow-lg",
        "transition",
        isDisabled && "opacity-50 cursor-not-allowed",
        className,
    ].filter(Boolean);

    // ✅ 빈 슬롯(업로드 버튼) 상태 스타일
    const emptyClasses = [
        "w-[80px] h-[80px]",
        "border border-dashed rounded-lg border-[var(--color-gray-3)]",
        "flex items-center justify-center",
        state === "hover" && "bg-[var(--color-gray-2)]",
        !isDisabled && "hover:bg-[var(--color-gray-2)]",
        "transition",
        className,
    ].filter(Boolean);

    return (
        <div className="relative">
            <SvgIcon
                type="button"
                name={isUploaded ? "" : "camera"}
                onClick={onSelectImage}
                frameClass={isUploaded ? uploadedClasses.join(" ") : emptyClasses.join(" ")}
                style={isUploaded ? { backgroundImage: `url(${imageUrl})` } : {}}
                state={isDisabled ? "disable" : state}
                hoverEffect={false}
                tabIndex={isDisabled ? -1 : 0}
                aria-label={isUploaded ? "이미지 선택" : "이미지 업로드"}
            />

            {isRemovable && (
                <SelectImageDeleteButton
                    onClick={onRemoveImage}
                    state={state === "hover" ? "hover" : "default"}
                />
            )}
        </div>
    );
}

SelectImage.propTypes = {
  imageUrl: PropTypes.string,
  onSelectImage: PropTypes.func.isRequired,
  onRemoveImage: PropTypes.func,
  isRemovable: PropTypes.bool,
  className: PropTypes.string,
  state: PropTypes.oneOf(["default", "hover", "disable"]),
};
