import React from "react";
import PropTypes from "prop-types";
import BaseButton from "../BaseButton/BaseButton";
import SvgIcon from "../SvgIcon/SvgIcon";

const SUBTEXT_VARIANTS = {
    info: "text-[var(--color-gray-6)]",
    error: "text-[var(--color-red-1)]",
    finish: "text-[var(--color-green-1)]",
};

const CustomButton = ({
    text = "Button",
    subTexts = [],
    iconName,
    subIconName,
    variant = "primary",
    size = "md",
    state = "default",
    onClick,
    onSubIconClick,
    svgIconClass = "",
    basebuttonClass = "",
    custombuttonClass = "",
    subIconframeClass="",
    subIconClass="",
}) => {
    const isDisabled = state === "disable";
    const isHover = state === "hover";

    return (
        <div className={`flex flex-col gap-2 w-full ${custombuttonClass}`}>
            <div className="flex items-center gap-2">
                {subIconName && (
                    <div onClick={isDisabled ? undefined : onSubIconClick}>
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
                        />
                    </div>
                )}
                <BaseButton
                    text={text}
                    variant={variant}
                    size={size}
                    state={state}
                    iconName={iconName}
                    onClick={onClick}
                    className={`${basebuttonClass}`}
                />
            </div>

            {subTexts.map((sub, idx) => (
                <div
                    key={idx}
                    className={`flex items-center gap-1 ${
                        isDisabled ? "cursor-not-allowed" : ""
                    }`}
                >
                    <span
                        className={`text-mo-text tablet:text-tab-button desktop:text-pc-button break-keep ${SUBTEXT_VARIANTS[sub.type]} ${
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
    variant: PropTypes.oneOf(["primary", "secondary", "tertiary"]),
    size: PropTypes.oneOf(["sm", "md", "lg"]),
    state: PropTypes.oneOf(["default", "hover", "disable"]),
    onClick: PropTypes.func,
    onSubIconClick: PropTypes.func,
    svgIconClass: PropTypes.string,
    basebuttonClass: PropTypes.string,
    custombuttonClass: PropTypes.string,
};

export default CustomButton;

// use
// import CustomButton from '../components/CustomButton/CustomButton';
{/* <CustomButton
    text="제출하기"
    // iconName="arrow-right"
    subIconName="bell"
    variant="primary"
    size="md"
    state="default"
    subTexts={[
        { text: "안내 문구입니다", type: "info" },
        { text: "에러가 발생했습니다", type: "error" },
        { text: "제출 완료!", type: "finish" }
    ]}
    onClick={() => console.log("✅ BaseButton 클릭")}
    onSubIconClick={() => console.log("🔔 SvgIcon 클릭")}
    // svgIconClass="bg-black"
    // basebuttonClass="bg-black"
    custombuttonClass="tablet:w-[320px]"
/> */}