import React from "react";
import PropTypes from "prop-types";

const STATE_CLASSES = {
    default: "text-[var(--color-gray-7)] cursor-pointer",
    hover: "text-[var(--color-gray-7)] text-[var(--color-gray-8)] transition cursor-pointer",
    hoverFill: "text-[var(--color-gray-7)] rounded-full hover:bg-[var(--color-gray-2)] hover:text-[var(--color-gray-8)] transition cursor-pointer",
    disable: "text-[var(--color-gray-5)] cursor-not-allowed",
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
    frameClass = "",
    iconClass = "",
    hoverEffect = true // hoverEffect가 false이면 hover 효과 없이 기본 색만 적용
}) => {
    const frameSizeClass = SIZE_CLASSES[frameSize] || SIZE_CLASSES["md"];
    const iconSizeClass = SIZE_CLASSES[iconSize] || SIZE_CLASSES["xs"];
    const stateClass = STATE_CLASSES[state] || STATE_CLASSES["default"];

    const isDisabled = state === "disable";

    const hoverfillClass =
    isDisabled && (fill || hoverEffect)
        ? STATE_CLASSES.disable
        : !isDisabled && state === "default" && !hoverEffect
            ? STATE_CLASSES.default
            : !isDisabled && state === "default" && fill
                ? `${STATE_CLASSES.default} ${STATE_CLASSES.hoverFill}`
                : !isDisabled && state === "default" && !fill
                    ? `${STATE_CLASSES.default} ${STATE_CLASSES.hover}`
                    : "";


    return (
        <div className={
            `shrink-0 flex items-center justify-center 
            ${frameSizeClass} 
            ${stateClass} 
            ${hoverfillClass}
            ${frameClass}
            `
        }>
            <svg
                className={`${iconSizeClass} ${iconClass}`}
                aria-hidden="true"
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
    state: PropTypes.oneOf(["default", "disable", "hover", "hoverFill"]),
    fill: PropTypes.bool,
    className: PropTypes.string,
};

export default SvgIcon;


// use
// import SvgIcon from '../components/SvgIcon/SvgIcon';
{/* <SvgIcon
    name="arrow-up"
    frameSize="lg"
    iconSize="sm"
    state="default"
    fill
    // hoverEffect={false}
    onClick={() => console.log("아이콘 클릭됨")}
    frameClass="absolute left-2 top-8"
    iconClass="absolute left-2 top-2"
/> */}
