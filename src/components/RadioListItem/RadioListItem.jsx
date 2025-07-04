import React from "react";
import PropTypes from "prop-types";

export default function RadioListItem({
    options,
    name,
    value,
    onChange,
    RadioListItemclassName,
    state = "default",
}) {
    const isDisabled = state === "disable";

    return (
        <div className={[
            "flex flex-wrap gap-x-4 gap-y-2 pb-2",
            RadioListItemclassName,
        ].join(" ")}>
            {options.map((option) => (
                <label
                    key={option.value}
                    className={[
                        "flex items-center gap-2 shrink-0",
                        isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                    ].join(" ")}
                >
                    <input
                        type="radio"
                        name={name}
                        value={option.value}
                        checked={value === option.value}
                        disabled={isDisabled}
                        onChange={(e) => onChange(e.target.value)}
                        className={[
                            "appearance-none w-[18px] h-[18px] rounded-full border-2",
                            "transition-colors",
                            // state === "disable" ? "" : "hover:border-[var(--color-gray-8)]",
                            state === "hover" ? "border-[var(--color-gray-8)]" : "border-[var(--color-gray-3)]",
                            value === option.value ? "border-[var(--color-gray-8)] bg-[var(--color-primary)] border-4" : "",
                            isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                        ].join(" ")}
                    />
                    <p className={value === option.value ? "text-[var(--color-gray-8)]" : "text-[var(--color-gray-6)]"}>
                        {option.label}
                    </p>
                </label>
            ))}
        </div>
    );
}

RadioListItem.propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string,
        label: PropTypes.string,
    })).isRequired,
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    RadioListItemclassName: PropTypes.string,
    state: PropTypes.oneOf(["default", "hover", "disable", "checked"]),
};


{/* <RadioListItem
    options={[
        { value: "option1", label: "옵션 1" },
        { value: "option2", label: "옵션 2" },
    ]}
    name="example"
    value={selected}
    onChange={setSelected}
    state="default" // "hover", "disable", "checked" 로 바꿔 테스트 가능
/> */}