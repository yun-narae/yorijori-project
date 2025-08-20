import React from "react";
import CategoryBadge from "./CategoryBadge";

/*
 * 카테고리 리스트 배지
 * categories: string | string[]
 * onItemClick: (label, index) => void
 */
export default function CategoryBadgeList({
    categories = [],
    className = "",
    itemClassName = "",
    onItemClick,
    fontSize,
}) {
    const list = Array.isArray(categories) ? categories : (categories ? [categories] : []);
    if (!list.length) return null;

    return (
        <div className={["flex gap-1", className].join(" ")}>
            {list.map((c, idx) => (
                <CategoryBadge
                    key={`${String(c)}-${idx}`}
                    label={c}
                    className={itemClassName}
                    fontSize={fontSize}
                    onClick={onItemClick ? () => onItemClick(c, idx) : undefined}
                />
            ))}
        </div>
    );
}
