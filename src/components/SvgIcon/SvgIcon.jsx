import React from "react";
import PropTypes from "prop-types";

const STATE_CLASSES = {
    default: "text-[var(--color-gray-7)]",
    hover: "text-[var(--color-gray-7)] rounded-full hover:bg-[var(--color-gray-2)] hover:text-[var(--color-gray-8)] hover:cursor-pointer transition",
    disabled: "text-[var(--color-gray-3)]",
    active: "text-[var(--color-gray-8)]",
};

const SIZE_CLASSES = {
    xs: "w-[1.5rem] h-[1.5rem]", // 24px
    sm: "w-[1.875rem] h-[1.875rem]", // 30px
    md: "w-[2.5rem] h-[2.5rem]", // 40px
    lg: "w-[3.125rem] h-[3.125rem]", // 50px
};

export const SvgIcon = ({
    name,
    frameSize = "md",
    iconSize = "xs",
    state = "default",
    fill = false,
    className = "",
}) => {
    const frameClass = SIZE_CLASSES[frameSize] || SIZE_CLASSES["md"];
    const iconClass = SIZE_CLASSES[iconSize] || SIZE_CLASSES["xs"];
    const stateClass = STATE_CLASSES[state] || STATE_CLASSES["default"];

    const isDisabled = state === "disabled";

    const hoverfillClass = isDisabled
        ? "cursor-not-allowed"
        : fill
            ? STATE_CLASSES.hover
            : "hover:text-[var(--color-gray-8)] hover:cursor-pointer transition";

    const svgHoverClass = isDisabled ? "" : "hover:text-[var(--color-gray-8)]";

    return (
        <div className={`flex items-center justify-center ${frameClass} ${hoverfillClass} ${stateClass} ${svgHoverClass} ${className}`}>
            <svg
                className={`${iconClass} ${className}`} aria-hidden="true"
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
    state: PropTypes.oneOf(["default", "disabled", "hover", "active"]),
    fill: PropTypes.bool,
    className: PropTypes.string,
};

export default SvgIcon;


// use
// import Icon from "./components/Icon";
{/* <Icon name="arrow-up" fill /> */}
{/* <Icon name="arrow-up" frameSize="md" iconSize="sm" fill /> */}
