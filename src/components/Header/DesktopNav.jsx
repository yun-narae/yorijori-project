import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavItems } from "../../lib/NavItems";

export default function DesktopNav({ navClass = "" }) {
    const location = useLocation();
    const NAV_ITEMS = useNavItems();

    const items = NAV_ITEMS.filter((item) => item.showInNav);

    return (
        <nav className={`hidden desktop:block ${navClass}`}>
            <ul className="flex text-[var(--color-gray-8)] gap-3">
                {items.map((item) => (
                    <li key={`${item.to}-${item.label}`}>
                        <Link
                            to={item.to}
                            className={location.pathname === item.to ? "underline" : ""}
                        >
                            {item.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
