import React from "react";
import PropTypes from "prop-types";
import SvgIcon from "../SvgIcon/SvgIcon";

export default function SelectImage({ imageUrl, onSelectImage, className = "", state = "default" }) {
    const isDisabled = state === "disable";

    const baseClasses = [
        "w-[100px] h-[100px]",
        "border border-dashed rounded-lg border-[var(--color-gray-3)]",
        "flex items-center justify-center",
        state === "disable" ? "" : "hover:bg-[var(--color-gray-2)]",
        "transition",
        className,
        imageUrl ? "bg-cover bg-center" : "",
    ];

    if (state === "hover") {
        baseClasses.push("bg-[var(--color-gray-2)]");
    }

    if (isDisabled) {
        baseClasses.push("opacity-50 cursor-not-allowed");
    }

    return (
        <button
            type="button"
            onClick={onSelectImage}
            className={baseClasses.join(" ")}
            style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
            disabled={isDisabled}
        >
            {!imageUrl && (
                <SvgIcon 
                    name="camera"
                    hoverEffect={false}
                    state={state}
                />
            )}
        </button>
    );
}

SelectImage.propTypes = {
    imageUrl: PropTypes.string,
    onSelectImage: PropTypes.func.isRequired,
    className: PropTypes.string,
    state: PropTypes.oneOf(["default", "hover", "disable"]),
};


{/* <SelectImage
    imageUrl={imageUrl}
    onSelectImage={handleSelectImage}
    state="default" // "hover" or "disable"
/> */}