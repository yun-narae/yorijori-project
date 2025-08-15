import React, { memo } from "react";

/*
 * 단일 카테고리 배지
 * label: string (표시할 카테고리명)
*/
const CategoryBadge = memo(function CategoryBadge({
    label,
    className = "",
    onClick,
    title,
}) {
    if (label == null || label === "") return null;

    return (
        <span
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            title={title ?? String(label)}
            onClick={onClick}
            className={[
                "inline-flex items-center rounded-full px-2 py-1 whitespace-nowrap",
                "bg-[var(--color-gray-2)] text-[var(--color-gray-7)]",
                "font-semibold text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm",
                onClick ? "cursor-pointer hover:opacity-90 active:opacity-80" : "",
                className,
            ].join(" ")}
        >
            {String(label)}
        </span>
    );
});

export default CategoryBadge;
