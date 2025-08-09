import React, { useEffect, useRef, useState } from "react";
import Input from "../Input/Input";
import Calendar from "./Calendar";
import SvgIcon from "../SvgIcon/SvgIcon";

const toKoreanLabel = (ymd) => {
    const [y, m, d] = ymd.split("-").map(Number);
    return `${y}년 ${m}월 ${d}일`;
};

export default function DateInput({
    value,
    onChange,
    maxDate,
    disabledDate,
    className = "",
    popupClass = "",
}) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const [open, setOpen] = useState(false);
    const [month, setMonth] = useState(today);

    const wrapRef = useRef(null);

    // 팝업 열릴 때: 선택된 값 있으면 그 달로, 없으면 오늘 달로
    useEffect(() => {
        if (!open) return;
        const base = (value || today).slice(0, 7) + "-01";
        setMonth(base);
    }, [open, value, today]);

    // 외부 클릭 / ESC 닫기
    useEffect(() => {
        if (!open) return;
        const onDown = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <div className={`relative ${className}`} ref={wrapRef}>
            <Input
                type="button"
                value={toKoreanLabel(value || today)}
                onClick={() => setOpen(true)}
                className="cursor-pointer"
                inputClass="!w-auto translate-x-4 mr-4"
            />
            <SvgIcon
                name="calendar"
                frameClass="absolute left-1 top-1 pointer-events-none"
                iconClass="text-[var(--color-gray-5)]"
            />

            {open && (
                <div className={`w-[280px] absolute left-0 mt-2 z-50 ${popupClass}`}>
                    <Calendar
                        month={month}
                        onMonthChange={(ymd) => setMonth(ymd)}
                        value={value || today}
                        onChange={(ymd) => {
                            onChange?.(ymd);
                            setOpen(false);
                        }}
                        minDate={today} // 오늘 이전 날짜 비활성화
                        maxDate={maxDate}
                        disabledDate={disabledDate}
                    />
                </div>
            )}
        </div>
    );
}
