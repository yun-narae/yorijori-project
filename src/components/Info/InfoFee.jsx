import React from "react";

/** 숫자/문자 → number로 안전 변환 */
function toNumber(val) {
    if (val === null || val === undefined) return NaN;
    const n = typeof val === "number" ? val : Number(String(val).replace(/[, ]/g, ""));
    return Number.isFinite(n) ? n : NaN;
}

/** 10,000 → "10,000원", 0 → "무료" */
function formatWon(n, { unit = "원", showUnit = true, zeroAsFree = true } = {}) {
    if (!Number.isFinite(n)) return "";
    if (zeroAsFree && n === 0) return "무료 클래스";
    const formatted = new Intl.NumberFormat("ko-KR").format(n);
    return showUnit ? `${formatted}${unit}` : formatted;
}

/**
 * InfoFee
 * - props
 *   - post: PocketBase record (post.fee 사용)
 *   - infoColor / infoSize: 텍스트 스타일 클래스 주입
 *   - unit, showUnit, zeroAsFree: 표시 옵션
 */
export default function InfoFee({
    post,
    className = "",
    infoColor,
    infoSize,
    unit = "원",
    showUnit = true,
    zeroAsFree = true,
}) {
    const n = toNumber(post?.fee);
    const text = formatWon(n, { unit, showUnit, zeroAsFree });

    if (!text) return null;

    return (
        <div className={["w-full flex items-center gap-1", className].join(" ")}>
            <span className={`${infoColor} ${infoSize} whitespace-nowrap`}>{text}</span>
        </div>
    );
}
