import React from "react";

/**
 * InfoTitle
 * - 기본 스타일: md 타이틀 사이즈 + font-bold
 * - props
 *   - title: 표시할 텍스트
 *   - className: 추가 클래스
 *   - fontSize: 커스텀 폰트 크기 클래스(선택)
 */
export default function InfoTitle({
    title,
    className = "",
    titleoColor,
    fontSize,
}) {
    const defaultSize =
        "font-bold text-mo-title-md tablet:text-tab-title-md desktop:text-pc-title-md";
    const sizeClass =
        typeof fontSize === "string" && fontSize.trim().length > 0
            ? fontSize
            : defaultSize;

    return (
        <h3
            className={[
                "line-clamp-2 break-keep",
                sizeClass,
                className,
                titleoColor,
            ].join(" ")}
        >
            {title}
        </h3>
    );
}
