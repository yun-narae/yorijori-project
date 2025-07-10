// ✅ Input.jsx
import React from "react";
import PropTypes from "prop-types";
import InputButton from "./InputButton";

const SUBTEXT_VARIANTS = {
    info: "text-[var(--color-gray-6)]",
    error: "text-[var(--color-red-1)]",
    finish: "text-[var(--color-green-1)]",
};

const BORDER_COLOR_VARIANTS = {
    default: "bg-[var(--color-gray-1)] border-[var(--color-gray-3)] hover:border-[var(--color-gray-6)] focus-within:border-[var(--color-gray-6)] transition",
    hover: "bg-[var(--color-gray-1)] border-[var(--color-gray-6)]",
    error: "bg-[var(--color-gray-1)] border-[var(--color-red-1)]",
    disable: "bg-[var(--color-gray-2)] border-[var(--color-gray-3)] cursor-not-allowed",
};

const TEXT_COLOR_VARIANTS = {
    default: "text-[var(--color-gray-6)] focus-within:text-[var(--color-gray-8)] placeholder-[var(--color-gray-4)] transition",
    hover: "text-[var(--color-gray-6)] focus-within:text-[var(--color-gray-8)] placeholder-[var(--color-gray-4)] transition",
    error: "text-[var(--color-gray-6)] focus-within:text-[var(--color-gray-8)] placeholder-[var(--color-gray-4)] transition",
    disable: "text-[var(--color-gray-4)] placeholder-[var(--color-gray-4)] cursor-not-allowed",
};

const Input = ({
    label,
    buttontext = "",
    placeholder = "",
    type = "text", // type 기본값
    pattern,
    subTexts = [],
    state = "default",
    buttonState = "disable",
    onButtonClick,
    onChange,
    value = "",
    className = "",
    inputClass = "",
}) => {
    const isDisabled = state === "disable";
    const borderClasses = BORDER_COLOR_VARIANTS[state] || BORDER_COLOR_VARIANTS.default;
    const textClasses = TEXT_COLOR_VARIANTS[state] || TEXT_COLOR_VARIANTS.default;

    return (
        <div className={`flex flex-col gap-1 w-full ${className}`}>
            {label && (
                <label className="mb-2 font-bold text-[var(--color-gray-8)]">
                    {label}
                </label>
            )}
            <div
                className={`flex items-center justify-between gap-2 rounded-lg border px-4 py-3 ${borderClasses} ${isDisabled ? "cursor-not-allowed" : ""}`}
            >
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    pattern={pattern || undefined}
                    required={pattern ? true : undefined}
                    onChange={onChange}
                    disabled={isDisabled}
                    className={`
                        w-full
                        bg-transparent outline-none
                        text-mo-text tablet:text-tab-text desktop:text-pc-text 
                        ${textClasses}
                        ${isDisabled ? "placeholder-[var(--color-gray-4)] cursor-not-allowed" : ""
                        } ${inputClass}`}
                />
                {buttontext && (
                    <InputButton
                        text={buttontext}
                        state={buttonState}
                        onClick={isDisabled ? undefined : onButtonClick}
                    />
                )}
            </div>

            {subTexts.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-1">
                    <span
                        className={`text-mo-text tablet:text-tab-text desktop:text-pc-text break-keep ${
                            SUBTEXT_VARIANTS[sub.type]
                        } ${isDisabled ? "cursor-not-allowed" : ""}`}
                    >
                        {sub.text}
                    </span>
                </div>
            ))}
        </div>
    );
};

Input.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    buttontext: PropTypes.string,
    type: PropTypes.oneOf([
        "text",
        "password",
        "number",
        "email",
        "tel",
        "url",
        "search",
    ]),
    pattern: PropTypes.string,
    subTexts: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string.isRequired,
            type: PropTypes.oneOf(["info", "error", "finish"]),
        })
    ),
    state: PropTypes.oneOf(["default", "hover", "error", "disable"]),
    buttonState: PropTypes.oneOf(["activation", "activation-hover", "disable"]),
    onButtonClick: PropTypes.func,
    onChange: PropTypes.func,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    className: PropTypes.string,
    inputClass: PropTypes.string,
};

export default Input;
