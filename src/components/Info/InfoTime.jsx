import React from "react";

/** 문자열/Date/숫자 → 24시간 HH:mm */
function to24h(t) {
    if (t == null) return "";

    // Date 객체
    if (t instanceof Date && !Number.isNaN(t.getTime())) {
        const hh = `${t.getHours()}`.padStart(2, "0");
        const mm = `${t.getMinutes()}`.padStart(2, "0");
        return `${hh}:${mm}`;
    }

    const s = String(t).trim();

    // 이미 HH:mm 형태면(24:00 포함) → 각 부분 2자리 패딩
    const m1 = /^(\d{1,2}):(\d{1,2})$/.exec(s);
    if (m1) {
        const hh = m1[1].padStart(2, "0");
        const mm = m1[2].padStart(2, "0");
        return `${hh}:${mm}`;
    }

    // h[:mm] am/pm → 24h
    const m2 = /^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)$/i.exec(s);
    if (m2) {
        let hh = parseInt(m2[1], 10);
        let mm = parseInt(m2[2] ?? "0", 10);
        const isPM = m2[3].toLowerCase() === "pm";
        if (isPM && hh !== 12) hh += 12;
        if (!isPM && hh === 12) hh = 0;
        return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    }

    // 숫자만 들어온 경우(예: 9 → 09:00, 930 → 09:30)
    const m3 = /^(\d{1,4})$/.exec(s);
    if (m3) {
        const raw = m3[1].padStart(m3[1].length <= 2 ? 2 : 4, "0");
        const hh = raw.length <= 2 ? parseInt(raw, 10) : parseInt(raw.slice(0, 2), 10);
        const mm = raw.length <= 2 ? 0 : parseInt(raw.slice(2), 10);
        return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
    }

    // 그 외는 표시 생략
    return "";
}

/**
 * InfoTime
 * - props
 *   - post: PocketBase record (post.timeStart / post.timeEnd 사용)
 *   - timeStart / timeEnd: 직접 전달도 가능(우선순위: prop > post)
 *   - infoColor / infoSize: 텍스트 스타일 클래스 주입
 *   - separator: 시작/끝 사이 구분자(기본 "~")
 */
export default function InfoTime({
    post,
    timeStart,
    timeEnd,
    className = "",
    starClassName = "",
    endClassName = "",
    infoColor,
    infoSize,
    separator = "~",
}) {
    const startText = to24h(timeStart ?? post?.timeStart);
    const endText = to24h(timeEnd ?? post?.timeEnd);
    const hasAny = !!(startText || endText);
    if (!hasAny) return null;

    return (
        <div className={[" w-full flex items-center", className].join(" ")}>
            {startText ? (
                <span className={`${infoColor} ${infoSize} ${starClassName} whitespace-nowrap`}>
                    {startText}
                </span>
            ) : null}

            {startText && endText ? (
                <span className={`${infoColor} ${infoSize} whitespace-nowrap px-[2px]`}>{separator}</span>
            ) : null}

            {endText ? (
                <span className={`${infoColor} ${infoSize} ${endClassName} whitespace-nowrap`}>
                    {endText}
                </span>
            ) : null}
        </div>
    );
}
