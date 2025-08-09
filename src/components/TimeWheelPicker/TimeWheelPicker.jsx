import React, { useEffect, useMemo, useRef, useState } from "react";
import CustomButton from '../CustomButton/CustomButton';

/* ---------- utils ---------- */
const pad = (n) => String(n).padStart(2, "0");
const toMinutes24 = (hhmm) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
};
const fromMinutes24 = (mins) => `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`;
const hhmmToAmPm = (hhmm) => {
    if (!hhmm) return { ampm: "AM", hour: 12, minute: 0 };
    let [h, m] = hhmm.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    return { ampm, hour: h, minute: m };
};
const ampmTo24 = (ampm, hour, minute) => {
    let h = hour % 12;
    if (ampm === "PM") h += 12;
    return fromMinutes24(h * 60 + minute);
};

/* ---------- wheel column ---------- */
function Wheel({ items, value, onChange, itemRender, mode = "scroll", disabledOf }) {
  const ref = useRef(null);

  useEffect(() => {
    if (mode !== "scroll") return;
    const idx = items.findIndex((v) => v === value);
    if (idx < 0 || !ref.current) return;
    const el = ref.current.children[idx];
    if (el) el.scrollIntoView({ block: "center" });
  }, [value, items, mode]);

    return (
        <div className="relative w-20 h-40 overflow-auto snap-y snap-mandatory no-scrollbar">
            {mode === "scroll" && (
                <div 
                    className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2 h-8 rounded"
                />
            )}

            {mode === "scroll" ? (
                <div ref={ref}>
                    {items.map((v) => {
                        const disabled = typeof disabledOf === "function" ? !!disabledOf(v) : false;
                        return (
                        <button
                            key={v}
                            type="button"
                            onClick={() => !disabled && onChange(v)}
                            disabled={disabled}
                            aria-disabled={disabled}
                            className={[
                            "w-full py-2 snap-center text-center rounded hover:bg-[var(--color-gray-2)]",
                            disabled
                                ? "text-[var(--color-gray-4)] cursor-not-allowed"
                                : v === value
                                ? "font-bold text-[var(--color-gray-8)]"
                                : "text-[var(--color-gray-6)]",
                            ].join(" ")}
                        >
                            {itemRender ? itemRender(v) : v}
                        </button>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col">
                    {items.map((v) => (
                        <button
                            key={v}
                            type="button"
                            onClick={() => onChange(v)}
                            className={[
                                "py-2 text-center rounded hover:bg-[var(--color-gray-2)]",
                                v === value ? "font-bold text-[var(--color-gray-8)]" : "text-[var(--color-gray-6)]",
                            ].join(" ")}
                        >
                        {itemRender ? itemRender(v) : v}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ---------- main picker ---------- */
export default function TimeWheelPicker({
    value,            // "HH:mm"
    onChange,         // (hh:mm) => void
    minTime,          // "HH:mm" (이후만 선택 가능)
    step = 10,        // 분 간격
    onCancel,         // () => void
    className
}) {
    const v = hhmmToAmPm(value);
    const [ampm, setAmpm] = useState(v.ampm);
    const [hour, setHour] = useState(v.hour);
    const [minute, setMinute] = useState(v.minute);

    // 기준값
    const minMins = useMemo(() => (minTime ? toMinutes24(minTime) : null), [minTime]);
    const minHour = useMemo(() => (minMins != null ? Math.floor(minMins / 60) : null), [minMins]);
    const minMinute = useMemo(() => (minMins != null ? minMins % 60 : null), [minMins]);

    // 후보 리스트
    const ampmItems = ["AM", "PM"];
    const hourItems = Array.from({ length: 12 }, (_, i) => i + 1); // 1~12
    const minuteItemsAll = Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step);

    /* 시간/분 비활성 규칙 */
    // 시작 이전 시는 전부 회색/클릭불가
    const hourDisabledOf = (h12) => {
        if (minHour == null) return false;
        const candidateH24 = (ampm === "PM" ? 12 : 0) + (h12 % 12);
        return candidateH24 < minHour;
    };
    // 같은 시면 minMinute 이하 비활성
    const minuteDisabledOf = (m) => {
        if (minHour == null) return false;
        const currentH24 = (ampm === "PM" ? 12 : 0) + (hour % 12);
        if (currentH24 < minHour) return true;
        if (currentH24 > minHour) return false;
        return m <= minMinute;
    };

    const toAmPmLabel = (hhmm) => {
        if (!hhmm) return "";
        let [h, m] = hhmm.split(":").map(Number);
        const ap = h >= 12 ? "오후" : "오전";
        h = h % 12 || 12; // 0 -> 12
        const pad = (n) => String(n).padStart(2, "0");
        return `${ap} ${pad(h)} : ${pad(m)}`;
      };

    const commit = () => {
        const hhmm = ampmTo24(ampm, hour, minute);   // "HH:mm"
        // (안전장치) 시작 이후만 허용
        if (minMins != null && toMinutes24(hhmm) <= minMins) return;
      
        const label = toAmPmLabel(hhmm);             // "오전 07 : 30" 같은 라벨
        onChange(hhmm, label);                       // ✅ 1) 24h 값, 2) 라벨을 함께 전달
    };

    return (
        <div className={`w-[260px] rounded-xl bg-white shadow-xl border border-[var(--color-gray-3)] p-3 ${className}`}>
            <div className="flex gap-2 items-center justify-center">
                <Wheel
                    items={ampmItems}
                    value={ampm}
                    onChange={setAmpm}
                    itemRender={(v) => (v === "AM" ? "오전" : "오후")}
                    mode="center"
                />
                <Wheel
                    items={hourItems}
                    value={hour}
                    onChange={setHour}
                    itemRender={(v) => v}
                    disabledOf={hourDisabledOf}
                />
                <Wheel
                    items={minuteItemsAll}
                    value={minute}
                    onChange={setMinute}
                    itemRender={(v) => pad(v)}
                    disabledOf={minuteDisabledOf}
                />
            </div>

            <div className="flex justify-end gap-2 mt-3">
                <CustomButton 
                    text="취소"
                    variant="secondary"
                    onClick={onCancel}
                />
                <CustomButton 
                    text="확인"
                    onClick={commit}
                />
            </div>
        </div>
    );
}
