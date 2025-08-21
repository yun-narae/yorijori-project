import React, { memo } from "react";

/* 단일 배지 : '모집마감' | '모집중' | '마감임박' | '무료클래스' */
const StatusBadge = memo(function StatusBadge({ status, className = "" }) {
    const styles = {
        모집마감: "bg-[var(--color-gray-4)] text-white",
        모집중: "bg-[var(--color-green-1)] text-white",
        마감임박: "bg-[var(--color-redorange-1)] text-white",
        무료클래스: "bg-[var(--color-blue-2)] text-white",
    };

    return (
        <span
            className={[
                "inline-flex items-center rounded-md px-[4px] py-[2px] whitespace-nowrap",
                "text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm",
                styles[status],
                className,
            ].join(" ")}
        >
            {status}
        </span>
    );
});

export default StatusBadge;
