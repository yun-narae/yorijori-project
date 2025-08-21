import React from "react";
import { Link, useLocation, matchPath } from "react-router-dom";
import { useNavItems } from "../../lib/NavItems";
import SvgIcon from "../SvgIcon/SvgIcon";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";

export default function MobileNav({
    isOpen,
    onClose,
}) {
    const location = useLocation();
    const NAV_ITEMS = useNavItems();
    useLockBodyScroll(isOpen);

    const isActive = (to) =>
        location.pathname === to ||
        !!matchPath({ path: to, end: true }, location.pathname);

    return (
        <nav
            className={[
                "z-50",
                "fixed top-0 right-0",
                "transition-transform",
                "w-full h-full",
                isOpen ? "translate-x-0" : "translate-x-full",
                "desktop:hidden",
                "bg-[var(--color-primary)]",
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

                <ul
                    className={[
                        "flex flex-col",
                        "px-2 py-4",
                        "text-[var(--color-gray-8)]",
                    ].join(" ")}
                >
                    {NAV_ITEMS
                        .filter((item) => item.showInNav !== false)
                        .map((item) => (
                            <li key={item.to} className="mb-2">
                                <Link
                                    to={item.to}
                                    className={isActive(item.to) ? "underline" : ""}
                                    onClick={onClose}
                                >
                                    {item.navLabel ?? item.label}
                                </Link>
                            </li>
                        ))}
                </ul>
            </div>
        </nav>
    );
}