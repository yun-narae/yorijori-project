// src/components/Modal/ConfirmProvider.jsx
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    useEffect,
} from "react";
import { createPortal } from "react-dom";
import CustomButton from "../CustomButton/CustomButton";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";

const ConfirmContext = createContext(null);

export function useConfirm() {
    const fn = useContext(ConfirmContext);
    if (typeof fn !== "function") {
        // HMR/SSR 등 Provider 부재 시 폴백
        return (opts = {}) => {
            if (process.env.NODE_ENV !== "production") {
                console.warn("[useConfirm] ConfirmProvider is missing. Showing alert fallback.");
            }
            if (opts?.title) alert(opts.title);
            return Promise.resolve(false);
        };
    }
    return fn;
}

export default function ConfirmProvider({ children }) {
    const resolverRef = useRef(null);
    const dialogRef = useRef(null);

    // 모달 열기 직전의 포커스 기억/복원
    const previouslyFocusedRef = useRef(null);

    const [open, setOpen] = useState(false);
    const DEFAULT_OPTS = {
        title: "",
        description: "",
        confirmText: "확인",
        cancelText: "취소",
        tone: "default", // 'default' | 'danger'
    };
    const [opts, setOpts] = useState(DEFAULT_OPTS);
    useLockBodyScroll(open);

    const confirm = useCallback((options = {}) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            setOpts({ ...DEFAULT_OPTS, ...options });
            // 현재 포커스 기억
            previouslyFocusedRef.current = document.activeElement;
            setOpen(true);
        });
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        if (resolverRef.current) resolverRef.current(false);
        resolverRef.current = null;
    }, []);

    const handleConfirm = useCallback(() => {
        setOpen(false);
        if (resolverRef.current) resolverRef.current(true);
        resolverRef.current = null;
    }, []);

    // Esc 닫기
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                handleClose();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, handleClose]);

    // 포커스 트랩 유틸
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
        // 숨김/비활성 요소 제외
        return nodes.filter((el) => {
            const style = window.getComputedStyle(el);
            return style.visibility !== "hidden" && style.display !== "none";
        });
    }, []);

    // Tab/Shift+Tab 순환, 모달 밖 포커스 유입 방지
    useEffect(() => {
        if (!open) return;

        // 최초 포커스: dialog 자체 또는 첫 포커스 가능 요소
        const focusables = getFocusableEls();
        const toFocus = focusables[0] || dialogRef.current;
        // dialog에 tabindex가 있으니 여기로도 가능
        setTimeout(() => toFocus?.focus(), 0);

        const onKeyDown = (e) => {
            if (e.key !== "Tab") return;
            const els = getFocusableEls();
            if (els.length === 0) {
                e.preventDefault();
                dialogRef.current?.focus();
                return;
            }
            const first = els[0];
            const last = els[els.length - 1];
            const active = document.activeElement;

            // Shift+Tab: first에서 뒤로 가면 last로
            if (e.shiftKey) {
                if (active === first || !dialogRef.current.contains(active)) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                // Tab: last에서 앞으로 가면 first로
                if (active === last || !dialogRef.current.contains(active)) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        // 모달 밖으로 포커스가 튀면 다시 모달로 돌려놓기
        const onFocusIn = (e) => {
            if (!dialogRef.current) return;
            if (!dialogRef.current.contains(e.target)) {
                const els = getFocusableEls();
                (els[0] || dialogRef.current)?.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("focusin", onFocusIn);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("focusin", onFocusIn);
        };
    }, [open, getFocusableEls]);

    // 닫히면 기존 포커스로 복원
    useEffect(() => {
        if (open) return;
        const prev = previouslyFocusedRef.current;
        if (prev && typeof prev.focus === "function") {
            setTimeout(() => prev.focus(), 0);
        }
        previouslyFocusedRef.current = null;
    }, [open]);

    const value = useMemo(() => ({ confirm }), [confirm]);

    const titleId = "confirm-title";
    const descId = "confirm-desc";

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {open &&
                createPortal(
                    <div
                        aria-modal="true"
                        role="dialog"
                        aria-labelledby={titleId}
                        aria-describedby={opts.description ? descId : undefined}
                        className="fixed inset-0 z-[1000] flex items-center justify-center"
                    >
                        {/* overlay */}
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={handleClose}
                        />
                        {/* dialog */}
                        <div
                            ref={dialogRef}
                            tabIndex={-1}
                            className="relative w-[90vw] max-w-[420px] rounded-xl bg-[var(--color-gray-1)] flex flex-col gap-2 p-4 shadow-xl outline-none"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex flex-col gap-2 items-center py-4">
                                <h3
                                    id={titleId}
                                    className="text-mo-title-lg tablet:text-tab-title-lg desktop:text-pc-title-md font-bold text-[var(--color-gray-8)] whitespace-pre-line text-center"
                                >
                                    {opts.title || "확인"}
                                </h3>
                                {!!opts.description && (
                                    <p id={descId} className="text-[var(--color-gray-6)]">
                                        {opts.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {!!opts.cancelText && (
                                    <CustomButton
                                        text={opts.cancelText}
                                        variant="secondary"
                                        onClick={handleClose}
                                    />
                                )}
                                {!!opts.confirmText && (
                                    <CustomButton
                                        text={opts.confirmText}
                                        onClick={handleConfirm}
                                    />
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </ConfirmContext.Provider>
    );
}
