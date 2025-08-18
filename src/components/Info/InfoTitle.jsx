import React from "react";

/**
 * InfoTitle
 * - 기본 스타일: md 타이틀 사이즈 + font-bold
 * - props
 *   - title: 표시할 텍스트
 *   - className: 추가 클래스
 */
export default function InfoTitle({
    title,
    className = "",
    titleoColor
}) {

    const fontSize =
        "font-bold text-mo-title-md tablet:text-tab-title-md desktop:text-pc-title-md";

    return (
        <h3 className={
            ["line-clamp-2 break-keep", fontSize, className, titleoColor]
            .join(" ")}>
            {title}
        </h3>
    );
}
