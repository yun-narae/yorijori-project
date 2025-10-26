import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, matchPath } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "@/contexts/AuthContext";
import SvgIcon from "../SvgIcon/SvgIcon";
import CustomButton from "../CustomButton/CustomButton";
import Navigation from "./Navigation";
import { useNavItems } from "../../lib/NavItems";
import { SCREENS } from "../../constants/screens";
import ProfileAvatar from "../User/ProfileAvatar";

export default function Header({
    fill = false,
    Icon2Name = null,
    onShowIcon2,
    headerClass = "",
    buttonGroupClass = "",
    onButtonTitleClick,
    buttons = [],
    buttonTitle = "",
}) {
    const NAV_ITEMS = useNavItems();
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;
    const { user } = useAuth();
    const menuBtnRef = useRef(null);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const mobileNavId = "mobile-nav-main"; // 원하는 고정 id

    const isMyPage =
    !!matchPath({ path: "/mypage/:userId", end: false }, location.pathname) ||
    !!matchPath({ path: "/mypage", end: true }, location.pathname);


    // ✅ 동적 경로 매칭 지원 (정확 매칭 → 패턴 매칭 순)
    const matchedItem =
        NAV_ITEMS.find(item => item.to === pathname) ??
        NAV_ITEMS.find(item => matchPath({ path: item.to, end: true }, pathname));

    // ✅ 타이틀 우선순위: pageTitle > label
    const config = matchedItem?.header || {};
    const currentTitle = matchedItem?.pageTitle ?? matchedItem?.label ?? "";

    const [screenSize, setScreenSize] = useState("desktop");

    useEffect(() => {
        const updateScreenSize = () => {
            const width = window.innerWidth / 16;
            if (width < SCREENS.tablet) {
                setScreenSize("mobile");
            } else if (width < SCREENS.desktop) {
                setScreenSize("tablet");
            } else {
                setScreenSize("desktop");
            }
        };

        window.addEventListener("resize", updateScreenSize);
        updateScreenSize();
        return () => window.removeEventListener("resize", updateScreenSize);
    }, []);

    const screenConfig = config.byScreen?.[screenSize] || {};
    const mergedConfig = { ...config, ...screenConfig };

    const showLogo = mergedConfig.showLogo;
    const showBack = mergedConfig.showBack;
    const showNav = mergedConfig.showNav;
    const showHamburger = mergedConfig.showHamburger;
    const showTitle = mergedConfig.showTitle ?? true;
    const icon2Name = mergedConfig.Icon2Name ?? Icon2Name;
    const onShowIcon2Merged = mergedConfig.onShowIcon2 ?? onShowIcon2;
    const mergedButtonTitle =
        mergedConfig.buttonTitle !== undefined ? mergedConfig.buttonTitle : buttonTitle;

    const showButtonTitle =
        typeof mergedConfig.showButtonTitle === "function"
            ? mergedConfig.showButtonTitle({ user })
            : mergedConfig.showButtonTitle;

    // showProfile 최종값: 함수/불리언을 지원, 미정의면 로그인 시 표시
    const showProfile =
      typeof mergedConfig.showProfile === "function"
        ? !!mergedConfig.showProfile({ user })
        : typeof mergedConfig.showProfile === "boolean"
          ? mergedConfig.showProfile
          : !!user;


    useEffect(() => {
        const mediaQuery = window.matchMedia(`(min-width: ${SCREENS.desktop}rem)`);
        const handleResize = () => {
            if (mediaQuery.matches) {
                setIsMobileNavOpen(false);
            }
        };
        mediaQuery.addEventListener("change", handleResize);
        return () => mediaQuery.removeEventListener("change", handleResize);
    }, []);

    const bgClass = isMyPage
        ? "bg-[var(--color-gray-2)]"
        : "bg-[var(--color-primary)]";

    return (
        <header
            className={[
                "desktop:fixed desktop:top-0 desktop:left-0 desktop:right-0",
                "border-b border-[var(--color-gray-2)]",
                "w-full",
                "flex items-center justify-center",
                "mx-auto",
                "h-[60px]",
                "z-50",
                bgClass,
                headerClass,
            ].join(" ")}
        >
            <div
                className={[
                    "w-full",
                    "mx-auto",
                    "relative",
                    "flex items-center justify-between",
                    "gap-5",
                    "max-w-[1060px]",
                    "desktop:max-w-[1060px]",
                    "px-3",
                ].join(" ")}
            >
                <div
                    className={[
                        "flex items-center justify-start",
                        "gap-5",
                    ].join(" ")}
                >
                    <div className="flex items-center justify-between gap-3">
                        {showBack && (
                            <SvgIcon
                                type="button"
                                name="arrow-left"
                                frameSize="md"
                                iconSize="xs"
                                fill={fill}
                                onClick={() => navigate(-1)}
                                aria-label="뒤로가기"
                            />
                        )}
                        
                        {/* h2는 항상 렌더링하되, showLogo에 따라 내용만 변경 */}
                        <h2 className="flex items-center w-fit">
                            {showLogo ? (
                                <a 
                                    href="/" 
                                    className="flex items-center focus:outline-none focus:ring-2 focus:ring-[var(--color-gray-3)] focus:ring-offset-2 rounded"
                                    aria-label="요리조리 홈으로 이동"
                                >
                                    <svg className="w-8 h-4 text-[var(--color-gray-8)]" aria-hidden="true">
                                        <use href="/logo.svg" />
                                    </svg>
                                </a>
                            ) : (
                                <span className="sr-only">요리조리</span>
                            )}
                        </h2>
                    </div>

                    {showNav && <Navigation variant="desktop" />}
                </div>

                <Navigation
                    variant="mobile"
                    isOpen={isMobileNavOpen}
                    onClose={() => setIsMobileNavOpen(false)}
                    returnFocusRef={menuBtnRef}
                    dialogId={mobileNavId}
                />

                {showTitle && currentTitle && (
                    <div>
                        <p className="absolute left-1/2 top-1/2 w-auto translate-x-[-50%] translate-y-[-50%] text-base font-bold text-[var(--color-gray-8)]">
                            {currentTitle}
                        </p>
                    </div>
                )}

                <ul
                    className={[
                        "flex",
                        "items-center",
                        "gap-2",
                        buttonGroupClass,
                    ].join(" ")}
                >
                    <li className="flex items-center gap-1 order-2">
                        {icon2Name && (
                            <SvgIcon
                                type="button"
                                name={icon2Name}
                                frameSize="md"
                                iconSize="xs"
                                fill={fill}
                                onClick={onShowIcon2Merged}
                                aria-label={icon2Name}
                            />
                        )}

                        {showHamburger && (
                            <SvgIcon
                                type="button"
                                name="menu"
                                frameSize="md"
                                iconSize="xs"
                                fill={fill}
                                ref={menuBtnRef}
                                onClick={() => setIsMobileNavOpen(true)}
                                aria-label="모바일 메뉴 열기"
                                aria-haspopup="dialog"
                                aria-expanded={isMobileNavOpen}
                                aria-controls={mobileNavId}
                            />
                        )}
                    </li>

                    {buttons.length > 0 ? (
                        buttons.map((btn, idx) => (
                            <li key={idx}>
                                <CustomButton
                                    text={btn.text}
                                    size={btn.size || "sm"}
                                    variant={btn.variant || "secondary"}
                                    onClick={btn.onClick}
                                    basebuttonClass={btn.basebuttonClass}
                                    custombuttonClass={btn.custombuttonClass}
                                    state={btn.state}
                                />
                            </li>
                        ))
                    ) : (
                        showButtonTitle && (
                            <li>
                                <CustomButton
                                    text={mergedButtonTitle}
                                    size="sm"
                                    variant="secondary"
                                    onClick={onButtonTitleClick}
                                />
                            </li>
                        )
                    )}

                    {showProfile && (
                        <ProfileAvatar
                            user={user}
                            currentUserId={user?.id}
                            size="md"
                            linkBehavior="self"
                            path={location.pathname}
                            headerName
                        />
                    )}
                </ul>
            </div>
        </header>
    );
}

Header.propTypes = {
    Icon2Name: PropTypes.string,
    onShowIcon2: PropTypes.func,
    headerClass: PropTypes.string,
    buttonGroupClass: PropTypes.string,
    onButtonTitleClick: PropTypes.func,
    fill: PropTypes.bool,
    buttonTitle: PropTypes.string,
};
