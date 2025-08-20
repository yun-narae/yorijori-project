import React, { memo } from "react";

/*
 * 단일 카테고리 배지
 * label: string (표시할 카테고리명)
 * fontSize: 기본 타이포 대신 외부에서 클래스 지정 가능
*/
const CategoryBadge = memo(function CategoryBadge({
    label,
    className = "",
    onClick,
    title,
    fontSize, // 👈 외부에서 폰트 사이즈/가중치 클래스 주입
}) {
    if (label == null || label === "") return null;

    // 기본 폰트 사이즈/가중치. fontSize가 주어지면 그 값을 우선 사용
    const sizeClass =
        fontSize && String(fontSize).trim().length > 0
            ? fontSize
            : "font-semibold text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm";

    return (
        <span
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            title={title ?? String(label)}
            onClick={onClick}
            className={[
                "inline-flex items-center rounded-full px-[8px] py-[2px] whitespace-nowrap",
                "bg-[var(--color-gray-2)] text-[var(--color-gray-7)]",
                sizeClass,       // 👈 여기서 적용
                onClick ? "cursor-pointer hover:opacity-90 active:opacity-80" : "",
                className,
            ].join(" ")}
        >
            {String(label)}
        </span>
    );
});

export default CategoryBadge;
