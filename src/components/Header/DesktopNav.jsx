import { Link, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../../lib/NavItems";

export default function DesktopNav({ navClass = "" }) {
    const location = useLocation();
    return (
        <nav className={`w-full hidden desktop:block ${navClass}`}>
            <ul className="flex text-[var(--color-gray-8)] gap-3">
            {NAV_ITEMS
                .filter(item => item.to !== "/register")
                .map(item => (
                    <li key={item.to}>
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
