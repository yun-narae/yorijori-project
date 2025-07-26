import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "@/contexts/AuthContext";
import getPbImageURL from '@/lib/getPbImageURL';
import SvgIcon from "../SvgIcon/SvgIcon";
import CustomButton from '../CustomButton/CustomButton';
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import { NAV_ITEMS } from "../../lib/NavItems";
import { SCREENS } from "../../constants/screens";

export default function Header({
    fill = false,
    Icon2Name = null,
    onShowIcon2,
    headerClass = "",
    buttonGroupClass = "",
    onButtonTitleClick,
}) {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;
    const { user } = useAuth();

    const matchedItem = NAV_ITEMS.find(item => item.to === pathname);
    const config = matchedItem?.header || {}; // header 조건
    const currentTitle = matchedItem?.label || ""; // 중앙 타이틀

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

    const imageUrl = user?.images
    ? getPbImageURL(user, 'images')
    : "https://placehold.co/150x150?text=No+Image";

    const screenConfig = config.byScreen?.[screenSize] || {};
    const mergedConfig = { ...config, ...screenConfig };

    const showLogo = mergedConfig.showLogo;
    const showBack = mergedConfig.showBack;
    const showNav = mergedConfig.showNav;
    const showHamburger = mergedConfig.showHamburger;
    const showTitle = mergedConfig.showTitle ?? true;
    const icon2Name = mergedConfig.Icon2Name ?? Icon2Name;
    const onShowIcon2Merged = mergedConfig.onShowIcon2 ?? onShowIcon2;
    const buttonTitle =
    mergedConfig.buttonTitle !== undefined ? mergedConfig.buttonTitle : buttonTitle;
    const showButtonTitle =
        typeof mergedConfig.showButtonTitle === "function"
            ? mergedConfig.showButtonTitle({ user })
            : mergedConfig.showButtonTitle;
    const showProfile =
    typeof mergedConfig.showProfile === "function"
        ? mergedConfig.showProfile({ user })
        : mergedConfig.showProfile;

    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

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

    return (
        <header
            className={[
                "fixed",
                "w-full",
                "flex items-center justify-center",
                "mx-auto",
                "p-[16px]",
                "h-[60px]",
                "tablet:p-[15px]",
                "bg-[var(--color-primary)]",
                "z-50",
                headerClass,
            ].join(" ")}
        >
            <div className={[
                    "w-full",
                    "mx-auto",
                    "relative",
                    "flex items-center justify-between",
                    "gap-5",
                    "max-w-[1060px]",
                    "tablet:max-w-[780px]",
                    "desktop:max-w-[1060px]",
                ].join(" ")}
            >
                <div className={[
                    "flex items-center justify-start",
                    "gap-5",
                ].join(" ")}
            >
                    <div className="flex items-center justify-between gap-3">
                        {showBack && (
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    aria-label="뒤로가기"
                                    className="flex items-center"
                                >
                                    <SvgIcon
                                        name="arrow-left"
                                        frameSize="md"
                                        iconSize="xs"
                                        fill={fill}
                                    />
                                </button>
                            </div>
                        )}
                        {showLogo && (
                            <h1 className="shrink-0 items-center">
                                <a href="/">
                                    <p className="flex items-center text-[var(--color-gray-8)]">
                                        임시로고
                                    </p>
                                </a>
                            </h1>
                        )}
                    </div>
                    {showNav && <DesktopNav />}
                </div>

                <MobileNav
                    isOpen={isMobileNavOpen}
                    onClose={() => setIsMobileNavOpen(false)}
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
                            <button
                                type="button"
                                onClick={onShowIcon2Merged}
                                aria-label={icon2Name}
                            >
                                <SvgIcon
                                    name={icon2Name}
                                    frameSize="md"
                                    iconSize="xs"
                                    fill={fill}
                                />
                            </button>
                        )}

                        {showHamburger && (
                            <button
                                type="button"
                                onClick={() => setIsMobileNavOpen(true)}
                                aria-label="menu"
                            >
                                <SvgIcon
                                    name="menu"
                                    frameSize="md"
                                    iconSize="xs"
                                    fill={fill}
                                />
                            </button>
                        )}
                    </li>

                    {showButtonTitle && (
                        <li className="flex items-center gap-2 order-1">
                            <CustomButton
                                text={buttonTitle}
                                size="sm"
                                variant="secondary"
                                onClick={onButtonTitleClick}
                            />
                        </li>
                    )}

                    {showProfile && user && (
                        <div className="flex items-center justify-center">
                            {user.images ? (
                                <img
                                    src={getPbImageURL(user, 'images')}
                                    alt="프로필"
                                    className="
                                        shrink-0
                                        w-[30px] h-[30px] 
                                        rounded-full object-cover
                                        border border-[var(--color-gray-2)]
                                        cursor-pointer
                                    "
                                    onClick={() => navigate("/myPage")}
                                />
                            ) : (
                                <div
                                    className="
                                        flex items-center justify-center
                                        w-[30px] h-[30px] 
                                        bg-[var(--color-gray-2)]
                                        border border-[var(--color-gray-2)]
                                        rounded-full cursor-pointer
                                    "
                                    onClick={() => navigate("/myPage")}
                                >
                                    <SvgIcon
                                        name="user-profile"
                                        frameClass="w-[18px] h-[18px]"
                                        iconClass="w-[18px] h-[18px] text-[#9e9e9e] -translate-y-[1px]"
                                    />
                                </div>
                            )}
                        </div>
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
};
