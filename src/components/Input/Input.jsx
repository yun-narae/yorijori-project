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

const TEXT_SIZE = "text-mo-text tablet:text-tab-text desktop:text-pc-text"

const Input = ({
    label,
    name,
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
    inputWrapper = "",
    inputClass = "",
    textarea = false,
}) => {
    const isDisabled = state === "disable";
    const borderClasses = BORDER_COLOR_VARIANTS[state] || BORDER_COLOR_VARIANTS.default;
    const textClasses = `${TEXT_COLOR_VARIANTS[state] || TEXT_COLOR_VARIANTS.default} ${TEXT_SIZE}`;

    return (
        <form className={`flex flex-col gap-1 w-full ${className}`}>
            {label && (
                <label className="
                    font-bold 
                    text-[var(--color-gray-6)]
                    text-mo-title
                    tablet:text-tab-title
                    desktop:text-pc-title
                ">
                    {label}
                </label>
            )}

            <div className={`
                flex  justify-between gap-2
                rounded-lg border
                px-4 ${textarea ? "py-3 items-start" : "h-[50px] items-center"}
                ${inputWrapper}
                ${borderClasses}
                ${isDisabled ? "cursor-not-allowed" : ""}
            `}>
                {textarea ? (
                    <textarea
                        placeholder={placeholder}
                        value={value}
                        name={name}
                        onChange={onChange}
                        disabled={isDisabled}
                        className={`
                            w-full h-auto min-h-[96px]
                            bg-transparent outline-none
                            break-words whitespace-pre-wrap
                            ${textClasses}
                            ${isDisabled ? "cursor-not-allowed" : ""}
                            ${inputClass}
                        `}
                    />
                ) : (
                    <input
                        type={type}
                        placeholder={placeholder}
                        value={value}
                        name={name}
                        pattern={pattern || undefined}
                        required={pattern ? true : undefined}
                        onChange={onChange}
                        disabled={isDisabled}
                        className={`
                            w-full
                            bg-transparent outline-none
                            mobile:translate-y-[1px]
                            ${textClasses}
                            ${isDisabled ? "placeholder-[var(--color-gray-4)] cursor-not-allowed" : ""}
                            ${inputClass}
                        `}
                    />
                )}

                {!textarea && buttontext && (
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
        </form>
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
    inputWrapper: PropTypes.string,
    inputClass: PropTypes.string,
    textarea: PropTypes.bool,
};

export default Input;

// import Input from '../components/Input/Input';

// const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
// });

{/* <Input
    label="이메일"
    type="email" // "text","password","number","email","tel","url", "search"
    placeholder="이메일 입력"
    state={emailInputState}
    buttontext="중복확인"
    buttonState={emailButtonState}
    subTexts={[
        { text: "안내 문구입니다", type: "info" },
        { text: "에러가 발생했습니다", type: "error" },
        { text: "제출 완료!", type: "finish" },
    ]}
    value={formData.email}
    onChange={(e) =>
        setFormData({ ...formData, email: e.target.value })
    }
    onButtonClick={() => console.log("이메일 버튼 클릭")}
    className="mb-6"
    inputClass=""
/> */}