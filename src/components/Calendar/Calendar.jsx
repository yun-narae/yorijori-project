import React, { useMemo } from "react";
import { SvgIcon } from "../SvgIcon/SvgIcon";

/* ---------- utils ---------- */
const pad = (n) => String(n).padStart(2, "0");
const toYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fromYMD = (s) => {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1);
};
const sameYMD = (a, b) =>
    a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function getMonthMatrix(year, month) {
    // month: 0-11
    const first = new Date(year, month, 1);
    const firstDay = first.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevDays = firstDay; // previous month trailing cells
    const matrix = [];
    let cursor = 1 - prevDays;

    for (let w = 0; w < 6; w++) {
        const row = [];
        for (let d = 0; d < 7; d++) {
        const date = new Date(year, month, cursor);
        row.push(date);
        cursor++;
        }
        matrix.push(row);
    }
    return matrix;
}

/* ---------- component ---------- */
export default function Calendar({
    value,
    onChange,
    month,
    minDate,
    maxDate,
    disabledDate,
    onMonthChange,
    className = "",
}) {
  const today = new Date();

  const selected = useMemo(
        () => (value instanceof Date ? value : fromYMD(value)),
        [value]
  );
  const min = useMemo(() => (minDate instanceof Date ? minDate : fromYMD(minDate)), [minDate]);
  const max = useMemo(() => (maxDate instanceof Date ? maxDate : fromYMD(maxDate)), [maxDate]);

  const base = useMemo(() => {
        if (month instanceof Date) return month;
        if (typeof month === "string") return fromYMD(month);
        if (selected) return new Date(selected.getFullYear(), selected.getMonth(), 1);
        return new Date(today.getFullYear(), today.getMonth(), 1);
  }, [month, selected, today]);

  const y = base.getFullYear();
  const m = base.getMonth();
  const matrix = useMemo(() => getMonthMatrix(y, m), [y, m]);

  const canGoPrev =
        !min || new Date(y, m, 1) > new Date(min.getFullYear(), min.getMonth(), 1);
  const canGoNext =
        !max || new Date(y, m + 1, 0) < new Date(max.getFullYear(), max.getMonth() + 1, 0);

  const moveMonth = (diff) => {
        if (!onMonthChange) return;
        const next = new Date(y, m + diff, 1);
        onMonthChange(toYMD(next), next);
  };

  const isDisabled = (d) => {
        if (min && d < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return true;
        if (max && d > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return true;
        if (typeof disabledDate === "function" && disabledDate(d)) return true;
        return false;
  };

  const TEXT_CLASSES = {
    Header: "text-mo-title-md tablet:text-tab-title-md desktop:text-pc-title-md font-bold",
    Month: "text-mo-title tablet:text-tab-title desktop:text-pc-title font-semibold",
    Date: "text-mo-text tablet:text-tab-text desktop:text-pc-text",
};

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

    return (
        <div
        className={[
            "rounded-lg border border-[var(--color-gray-3)] bg-[var(--color-gray-1)] p-2",
            "text-[var(--color-gray-8)]",
            className,
        ].join(" ")}
        >
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-3">
            <SvgIcon 
                    type="button"
                    name="arrow-left"
                    state={!onMonthChange || !canGoPrev ? "disable" : "default"}
                    frameClass={
                        !onMonthChange || !canGoPrev
                            ? "opacity-40 rounded"
                            : "cursor-pointer hover:bg-[var(--color-gray-2)] rounded"
                    }
                    onClick={() => {
                        if (onMonthChange && canGoPrev) moveMonth(-1);
                    }}
                    fill
                />
                <div className={`${TEXT_CLASSES.Header}`}>
                    {y}년 {m + 1}월
                </div>
                <SvgIcon
                    type="button"
                    name="arrow-right"
                    state={!onMonthChange || !canGoNext ? "disable" : "default"}
                    frameClass={
                        !onMonthChange || !canGoNext
                            ? "opacity-40 rounded"
                            : "cursor-pointer hover:bg-[var(--color-gray-2)] rounded"
                    }
                    onClick={() => {
                        if (onMonthChange && canGoNext) moveMonth(1);
                    }}
                    fill
                />
            </div>

            {/* 요일 */}
            <div className={`grid grid-cols-7 gap-1 mb-1 text-center`}>
                {dayNames.map((d, i) => (
                    <div
                        key={d}
                        className={[
                        "py-1",
                        TEXT_CLASSES.Month,
                        i === 0 ? "text-[var(--color-red-1)]" : i === 6 ? "text-[var(--color-blue-1)]" : "text-[var(--color-gray-7)]",
                        ].join(" ")}
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* 날짜 그리드 */}
            <div className={`grid grid-cols-7 gap-1 w-full ${TEXT_CLASSES.Date}`}>
                {matrix.flat().map((d, idx) => {
                    const outside = d.getMonth() !== m;
                    const disabled = isDisabled(d);
                    const isToday = sameYMD(d, today);
                    const isSelected = selected && sameYMD(d, selected);

                    return (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => !disabled && onChange?.(toYMD(d), d)}
                            disabled={disabled}
                            className={[
                                "aspect-[1/1] w-full rounded-full transition-colors",
                                "flex items-center justify-center", // ← 숫자 가로/세로 중앙 정렬
                                outside ? "text-[var(--color-gray-4)]" : "text-[var(--color-gray-8)]",
                                disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-[var(--color-gray-2)]",
                                isSelected
                                    ? "bg-[var(--color-redorange-1)] text-white hover:bg-[var(--color-redorange-1)]"
                                    : isToday && !outside
                                    ? "ring-1 ring-[var(--color-gray-5)]"
                                    : "",
                            ].join(" ")}
                        >
                            {d.getDate()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
