// src/components/Modal/ImagePreviewModal.jsx
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import { SvgIcon } from "../SvgIcon/SvgIcon";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";

export default function ImagePreviewModal({ previewUrl, onClose }) {
    const open = !!previewUrl;
    const dialogRef = useRef(null);
    const closeBtnRef = useRef(null);
    const previouslyFocusedRef = useRef(null);

    // 스크롤 잠금
    useLockBodyScroll(open);

    const isDark = document.documentElement.classList.contains("dark");
    const titleId = useMemo(() => "image-preview-title", []);

    const getFocusableEls = useCallback(() => {
        if (!dialogRef.current) return [];
        const selectors = [
            "a[href]",
            "button:not([disabled])",
            "input:not([disabled]):not([type='hidden'])",
            "select:not([disabled])",
            "textarea:not([disabled])",
            "[tabindex]:not([tabindex='-1'])",
            "[role='button']",
        ].join(",");
        const nodes = Array.from(dialogRef.current.querySelectorAll(selectors));
        return nodes.filter((el) => {
            const style = window.getComputedStyle(el);
            return style.visibility !== "hidden" && style.display !== "none";
        });
    }, []);

    // 열릴 때 포커스 설정 & 닫힐 때 복원
    useEffect(() => {
        if (!open) return;
        // 열기 직전 포커스 기억
        previouslyFocusedRef.current = document.activeElement;

        // 최초 포커스: 닫기 버튼 > dialog
        setTimeout(() => closeBtnRef.current?.focus(), 0);

        return () => {
            const prev = previouslyFocusedRef.current;
            if (prev && typeof prev.focus === "function") {
                setTimeout(() => prev.focus(), 0);
            }
            previouslyFocusedRef.current = null;
        };
    }, [open]);

    // ESC 닫기
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose?.();
            }
            if (e.key === "Tab") {
                // Tab/Shift+Tab 순환
                const els = getFocusableEls();
                if (!els.length) {
                    e.preventDefault();
                    dialogRef.current?.focus();
                    return;
                }
                const first = els[0];
                const last = els[els.length - 1];
                const active = document.activeElement;

                if (e.shiftKey) {
                    if (active === first || !dialogRef.current.contains(active)) {
                        e.preventDefault();
                        last.focus();
                    }
                } else {
                    if (active === last || !dialogRef.current.contains(active)) {
                        e.preventDefault();
                        first.focus();
                    }
                }
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, onClose, getFocusableEls]);

    // 모달 밖 포커스 유입 방지
    useEffect(() => {
        if (!open) return;
        const onFocusIn = (e) => {
            if (!dialogRef.current) return;
            if (!dialogRef.current.contains(e.target)) {
                const els = getFocusableEls();
                (els[0] || dialogRef.current)?.focus();
            }
        };
        document.addEventListener("focusin", onFocusIn);
        return () => document.removeEventListener("focusin", onFocusIn);
    }, [open, getFocusableEls]);

    if (!open) return null;

    return createPortal(
        <div
            aria-modal="true"
            role="dialog"
            aria-labelledby={titleId}
            className="fixed inset-0 z-[1000] flex items-center justify-center"
        >
            {/* overlay */}
            <div
                className="absolute inset-0 bg-black/80"
                onClick={onClose}
            />

            {/* dialog */}
            <div
                ref={dialogRef}
                tabIndex={-1}
                className="relative max-w-[90vw] max-h-[85vh] w-auto outline-none"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id={titleId} className="sr-only">이미지 미리보기</h2>

                <img
                    src={previewUrl}
                    alt="확대 이미지"
                    className="w-full h-full max-h-[85vh] object-contain rounded shadow-lg"
                    draggable={false}
                />
                <SvgIcon
                    name="delete"
                    frameClass={isDark ? "absolute top-2 right-2 bg text-2xl" : "absolute top-4 right-4 bg text-2xl text-white rounded-full hover:bg-[var(--color-gray-4)] transition cursor-pointer"}
                    onClick={onClose}
                    fill
                    aria-label="이미지 미리보기 닫기"
                />
            </div>
        </div>,
        document.body
    );
}

ImagePreviewModal.propTypes = {
  previewUrl: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
