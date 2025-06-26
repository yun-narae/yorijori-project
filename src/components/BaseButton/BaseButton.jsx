import React from "react";
import PropTypes from "prop-types";
import { SvgIcon } from "../SvgIcon/SvgIcon";

const STATE_CLASSES = {
    default: {
        primary: "bg-[var(--color-redorange-1)] hover:bg-[var(--color-redorange-2)] transition",
        secondary: "border border-[var(--color-gray-3)] hover:bg-[var(--color-gray-2)] transition",
        tertiary: "bg-transparent hover:bg-[var(--color-gray-2)] transition",
    },
    hover: {
        primary: "bg-[var(--color-redorange-2)]",
        secondary: "border border-[var(--color-gray-3)] bg-[var(--color-gray-2)]",
        tertiary: "bg-[var(--color-gray-2)]",
    },
    disable: {
        primary: "bg-[var(--color-gray-3)] cursor-not-allowed",
        secondary: "bg-[var(--color-gray-1)] border border-[var(--color-gray-3)] cursor-not-allowed",
        tertiary: "bg-transparent cursor-not-allowed",
    },
};

const TEXT_COLOR_CLASSES = {
    default: {
        primary: "text-[var(--white)]",
        secondary: "text-[var(--color-gray-8)]",
        tertiary: "text-[var(--color-gray-8)]",
    },
    hover: {
        primary: "text-[var(--white)]",
        secondary: "text-[var(--color-gray-8)]",
        tertiary: "text-[var(--color-gray-8)]",
    },
    disable: {
        primary: "text-[var(--color-gray-5)]",
        secondary: "text-[var(--color-gray-5)]",
        tertiary: "text-[var(--color-gray-5)]",
    },
};

const ICON_COLOR_CLASSES = {
    default: {
        primary: "text-[var(--white)]",
        secondary: "text-[var(--color-gray-8)]",
        tertiary: "text-[var(--color-gray-8)]",
    },
    hover: {
        primary: "text-[var(--white)]",
        secondary: "text-[var(--color-gray-8)]",
        tertiary: "text-[var(--color-gray-8)]",
    },
    disable: {
        primary: "text-[var(--color-gray-5)] cursor-not-allowed",
        secondary: "text-[var(--color-gray-5)] cursor-not-allowed",
        tertiary: "text-[var(--color-gray-5)] cursor-not-allowed",
    },
};

const SIZE_CLASSES = {
    sm: "px-[10px] h-[30px]",
    md: "px-[15px] h-[40px]",
    lg: "px-[15px] h-[50px]",
};

const BaseButton = ({
    text = "버튼",
    htmlType = "button",
    onClick,
    variant = "primary",
    size = "md",
    state = "default",
    iconName,
    className = "",
}) => {
    const isDisabled = state === "disable";

    const buttonClass = [
        "flex",
        "items-center",
        "justify-center",
        "rounded-[10px]",
        "overflow-hidden",
        "w-full",
        STATE_CLASSES[state]?.[variant],
        SIZE_CLASSES[size],
        className,
    ].join(" ");

    const innerClass = [
        "flex",
        "items-center",
        "justify-center",
        "gap-1",
    ].join(" ");

    const textClass = [
        "font-bold",     
        "text-center",
        "break-keep",
        "translate-y-[1px]",
        "tablet:translate-y-[1px]",
        "desktop:translate-y-[0px]",
        "text-mo-button",
        "tablet:text-tab-button",
        "desktop:text-pc-button",
        TEXT_COLOR_CLASSES[state]?.[variant],
    ].join(" ");

    const svgiconClass = ICON_COLOR_CLASSES[state]?.[variant] || "";

    return (
        <button
            type={htmlType}
            onClick={onClick}
            className={buttonClass}
            disabled={isDisabled}
        >
            <div className={innerClass}>
                <span
                    role="text"
                    className={textClass}
                >
                    {text}
                </span>
                {iconName && size !== "sm" && (
                    <SvgIcon
                        name={iconName}
                        frameSize="xs"
                        iconSize="xs"
                        state={state} // 버튼의 상태와 동일하게
                        iconClass={svgiconClass}
                        hoverEffect={false}
                    />
                )}
            </div>
        </button>
    );
};

BaseButton.propTypes = {
    text: PropTypes.string,
    onClick: PropTypes.func,
    htmlType: PropTypes.oneOf(["button", "submit", "reset"]),
    variant: PropTypes.oneOf(["primary", "secondary", "tertiary"]),
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    state: PropTypes.oneOf(["default", "hover", "disable"]),
    iconName: PropTypes.string,
    className: PropTypes.string,
};

export default BaseButton;


// use
// import BaseButton from '../components/BaseButton/BaseButton';
{/* <BaseButton
    text="뒤로가기"
    iconName="arrow-left"
    size="md"
    state="disable"
    onClick={() => navigate(-1)}
    className="tablet:w-[320px]"
/> */}
