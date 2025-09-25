// src/components/Badges/TimeBadge.jsx
import React from "react";
import PropTypes from "prop-types";

function formatDateDot(date) {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, "0");
    const d = `${date.getDate()}`.padStart(2, "0");
    return `${y}.${m}.${d}`;
}

function formatTimeKorean(value, now = new Date()) {
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return "";
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
    /** ✅ 확장: created + updated 동시 지원 */
    created,
    updated,

    /** ⬇️ 하위호환: 과거처럼 updated 하나만 쓰는 경우도 동작 */
    // updated prop 그대로 사용 (위와 동일 이름이라 둘 다 받을 수 있음)

    now,
    as = "span",
    titleFormat = true,
    timeClass,
}) {
    const Comp = as;

    // 1) created가 제공되면: "작성시각 [· 수정됨 ...]" 형태
    if (created != null) {
        const createdDisplay = formatTimeKorean(created, now);
        if (!createdDisplay) return null;

        const createdDateObj = created instanceof Date ? created : new Date(created);
        const updatedDisplay =
            updated != null && String(updated) !== String(created)
                ? formatTimeKorean(updated, now)
                : null;
        const updatedDateObj = updated instanceof Date ? updated : new Date(updated);

        return (
            <Comp
                className={`whitespace-nowrap text-[var(--color-gray-5)] text-mo-text tablet:text-tab-text desktop:text-pc-text ${timeClass || ""}`}
                dateTime={as === "time" ? createdDateObj.toISOString() : undefined}
                title={
                    titleFormat
                        ? updatedDisplay
                            ? `${createdDateObj.toLocaleString()} · 수정됨 ${updatedDateObj.toLocaleString()}`
                            : createdDateObj.toLocaleString()
                        : undefined
                }
            >
                {createdDisplay}
                {updatedDisplay ? <span> · 수정됨 {updatedDisplay}</span> : null}
            </Comp>
        );
    }

    // 2) 하위호환: updated 하나만 주어진 경우 기존 로직
    if (updated == null) return null;

    // "방금, N분 전, N시간 전, YYYY.MM.DD" 같은 완제품 텍스트면 그대로
    if (typeof updated === "string") {
        const looksFormatted =
            /방금/.test(updated) ||
            /전$/.test(updated) ||
            /^\d{4}\.\d{1,2}\.\d{1,2}$/.test(updated);
        if (looksFormatted) {
            return (
                <Comp
                    className={`text-[var(--color-gray-5)] text-mo-text tablet:text-tab-text desktop:text-pc-text ${timeClass || ""}`}
                    title={titleFormat ? updated : undefined}
                >
                    {updated}
                </Comp>
            );
        }
    }

    const dateObj = updated instanceof Date ? updated : new Date(updated);
    const display = formatTimeKorean(updated, now);
    if (!display) return null;

    return (
        <Comp
            className={`whitespace-nowrap text-[var(--color-gray-5)] text-mo-text tablet:text-tab-text desktop:text-pc-text ${timeClass || ""}`}
            dateTime={as === "time" ? dateObj.toISOString() : undefined}
            title={titleFormat ? dateObj.toLocaleString() : undefined}
        >
            {display}
        </Comp>
    );
}

TimeBadge.propTypes = {
    created: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    updated: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    now: PropTypes.instanceOf(Date),
    as: PropTypes.oneOfType([PropTypes.string, PropTypes.elementType]),
    titleFormat: PropTypes.bool,
    timeClass: PropTypes.string,
};
