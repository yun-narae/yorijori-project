// src/components/PageTitleBar/PageTitleBar.jsx
import React from "react";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import SvgIcon from "../SvgIcon/SvgIcon";
import { useNavItems } from "../../lib/NavItems";
import Skel from "../Skeletons/Skel";

export default function PageTitleBar({
    className = "",
    showBackButton = true,
    loading = false,
    title,
    h2Only = false,
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const NAV_ITEMS = useNavItems();

    const matchedItem = React.useMemo(() => {
        const exact = NAV_ITEMS.find((item) => item.to === location.pathname);
        if (exact) return exact;

        return NAV_ITEMS.find((item) =>
            matchPath({ path: item.to, end: true }, location.pathname)
        );
    }, [NAV_ITEMS, location.pathname]);

    const currentLabel = title ?? matchedItem?.label ?? "";

    // h2Only prop이 true면 h2만 렌더링
    if (h2Only) {
        return (
            <h2 aria-label={currentLabel} className="sr-only">
                {currentLabel}
            </h2>
        );
    }

    return (
        <>
            <h2 aria-label={currentLabel} className="sr-only desktop:hidden">
                {currentLabel}
            </h2>
            <div
                className={`
                    hidden desktop:flex
                    w-full mx-auto items-center justify-center flex-col
                    mt-8 mb-7 desktop:max-w-[1060px]
                    px-3
                    ${className}
                `}
            >
                {/* ✅ 로딩 중에는 아무것도 렌더링하지 않음 */}
                {!loading && showBackButton && (
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="w-fit flex items-center gap-1 text-[var(--color-gray-6)] text-sm transition self-start mr-auto"
                    >
                        <SvgIcon
                            name="arrow-left"
                            iconClass="text-[var(--color-gray-6)]"
                            frameSize="sm"
                            iconSize="xs"
                            tabIndex={-1}
                        />
                        <span className="translate-y-[1px]">뒤로가기</span>
                    </button>
                )}
                {loading ? (
                    <div
                        role="status"
                        aria-label="페이지 제목 로딩중"
                        className="w-full flex justify-center mt-3"
                    >
                        <Skel className="h-6 w-1/3" />
                    </div>
                ) : (
                    <h2 className="desktop:text-pc-title-lg font-bold text-[var(--color-gray-8)] mt-3">
                        {currentLabel}
                    </h2>
                )}
            </div>
        </>
    );
}
