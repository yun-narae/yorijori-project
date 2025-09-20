// src/components/CustomButton/CustomButton.jsx
import React from "react";
import PropTypes from "prop-types";
import BaseButton from "../BaseButton/BaseButton";
import SvgIcon from "../SvgIcon/SvgIcon";
import InfoLike from "../Info/InfoLike";

const SUBTEXT_VARIANTS = {
    info: "text-[var(--color-gray-6)]",
    error: "text-[var(--color-red-1)]",
    finish: "text-[var(--color-green-1)]",
};

const CustomButton = ({
    type ="",
    text = "",
    subTexts = [],
    iconName,
    subIconName,                 // 기존 Svg 아이콘
    infoLike = false,            // InfoLike를 렌더할지 여부
    infoLikeProps = {},          // InfoLike에 그대로 전달할 props
    variant = "primary",
    size = "md",
    state = "default",
    onClick,
    onSubIconClick,
    svgIconClass = "",
    basebuttonClass = "",
    basebuttontextClass = "",
    custombuttonClass = "",
    subIconframeClass = "",
    subIconClass = "",
}) => {
    const isDisabled = state === "disable";
    const isHover = state === "hover";

    return (
        <div className={`flex flex-col gap-2 w-full whitespace-nowrap ${custombuttonClass}`}>
            <div className="flex items-center gap-2">
                {/* 왼쪽 아이콘 자리: InfoLike 우선, 없으면 subIconName */}
                {infoLike ? (
                    <span
                        className={`shrink-0 ${svgIconClass} ${isDisabled ? "pointer-events-none opacity-60" : ""}`}
                    >
                        <InfoLike
                            // 버튼 옆 정렬 목적 기본 스타일
                            className={infoLikeProps?.className || ""}
                            // iconClass 병합: infoLikeProps.iconClass + subIconClass
                            iconClass={[infoLikeProps?.likeIconClass, subIconClass].filter(Boolean).join(" ")}
                            {...infoLikeProps}
                        />
                    </span>
                ) : (
                    subIconName && (
                        <SvgIcon
                            name={subIconName}
                            frameSize={size}
                            iconSize="xs"
                            state={isDisabled ? "disable" : isHover ? "hoverFill" : "default"}
                            fill
                            className={`shrink-0 ${svgIconClass}`}
                            ariaLabel="subIconName"
                            frameClass={subIconframeClass}
                            iconClass={subIconClass}
                            onClick={isDisabled ? undefined : onSubIconClick}
                        />
                    )
                )}

                <BaseButton
                    type={type}
                    text={text}
                    variant={variant}
                    size={size}
                    state={state}
                    iconName={iconName}
                    onClick={onClick}
                    basebuttonClass={basebuttonClass}
                    basebuttontextClass={basebuttontextClass}
                />
            </div>

            {subTexts.map((sub, idx) => (
                <div
                    key={idx}
                    className={`flex items-center gap-1 ${isDisabled ? "cursor-not-allowed" : ""}`}
                >
                    <span
                        className={`text-mo-button tablet:text-tab-button desktop:text-pc-button break-keep ${SUBTEXT_VARIANTS[sub.type]} ${
                            isDisabled ? "cursor-not-allowed" : ""
                        }`}
                    >
                        {sub.text}
                    </span>
                </div>
            ))}
        </div>
    );
};

CustomButton.propTypes = {
    text: PropTypes.string,
    subTexts: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string.isRequired,
            type: PropTypes.oneOf(["info", "error", "finish"]),
        })
    ),
    iconName: PropTypes.string,
    subIconName: PropTypes.string,
    infoLike: PropTypes.bool,
    infoLikeProps: PropTypes.object,
    variant: PropTypes.oneOf(["primary", "secondary", "tertiary"]),
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    state: PropTypes.oneOf(["default", "hover", "disable"]),
    onClick: PropTypes.func,
    onSubIconClick: PropTypes.func,
    svgIconClass: PropTypes.string,
    basebuttonClass: PropTypes.string,
    basebuttontextClass: PropTypes.string,
    custombuttonClass: PropTypes.string,
    subIconframeClass: PropTypes.string,
    subIconClass: PropTypes.string,
};

export default CustomButton;
