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
                <div className={["absolute left-0 mt-2 z-50", popupClass].join(" ")}>
                    <TimeWheelPicker
                        value={value}
                        onCancel={() => setOpen(false)}
                        onChange={(val, label) => {
                        onChange(val, label);     // ✅ (값, 라벨) 같이 올림
                        setOpen(false);
                        }}
                        minTime={minTime}
                        step={step}
                        className={TEXT_CLASSES}
                    />
                </div>
            )}
        </div>
    );
}
