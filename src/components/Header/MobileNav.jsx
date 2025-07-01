import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../../lib/NavItems";
import SvgIcon from "../SvgIcon/SvgIcon";

export default function MobileNav({
    isOpen,
    onClose,
}) {
    const location = useLocation();

    // ✅ 배경 스크롤 잠금 처리
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        // 언마운트 안전 처리
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <nav
            className={[
                "z-50",
                "fixed top-0 right-0",
                "transition-transform",
                "w-full h-full",
                isOpen ? "translate-x-0" : "translate-x-full",
                "desktop:hidden",
                "bg-[var(--color-gray-1)]"
            ].join(" ")}
        >
            <div className="p-[16px]">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="delete"
                    className="absolute right-4"
                >
                    <SvgIcon
                        name="delete"
                        frameSize="md"
                        iconSize="xs"
                        fill
                    />
                </button>
                <ul className={[
                        "flex flex-col",
                        "px-2 py-4",
                        "text-[var(--color-gray-8)]",
                    ].join(" ")}
                >
                    {NAV_ITEMS.map((item) => (
                        <li key={item.to} className="mb-2">
                            <Link
                                to={item.to}
                                className={location.pathname === item.to ? "underline" : ""}
                                onClick={onClose}
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
