import React, { useEffect, useRef, useState } from "react";
import TimeWheelPicker from "./TimeWheelPicker";
import Input from "../Input/Input";

const toLabel = (hhmm) => {
    if (!hhmm) return "00 : 00";
    const [h, m] = hhmm.split(":").map(Number);
    const ap = h >= 12 ? "오후" : "오전";
    const h12 = (h % 12) || 12;
    return `${ap} ${String(h12).padStart(2, "0")} : ${String(m).padStart(2, "0")}`;
};

export default function TimeInput({
    value,
    onChange,
    minTime,
    step = 10,
    className = "",
    popupClass = "",
}) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const popupRef = useRef(null);
    const [placeAbove, setPlaceAbove] = useState(false);
    const [alignRight, setAlignRight] = useState(false);

    const TEXT_CLASSES = "text-mo-title tablet:text-tab-title desktop:text-pc-title"

    // 바깥 클릭/ESC 닫기
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

    // 팝업 열릴 때 위치 자동 조정
    useEffect(() => {
        if (!open || !wrapRef.current || !popupRef.current) return;

        const wrapRect = wrapRef.current.getBoundingClientRect();
        const popRect = popupRef.current.getBoundingClientRect();

        // 아래로 열면 bottom overflow?
        const spaceBelow = window.innerHeight - wrapRect.bottom;
        const needFlipAbove = spaceBelow < popRect.height + 12; // 12px margin
        setPlaceAbove(needFlipAbove);

        // 왼쪽 기준으로 놓으면 오른쪽 overflow?
        const spaceRight = window.innerWidth - wrapRect.left;
        const needAlignRight = spaceRight < popRect.width + 12;
        setAlignRight(needAlignRight);
    }, [open, value]); // value 바뀌며 열릴 때도 안전

    return (
        <div className={`relative ${className}`} ref={wrapRef}>
            <Input
                type="button"
                value={toLabel(value)}
                onClick={() => setOpen(true)}
                className="cursor-pointer"
                inputClass="cursor-pointer"
                readOnly
            />

            {open && (
                <div
                    ref={popupRef}
                    className={[
                        "absolute z-50",                         // 포지셔닝 베이스
                        placeAbove ? "bottom-full mb-2" : "mt-2",// 위/아래 스위치
                        alignRight ? "right-0" : "left-0",       // 좌/우 스위치
                        popupClass,
                    ].join(" ")}
                    >
                    <TimeWheelPicker
                        value={value}
                        onChange={(v) => { onChange(v); setOpen(false); }}
                        onCancel={() => setOpen(false)}
                        minTime={minTime}
                        step={step}
                        className="text-mo-title tablet:text-tab-title desktop:text-pc-title"
                    />
                </div>
            )}
        </div>
    );
}
