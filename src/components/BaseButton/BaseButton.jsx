import React from "react";
import PropTypes from "prop-types";
import { SvgIcon } from "../SvgIcon/SvgIcon";

// 상태 + variant 조합으로 관리
const STATE_CLASSES = {
    default: {
        primary: "bg-[var(--color-redorange-1)] hover:bg-[var(--color-redorange-2)] text-[var(--white)] transition",
        secondary: "border border-[var(--color-gray-3)] hover:bg-[var(--color-gray-2)] text-[var(--color-gray-8)] transition",
        tertiary: "bg-transparent hover:bg-[var(--color-gray-2)] text-[var(--color-gray-8)] transition",
    },
    hover: {
        primary: "bg-[var(--color-redorange-2)] text-[var(--white)]",
        secondary: "border border-[var(--color-gray-3)] bg-[var(--color-gray-2)] text-[var(--color-gray-8)]",
        tertiary: "bg-[var(--color-gray-2)] text-[var(--color-gray-8)]",
    },
    disable: {
        primary: "bg-[var(--color-gray-3)] text-[var(--color-gray-5)] cursor-not-allowed",
        secondary: "bg-[var(--color-gray-1)] border border-[var(--color-gray-3)] text-[var(--color-gray-5)] cursor-not-allowed",
        tertiary: "bg-transparent text-[var(--color-gray-5)] cursor-not-allowed",
    },
};

const ICON_COLOR_CLASSES = {
    default: {
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
        STATE_CLASSES[state]?.[variant],
        SIZE_CLASSES[size],
        className,
    ].join(" ");

    const innerClass = [
        "flex",
        "items-center",
        "justify-center",
        "gap-1",
        "text-mo-button",
        "tablet:text-tab-button",
        "desktop:text-pc-button",
    ].join(" ");

    const iconClass = ICON_COLOR_CLASSES[state]?.[variant] || "";

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
                    className="font-bold text-center break-keep translate-y-[1px] tablet:translate-y-[1px] desktop:translate-y-[0px]"
                >
                    {text}
                </span>
                {iconName && size !== "sm" && (
                    <SvgIcon
                        name={iconName}
                        frameSize="xs"
                        iconSize="xs"
                        className={iconClass}
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
// import Icon from "./components/BaseButton/BaseButton";
{/* <BaseButton text="수정하기" variant="secondary" iconName="plus"></BaseButton> */}
{/* <BaseButton text="수정하기" size="sm" iconName="plus"></BaseButton> */}
{/* <BaseButton text="수정하기" size="sm" state="disable" iconName="plus"></BaseButton> */}

// 반응형 버튼이 필요하다면 -> w-full
{/* <BaseButton text="뒤로가기" iconName="arrow-left" className="w-full"></BaseButton> */}

