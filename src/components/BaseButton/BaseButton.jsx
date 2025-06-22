import React from "react";
import PropTypes from "prop-types";
import { SvgIcon } from "../SvgIcon/SvgIcon";

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
    // variant
    let variantClass = "";
    if (state !== "disable") {
        if (variant === "primary") {
            variantClass = "bg-[var(--color-redorange-1)] hover:bg-[var(--color-redorange-2)] text-[var(--white)] transition";
        } else if (variant === "secondary") {
            variantClass = "border border-[var(--color-gray-3)] hover:bg-[var(--color-gray-2)] text-[var(--color-gray-8)] transition";
        } else if (variant === "tertiary") {
            variantClass = "bg-transparent hover:bg-[var(--color-gray-2)] text-[var(--color-gray-8)] transition";
        }
    }

    // Size
    let sizeClass = "";
    if (size === "sm") {
        sizeClass = "px-[10px] h-[30px]";
    } else if (size === "md") {
        sizeClass = "px-[15px] h-[40px]";
    } else if (size === "lg") {
        sizeClass = "px-[15px] h-[50px]";
    }

    // State-disable
    let stateClass = "";
    if (state === "disable") {
        if (variant === "primary") {
            stateClass = "bg-[var(--color-gray-3)] text-[var(--color-gray-5)] cursor-not-allowed";
        } else if (variant === "secondary") {
            stateClass = "bg-[var(--color-gray-1)] border border-[var(--color-gray-3)] text-[var(--color-gray-5)] cursor-not-allowed";
        } else if (variant === "tertiary") {
            stateClass = "bg-transparent text-[var(--color-gray-5)] cursor-not-allowed";
        }
    }

    // State-IconColor
    let colorClass = "";
    if (state === "disable") {
        if (variant === "primary") {
            colorClass = "text-[var(--color-gray-5)] cursor-not-allowed";
        } else if (variant === "secondary") {
            colorClass = "text-[var(--color-gray-5)] cursor-not-allowed";
        } else if (variant === "tertiary") {
            colorClass = "text-[var(--color-gray-5)] cursor-not-allowed";
        }
    } else {
        if (variant === "primary") {
            colorClass = "text-[var(--white)]";
        } else if (variant === "secondary") {
            colorClass = "text-[var(--color-gray-8)]";
        } else if (variant === "tertiary") {
            colorClass = "text-[var(--color-gray-8)]";
        }
    }

    const buttonClass = [
        "flex",
        "items-center",
        "justify-center",
        "rounded-[10px]",
        "overflow-hidden",
        variantClass,
        stateClass,
        sizeClass,
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

    const iconClass = [
        colorClass,
    ].join(" ");

    return (
        <button
            type={htmlType}
            onClick={onClick}
            className={buttonClass}
            disabled={state === "disable"}
        >
            <div className={innerClass}>
                <span role="text" className="font-bold text-center break-keep translate-y-[1.5px] tablet:translate-y-[1.6px] desktop:translate-y-[0px]">
                    {text}
                </span>
                {iconName && size !== "sm" && (
                    // 사이즈가 sm일 경우 SvgIcon 숨김
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
    size: PropTypes.oneOf(["mo", "tab", "pc"]),
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

