import React from "react";

/** 간단한 HTML 스트리핑 + 공백 정리 */
function normalizeText(input, { stripHtml = true } = {}) {
    if (input == null) return "";
    let s = String(input);
    if (stripHtml) s = s.replace(/<[^>]+>/g, "");  // 태그 제거
    s = s.replace(/\s+/g, " ").trim();             // 공백 정리
    return s;
}

/**
 * InfoDescription
 * - props
 *   - post: PocketBase record (post.description 또는 post.content 사용)
 *   - stripHtml: HTML 태그 제거 여부(기본 true)
 *   - infoColor / infoSize: 텍스트 유틸 클래스 주입
 */
export default function InfoDescription({
    post,
    className = "",
    stripHtml = true,
    infoColor,
    infoSize,
}) {
    const content = normalizeText(post?.description, { stripHtml });

    if (!content) return null;

    return (
        <p
            className={[
                infoColor,
                infoSize,
                "whitespace-normal break-words",
                className,
            ].join(" ")}
        >
            {content}
        </p>
    );
}
