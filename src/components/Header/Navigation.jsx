import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import useNavigationData from "../../hooks/useNavigationData";
import SvgIcon from "../SvgIcon/SvgIcon";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";

export default function Navigation({ 
    variant = "desktop", // "desktop" | "mobile"
    isOpen,
    onClose,
    returnFocusRef,
    dialogId: dialogIdProp,
    navClass = ""
}) {
    const { navItems, currentPath } = useNavigationData();
    
    // 모바일 전용 훅들
    useLockBodyScroll(variant === "mobile" && isOpen);

    // 포커스 트랩을 위한 ref들 (모바일 전용)
    const containerRef = useRef(null);
    const closeBtnRef = useRef(null);

    // dialogId: 외부에서 주면 사용, 없으면 생성해서 사용 (모바일 전용)
    const dialogIdRef = useRef(
        dialogIdProp || `mobile-nav-${Math.random().toString(36).slice(2)}`
    );
    const labelIdRef = useRef(`${dialogIdRef.current}-label`);

    // 모바일 전용: 닫힐 때 포커스 관리
    useEffect(() => {
        if (variant !== "mobile" || isOpen) return;

        const root = containerRef.current;
        if (!root) return;

        const active = document.activeElement;
        if (active && root.contains(active)) {
            const target = returnFocusRef?.current ?? document.body;
            setTimeout(() => {
                try {
                    target.focus?.();
                } catch {}
            }, 0);
        }
    }, [variant, isOpen, returnFocusRef]);

    // 모바일 전용: 열림 시 포커스 트랩 + Esc
    useEffect(() => {
        if (variant !== "mobile" || !isOpen) return;
        
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
    }, [variant, isOpen, onClose]);

    // 데스크톱 네비게이션 렌더링
    if (variant === "desktop") {
        return (
            <nav className={`hidden desktop:block ${navClass}`}>
                <ul className="flex text-[var(--color-gray-8)] gap-3">
                    {navItems.map((item) => (
                        <li 
                            key={`${item.to}-${item.label}`}
                            className="font-medium desktop:text-pc-title hover:text-[var(--color-gray-6)]"
                        >
                            <Link
                                to={item.to}
                                className={currentPath === item.to ? "underline" : ""}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        );
    }

    // 모바일 네비게이션 렌더링
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
                        "flex flex-col gap-3",
                        "px-2 py-4",
                        "text-[var(--color-gray-8)]",
                    ].join(" ")}
                >
                    {navItems.map((item) => (
                        <li key={`${item.to}-${item.label}`} className="font-medium text-mo-title tablet:text-tab-title hover:text-[var(--color-gray-6)]">
                            <Link
                                to={item.to}
                                className={currentPath === item.to ? "underline" : ""}
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
