import React from "react";
import PropTypes from "prop-types";

function formatDateDot(date) {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}.${m}.${d}`;
}

function formatTimeKorean(updated, now = new Date()) {
    const date = updated instanceof Date ? updated : new Date(updated);
    if (isNaN(date.getTime())) return ""; // ← 파싱 실패 시 빈 문자열
    const diffMs = now.getTime() - date.getTime();
    if (diffMs < 0) return formatDateDot(date);

    const diffMin = Math.floor(diffMs / (60 * 1000));
    if (diffMin < 1) return "방금";
    if (diffMin < 60) return `${diffMin}분 전`;

    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;

    return formatDateDot(date);
}

export default function TimeBadge({
    updated,
    className = "",
    now,
    as = "span",
    titleFormat = true,
}) {
    if (updated == null) return null;

    // “방금”, “N분 전”, “N시간 전”, “YYYY.MM.DD” 같은 완성 텍스트면 그대로 표시
    if (typeof updated === "string") {
        const looksFormatted =
            /방금/.test(updated) ||
            /전$/.test(updated) ||
            /^\d{4}\.\d{1,2}\.\d{1,2}$/.test(updated);
        if (looksFormatted) {
            const Comp = as;
            return (
                <Comp
                    className={`text-[var(--color-gray-5)] text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm ${className}`}
                    title={titleFormat ? updated : undefined}
                >
                    {updated}
                </Comp>
            );
        }
    }

    // 그 외(ISO/Date/숫자) → 규칙대로 포맷
    const Comp = as;
    const dateObj = updated instanceof Date ? updated : new Date(updated);
    const display = formatTimeKorean(updated, now);
    if (!display) return null; // 파싱 실패 안전가드

    return (
        <Comp
            className={`text-[var(--color-gray-5)] ${className}`}
            dateTime={as === "time" ? dateObj.toISOString() : undefined}
            title={titleFormat ? dateObj.toLocaleString() : undefined}
        >
            {display}
        </Comp>
    );
}

TimeBadge.propTypes = {
    updated: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.instanceOf(Date),
    ]),
    className: PropTypes.string,
    now: PropTypes.instanceOf(Date),
    as: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
    titleFormat: PropTypes.bool,
};
