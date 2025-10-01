// MobileNav.jsx
import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavItems } from "../../lib/NavItems";
import SvgIcon from "../SvgIcon/SvgIcon";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";

export default function MobileNav({ 
        isOpen,
        onClose,
        returnFocusRef,
        dialogId: dialogIdProp,
    }) {
    const location = useLocation();
    const NAV_ITEMS = useNavItems();
    useLockBodyScroll(isOpen);

    const items = NAV_ITEMS.filter((item) => item.showInNav);

    // 포커스 트랩을 위한 ref들
    const containerRef = useRef(null);
    const closeBtnRef = useRef(null);

    // ⬇️ dialogId: 외부에서 주면 사용, 없으면 생성해서 사용
    const dialogIdRef = useRef(
        dialogIdProp || `mobile-nav-${Math.random().toString(36).slice(2)}`
    );
    const labelIdRef = useRef(`${dialogIdRef.current}-label`);

    // 닫힐 때: 내부에 포커스가 남아있다면 밖으로 빼기 + opener로 되돌리기
    useEffect(() => {
        if (isOpen) return;

        const root = containerRef.current;
        if (!root) return;

        const active = document.activeElement;
        if (active && root.contains(active)) {
            // opener가 있으면 거기로, 없으면 body로
            const target = returnFocusRef?.current ?? document.body;
            // React 상태 업데이트 타이밍을 피해 살짝 지연
            setTimeout(() => {
                try {
                    target.focus?.();
                } catch {}
            }, 0);
        }
    }, [isOpen, returnFocusRef]);

    // 열림 시: 포커스 트랩 + Esc
    useEffect(() => {
        if (!isOpen) return;
        closeBtnRef.current?.focus();
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose?.();
                return;
            }
            if (e.key === "Tab") {
                const root = containerRef.current;
                if (!root) return;
                const focusables = root.querySelectorAll(
                    'a, button, [tabindex]:not([tabindex="-1"])'
                );
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault(); last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault(); first.focus();
                }
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    return (
        <nav
            id={dialogIdRef.current}
            ref={containerRef}
            role="dialog"
            aria-modal={isOpen || undefined}
            aria-labelledby={labelIdRef.current}
            inert={!isOpen || undefined}
            className={[
                "z-50",
                "fixed top-0 right-0",
                "transition-transform",
                "w-full h-full",
                isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none",
                "desktop:hidden",
                "bg-[var(--color-primary)]",
            ].join(" ")}
            tabIndex={isOpen ? 0 : -1}
        >
            
            {/* 스크린리더용 */}
            <h2
                id={labelIdRef.current}
                className="sr-only"
            >
                모바일 내비게이션
            </h2>

            <div className="p-[16px]">
                <button
                    ref={closeBtnRef}
                    type="button"
                    onClick={onClose}
                    aria-label="close"
                    className="absolute right-4"
                >
                    <SvgIcon
                        name="delete"
                        frameSize="md"
                        iconSize="xs"
                        fill
                    />
                </button>

                <ul
                    className={[
                        "flex flex-col",
                        "px-2 py-4",
                        "text-[var(--color-gray-8)]",
                    ].join(" ")}
                >
                    {items.map((item) => (
                        <li key={`${item.to}-${item.label}`} className="mb-2">
                            <Link
                                to={item.to}
                                className={location.pathname === item.to ? "underline" : ""}
                                onClick={onClose}
                                tabIndex={isOpen ? 0 : -1}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}
