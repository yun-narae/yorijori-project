import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import DaumPostcode from "react-daum-postcode";
import InputButton from "./InputButton";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";
import SvgIcon from "../SvgIcon/SvgIcon";

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
    onClick,
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isDark = document.documentElement.classList.contains("dark");

    const handleComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';
    
        if (data.addressType === 'R') {
            if (data.bname) extraAddress += data.bname;
            if (data.buildingName) {
                extraAddress += (extraAddress ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress ? ` (${extraAddress})` : '');
        }
    
        onChange({ target: { value: fullAddress, name } });
        setIsModalOpen(false);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setIsModalOpen(false);
            }
        };
    
        if (isModalOpen) {
            document.addEventListener("keydown", handleKeyDown);
        }
    
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isModalOpen]);

    const handleClose = () => {
        if (typeof onClose === "function") {
            onClose();
        } else {
            setIsModalOpen(false);
        }
    };

    useLockBodyScroll(isModalOpen);
    
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

            <div 
                className={`
                    flex justify-between gap-2
                    rounded-lg border
                    px-4 ${textarea ? "py-3 items-start" : "h-[50px] items-center"}
                    ${inputWrapper}
                    ${borderClasses}
                    ${isDisabled ? "cursor-not-allowed" : ""}
                `}
                onClick={onClick}
            >
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
                ) : type === "address" ? (
                    <div className="flex flex-col gap-2 flex-1 overflow-hidden">
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={value}
                            name={name}
                            readOnly
                            disabled={isDisabled}
                            className={`
                                w-full 
                                bg-transparent outline-none
                                ${textClasses}
                                ${isDisabled ? "placeholder-[var(--color-gray-4)] cursor-not-allowed" : ""}
                                ${inputClass}
                            `}
                        />
                        {isModalOpen && (
                            <div className="px-4 fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
                                <div className="w-full max-w-[500px] border rounded bg-white shadow-lg">
                                    <DaumPostcode
                                           onComplete={handleComplete}
                                           autoClose
                                           style={{ width: "100%", height: "400px" }}
                                           theme="white"
                                           animation
                                    />
                                    <SvgIcon
                                        name="delete"
                                        frameClass={isDark ? "absolute top-9 right-4 bg text-2xl" : "absolute top-4 right-4 bg text-2xl text-white rounded-full hover:bg-[var(--color-gray-4)] transition cursor-pointer"}
                                        onClick={handleClose}
                                        fill
                                    />
                                </div>
                            </div>
                        )}
                    </div>
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
                        onClick={
                            isDisabled
                                ? undefined
                                : type === "address"
                                    ? () => setIsModalOpen(true)
                                    : onButtonClick
                        }
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
        "button",
        "address",
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