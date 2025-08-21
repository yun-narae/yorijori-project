import React from "react";
import SvgIcon from "../SvgIcon/SvgIcon";

// 2025-07-26 → 2025.07.26
function ymdDot(dateLike) {
    if (!dateLike) return "";
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    return `${y}.${m}.${dd}`;
}

/**
 * InfoDate
 * - props
 *   - post: PocketBase record (post.date 사용)
 *   - date: ISO/string/Date (post 없이 직접 전달도 가능, date 우선)
 *   - iconShow: 캘린더 아이콘 노출 여부
 *   - infoColor / infoSize: 텍스트 스타일 클래스 주입
 */
export default function InfoDate({
    post,
    date,
    className = "",
    iconShow = true,
    infoColor,
    infoSize,
}) {
    const dateText = ymdDot(date ?? post?.date);
    if (!dateText) return null;

    return (
        <div className={["w-full flex items-center", className].join(" ")}>
            {iconShow ? (
                <SvgIcon
                    name="calendar"
                    frameSize="xs"
                    frameClass="pointer-events-none"
                    iconClass={`${infoColor} w-[16px] h-[16px]`}
                />
            ) : null}
            <span className={`${infoColor} ${infoSize} truncate whitespace-normal line-clamp-1`}>
                {dateText}
            </span>
        </div>
    );
}
