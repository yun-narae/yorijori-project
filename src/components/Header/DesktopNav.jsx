import React from "react";
import { Link, useLocation, matchPath } from "react-router-dom";
import { useNavItems } from "../../lib/NavItems";

export default function DesktopNav({ navClass = "" }) {
    const location = useLocation();
    const NAV_ITEMS = useNavItems();

    const isActive = (to) =>
        location.pathname === to ||
        !!matchPath({ path: to, end: true }, location.pathname);

    return (
        <nav className={`hidden desktop:block ${navClass}`}>
            <ul className="flex text-[var(--color-gray-8)] gap-3">
                {NAV_ITEMS
                    .filter((item) => item.showInNav !== false)
                    .map((item) => (
                        <li key={item.to}>
                            <Link
                                to={item.to}
                                className={isActive(item.to) ? "underline" : ""}
                            >
                                {item.navLabel ?? item.label}
                            </Link>
                        </li>
                    ))}
            </ul>
        </nav>
    );
}