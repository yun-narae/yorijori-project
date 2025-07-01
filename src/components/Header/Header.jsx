import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import SvgIcon from "../SvgIcon/SvgIcon";
import CustomButton from '../CustomButton/CustomButton';
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import { NAV_ITEMS } from "../../lib/NavItems";

const Header = ({
    showTitle = false,
    showLogo = false,
    showBack = false,
    buttonTitle = "",
    Icon2Name = "",
    onShowIcon2,
    headerClass = "",
    buttonGroupClass = "",
    onButtonTitleClick,
    fill,
}) => {
    const location = useLocation();
    const pathname = location.pathname;
    const navigate = useNavigate();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    // ✅ NAV_ITEMS에서 현재 경로에 맞는 label 가져오기
    const matchedItem = NAV_ITEMS.find((item) => item.to === pathname);
    const currentTitle = matchedItem ? matchedItem.label : "Page";

    return (
        <header
            className={[
                "w-full",
                "relative", // title absolute
                "mx-auto",
                "gap-5",
                "flex items-center justify-between",
                "max-w-[1060px]",
                "p-[16px]",
                "tablet:p-[15px]",
                "tablet:max-w-[780px]",
                "desktop:p-[16px]",
                "desktop:max-w-[1060px]",
                "desktop:fixed desktop:top-0 desktop:left-0 desktop:right-0",
                headerClass,
            ].join(" ")}
        >
            <div className={[
                    "flex items-center",
                    "gap-3",
                ].join(" ")}
            >
                {/* 로고 */}
                {showLogo && (
                    <h1 className=
                        {[
                            "shrink-0",
                            "items-center",
                        ].join(" ")}
                    >
                        <a href="/">
                            <p className="flex items-center text-[var(--color-gray-8)]">
                                임시로고
                            </p>
                        </a>
                    </h1>
                )}

                {/* 왼쪽: 뒤로가기 버튼 */}
                {showBack && (
                    <div className=
                        {[
                            "flex",
                            "items-center",
                            "desktop:hidden",  // desktop 이상에서는 hidden
                        ].join(" ")}
                    >
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
            </div>

            {/* PC 메뉴 */}
            <DesktopNav />

            {/* 모바일 메뉴 */}
            <MobileNav
            isOpen={isMobileNavOpen}
            onClose={() => setIsMobileNavOpen(false)}
            />

            {/* 타이틀 */}
            {showTitle && currentTitle && (
                <div className="desktop:hidden">
                    <p className="absolute left-1/2 top-1/2 w-auto translate-x-[-50%] translate-y-[-50%] text-base font-bold text-[var(--color-gray-8)]">
                        {currentTitle}
                    </p>
                </div>
            )}

            {/* 오른쪽: 아이콘 버튼 및 텍스트버튼 */}
            <ul className=
                {[
                    "flex",
                    "items-center",
                    "gap-2",
                    buttonGroupClass,
                ].join(" ")}
            >
                <li className=
                    {[
                        "flex",
                        "items-center",
                        "gap-1",
                        "order-2"
                    ].join(" ")}
                >
                    {/* 햄버거 버튼 */}
                    <button
                        type="button"
                        onClick={() => setIsMobileNavOpen(true)}
                        aria-label="menu"
                        className="desktop:hidden"
                    >
                        <SvgIcon
                            name="menu"
                            frameSize="md"
                            iconSize="xs"
                            fill={fill}
                        />
                    </button>
                    {Icon2Name && (
                        <button
                            type="button"
                            onClick={onShowIcon2}
                            aria-label={Icon2Name}
                        >
                            <SvgIcon
                                name={Icon2Name}
                                frameSize="md"
                                iconSize="xs"
                                fill={fill}
                            />
                        </button>
                    )}
                </li>
                {buttonTitle && (
                    <li className={[
                            "flex",
                            "items-center",
                            "gap-2",
                            "order-1"
                        ].join(" ")}
                    >
                        <CustomButton
                            text = {buttonTitle}
                            size = "sm"
                            variant = "secondary"
                            onClick={onButtonTitleClick}
                        />
                    </li>
                )}
            </ul>
        </header>
    );
};

Header.propTypes = {
    showTitle: PropTypes.bool,
    showLogo: PropTypes.bool,
    showBack: PropTypes.bool,
    buttonTitle: PropTypes.string,
    Icon2Name: PropTypes.string,
    onShowIcon2: PropTypes.func,
    headerClass: PropTypes.string,
    buttonGroupClass: PropTypes.string,
    onButtonTitleClick: PropTypes.func,
    fill: PropTypes.bool,
};

export default Header;