import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import SvgIcon from "../SvgIcon/SvgIcon";

/* ===== 스타일 상수 ===== */
// inline 모드 공통
export const INLINE_ITEM_CLASS =
    "text-[var(--color-gray-5)] hover:underline text-mo-text tablet:text-tab-text desktop:text-pc-text whitespace-nowrap";

// menu 모드 공통
export const MENU_ITEM_BASE_CLASS = "w-full px-3 py-2 text-left";
export const MENU_ITEM_TEXT_NORMAL_CLASS =
    "text-[var(--color-gray-8)] hover:bg-[var(--color-gray-1)] text-mo-text tablet:text-tab-text desktop:text-pc-text whitespace-nowrap";
export const MENU_ITEM_TEXT_DANGER_CLASS =
    "text-[var(--color-gray-8)] hover:bg-[var(--color-gray-1)] text-mo-text tablet:text-tab-text desktop:text-pc-text whitespace-nowrap";

/**
 * EditAndDelete
 * - variant: "menu" | "inline"
 * - text: { edit: string, delete: string }
 * - onEdit, onDelete: callbacks
 * - confirmDelete: true면 삭제 전에 confirm
 * - align: "right" | "left"  // menu 위치
 * - className / triggerClass / panelClass / itemClass: 스타일 훅
 * - children: 커스텀 트리거(없으면 기본 케밥 아이콘)
 *
 * 사용 예)
 *  <EditAndDelete variant="menu" onEdit={...} onDelete={...}/>
 *  <EditAndDelete variant="inline" onEdit={...} onDelete={...}/>
 *  <EditAndDelete variant="menu"><MyTrigger/></EditAndDelete>
 */
export default function EditAndDelete({
    variant = "menu",
    text = { edit: "수정", delete: "삭제" },
    onEdit,
    onDelete,
    confirmDelete = true,
    confirmMessage = "정말 삭제하시겠어요?",
    align = "right",
    className = "",
    panelClass = "",
    itemClass = "",
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    // 외부 클릭 시 닫힘
    useEffect(() => {
        if (!open) return;
        const onDown = (e) => {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onDown);
        return () => document.removeEventListener("mousedown", onDown);
    }, [open]);

    const handleEdit = (e) => {
        e?.stopPropagation();
        e?.preventDefault?.();
        setOpen(false);
        onEdit?.();
    };

    const handleDelete = (e) => {
        e?.stopPropagation();
        e?.preventDefault?.();
        if (!onDelete) return;
        if (confirmDelete) {
            if (!window.confirm(confirmMessage)) return;
        }
        setOpen(false);
        onDelete();
    };

    // inline 모드: 간단 텍스트 버튼
    if (variant === "inline") {
        return (
            <div className={["flex items-center gap-2", className].join(" ")}>
                <button
                    type="button"
                    onClick={handleEdit}
                    className={[INLINE_ITEM_CLASS, itemClass].join(" ")}
                    aria-label="수정"
                >
                    {text.edit}
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    className={[INLINE_ITEM_CLASS, itemClass].join(" ")}
                    aria-label="삭제"
                >
                    {text.delete}
                </button>
            </div>
        );
    }

    // menu 모드: 팝오버 패널(트리거는 외부에서 제어)
    return (
        <div
            ref={rootRef}
            className={[
                "absolute z-10 rounded-lg",
                "border border-[var(--color-gray-2)] bg-[var(--color-primary)] shadow-lg",
                "overflow-hidden",
                align === "right" ? "right-0" : "left-0",
                className,
                panelClass,
            ].join(" ")}
        >
            <button
                type="button"
                onClick={handleEdit}
                className={[MENU_ITEM_BASE_CLASS, MENU_ITEM_TEXT_NORMAL_CLASS, itemClass].join(" ")}
            >
                {text.edit}
            </button>

            <div className="h-px bg-[var(--color-gray-2)]" />

            <button
                type="button"
                onClick={handleDelete}
                className={[MENU_ITEM_BASE_CLASS, MENU_ITEM_TEXT_DANGER_CLASS, itemClass].join(" ")}
            >
                {text.delete}
            </button>
        </div>
    );
}

EditAndDelete.propTypes = {
    variant: PropTypes.oneOf(["menu", "inline"]),
    text: PropTypes.shape({
        edit: PropTypes.string,
        delete: PropTypes.string,
    }),
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    confirmDelete: PropTypes.bool,
    confirmMessage: PropTypes.string,
    align: PropTypes.oneOf(["right", "left"]),
    className: PropTypes.string,
    triggerClass: PropTypes.string,
    panelClass: PropTypes.string,
    itemClass: PropTypes.string,
    children: PropTypes.node,
};
