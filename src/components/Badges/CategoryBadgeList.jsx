import React from "react";
import CategoryBadge from "./CategoryBadge";

/*
 * 카테고리 리스트 배지
 * categories: string | string[]
 * gap, itemClassName: 간격/개별 배지 커스텀
 * max: 최대 표시 개수. 초과분은 "+N" 요약으로 표시
 * onItemClick: (label, index) => void
 */
export default function CategoryBadgeList({
    categories = [],
    className = "",
    itemClassName = "",
    max,
    onItemClick,
}) {
    const list = Array.isArray(categories) ? categories : (categories ? [categories] : []);
    if (!list.length) return null;

    const shown = typeof max === "number" && max > 0 ? list.slice(0, max) : list;
    const restCount = list.length - shown.length;

    return (
        <div className={[
            "flex gap-1", 
            className].join(" ")}
        >
            {shown.map((c, idx) => (
                <CategoryBadge
                    key={`${String(c)}-${idx}`}
                    label={c}
                    className={itemClassName}
                    onClick={onItemClick ? () => onItemClick(c, idx) : undefined}
                />
            ))}

            {restCount > 0 && (
                <CategoryBadge
                    label={`+${restCount}`}
                    title={list.slice(shown.length).join(", ")}
                    className={itemClassName}
                />
            )}
        </div>
    );
}
