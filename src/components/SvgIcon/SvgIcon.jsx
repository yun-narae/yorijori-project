import React from "react";
import PropTypes from "prop-types";

const STATE_CLASSES = {
    default: "text-[var(--color-gray-7)]",
    hover: "text-[var(--color-gray-7)] rounded-full bg-[var(--color-gray-2)] text-[var(--color-gray-8)] cursor-pointer transition",
    disabled: "text-[var(--color-gray-3)] cursor-not-allowed",
};

const SIZE_CLASSES = {
    xs: "w-[1.5rem] h-[1.5rem]",
    sm: "w-[1.875rem] h-[1.875rem]",
    md: "w-[2.5rem] h-[2.5rem]",
    lg: "w-[3.125rem] h-[3.125rem]",
};

export const SvgIcon = ({
    name,
    frameSize = "md",
    iconSize = "xs",
    state = "default",
    fill = false,
    className = "",
    onClick,
}) => {
    const frameClass = SIZE_CLASSES[frameSize] || SIZE_CLASSES["md"];
    const iconClass = SIZE_CLASSES[iconSize] || SIZE_CLASSES["xs"];

    let stateClass = "";

    if (!["disable", "hover"].includes(state)) {
        stateClass = STATE_CLASSES.default;
    } else if (state === "disable") {
        stateClass = STATE_CLASSES.disabled;
    } else if (state === "hover") {
        stateClass = STATE_CLASSES.hover;
    }

    return (
        <div
            onClick={state === "disable" ? undefined : onClick}
            className={`flex items-center justify-center ${frameClass} ${stateClass} ${className}`}
        >
            <svg
                className={`${iconClass}`}
                aria-hidden="true"
                role="img"
                focusable="false"
            >
                <use href={`./src/assets/sprite-sheet.svg#${name}`} />
            </svg>
        </div>
    );
};

SvgIcon.propTypes = {
    name: PropTypes.string.isRequired,
    frameSize: PropTypes.oneOf(["xs", "sm", "md", "lg"]),
    iconSize: PropTypes.oneOf(["xs", "sm", "md", "lg"]),
    state: PropTypes.oneOf(["default", "hover", "active", "disabled"]),
    fill: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func,
};

export default SvgIcon;

// use
{/* <SvgIcon
    name="arrow-up"
    frameSize="md"
    iconSize="sm"
    fill
    onClick={() => console.log("아이콘 클릭됨")}
    className="text-blue-500"
/> */}