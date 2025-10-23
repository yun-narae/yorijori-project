import React, { memo } from "react";

/*
 * 카테고리 선택용 배지 컴포넌트
 * PostCreate.jsx의 카테고리 선택 버튼을 컴포넌트화
 * 
 * Props:
 * - label: string (표시할 카테고리명)
 * - isSelected: boolean (선택된 상태인지)
 * - onClick: function (클릭 핸들러)
 * - className: string (추가 클래스)
 * - disabled: boolean (비활성화 상태)
 */
const CategorySelectBadge = memo(function CategorySelectBadge({
    label,
    isSelected = false,
    onClick,
    className = "",
    disabled = false,
    ...props
}) {
    if (label == null || label === "") return null;

    const baseClasses = "transparent px-4 py-2 w-min whitespace-nowrap text-mo-button tablet:text-tab-button desktop:text-pc-button font-bold rounded-full transition";
    
    const stateClasses = isSelected
        ? "border border-[var(--color-redorange-2)] text-[var(--color-redorange-2)] hover:bg-[var(--color-gray-2)]"
        : "text-[var(--color-gray-7)] bg-[var(--color-gray-1)] border border-[var(--color-gray-2)] hover:border-[var(--color-gray-6)]";

    const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={[
                baseClasses,
                stateClasses,
                disabledClasses,
                className,
            ].join(" ")}
            {...props}
        >
            <p className="translate-y-[1px]">{label}</p>
        </button>
    );
});

export default CategorySelectBadge;
