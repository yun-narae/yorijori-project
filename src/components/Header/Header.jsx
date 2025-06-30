import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import SvgIcon from "../SvgIcon/SvgIcon";
import CustomButton from '../CustomButton/CustomButton';

const Header = ({
    showTitle = false,
    showLogo = false,
    showMenu = false,
    showBack = false,
    buttonTitle = "",
    Icon1Name = "",
    onShowIcon1,
    Icon2Name = "",
    onShowIcon2,
    headerClass = "",
    navClass = "",
    buttonGroupClass = "",
    onButtonTitleClick,
    fill,
}) => {
    const location = useLocation();
    const pathname = location.pathname;
    const navigate = useNavigate();
    const isHome = location.pathname === '/';
    const isTest = location.pathname === '/test';
    // ✅ 페이지 경로에 따른 타이틀 자동 설정
    let currentTitle = "";
    if (pathname === "/") {
        currentTitle = "";
    } else if (pathname === "/test") {
        currentTitle = "테스트";
    } else {
        currentTitle = "Page";
    }

    return (
        <header
            className={[
                "relative", // title absolute
                "w-full",
                "mx-auto",
                "gap-5",
                "flex items-center justify-between",
                "items-center",
                "max-w-[1060px]",
                "p-[16px]",
                "tablet:p-[15px]",
                "tablet:max-w-[780px]",
                "desktop:p-[16px]",
                "desktop:max-w-[1060px]",
                headerClass,
            ].join(" ")}
        >
            <div className="flex items-center gap-3">
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

            {/* 메뉴 */}
            {showMenu && (
                <nav className=
                    {[
                        "w-full",
                        "hidden",         // 기본은 숨김
                        "desktop:block",  // desktop 이상에서는 block
                        navClass
                    ].join(" ")}
                >
                        <ul className=
                            {[
                                "flex",
                                "text-[var(--color-gray-8)]",
                                "gap-3",
                            ].join(" ")}
                            >
                            <li>
                                <Link to="/" className={isHome ? 'underline' : ''}>
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/test" className={isTest ? 'underline' : ''}>
                                    Test-Pages
                                </Link>
                            </li>
                        </ul>
                </nav>
            )}

            {/* 타이틀 */}
            {showTitle && currentTitle && (
                <div>
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
                    {Icon1Name && (
                        <button
                            type="button"
                            onClick={onShowIcon1}
                            aria-label={Icon1Name}
                        >
                            <SvgIcon
                                name={Icon1Name}
                                frameSize="md"
                                iconSize="xs"
                                fill={fill}
                            />
                        </button>
                    )}
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
    showMenu: PropTypes.bool,
    showBack: PropTypes.bool,
    buttonTitle: PropTypes.string,
    Icon1Name: PropTypes.string,
    onShowIcon1: PropTypes.func,
    Icon2Name: PropTypes.string,
    onShowIcon2: PropTypes.func,
    headerClass: PropTypes.string,
    navClass: PropTypes.string,
    buttonGroupClass: PropTypes.string,
    onButtonTitleClick: PropTypes.func,
    fill: PropTypes.bool,
};

export default Header;