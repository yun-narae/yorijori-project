import React from "react";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import { useNavItems } from "../../lib/NavItems";
import SvgIcon from "../SvgIcon/SvgIcon";

export default function PageTitleBar({
    className = "",
    showBackButton = true,
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const NAV_ITEMS = useNavItems();

    // 1) 완전 일치 우선
    // 2) 없으면 동적 경로 패턴으로 매칭
    const matchedItem = React.useMemo(() => {
        const exact = NAV_ITEMS.find((item) => item.to === location.pathname);
        if (exact) return exact;

        return NAV_ITEMS.find((item) =>
            matchPath({ path: item.to, end: true }, location.pathname)
        );
    }, [NAV_ITEMS, location.pathname]);

    const currentLabel = matchedItem?.label ?? "";

    return (
        <div
            className={`
                hidden desktop:flex
                w-full mx-auto items-center justify-center flex-col
                mt-8 mb-7 desktop:max-w-[1060px]
                ${className}
            `}
        >
            {showBackButton && (
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="w-full mx-auto flex items-center gap-1 text-[var(--color-gray-6)] text-sm transition"
                >
                    <SvgIcon
                        name="arrow-left"
                        iconClass="text-[var(--color-gray-6)]"
                        frameSize="sm"
                        iconSize="xs"
                    />
                    <span className="translate-y-[1px]">뒤로가기</span>
                </button>
            )}

            <h2 className="desktop:text-pc-title-lg font-bold text-[var(--color-gray-8)]">
                {currentLabel}
            </h2>
        </div>
    );
}
