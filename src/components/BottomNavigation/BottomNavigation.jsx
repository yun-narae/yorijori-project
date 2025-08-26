import React from "react";
import { useLocation, matchPath, useNavigate } from "react-router-dom";
import SvgIcon from "../SvgIcon/SvgIcon";

const BottomNavigation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;

    const isMyPage =
        !!matchPath({ path: "/mypage/:userId", end: false }, pathname) ||
        !!matchPath({ path: "/mypage", end: true }, pathname);

    const STATE_CLASSES = {
        onpage: "text-[var(--color-gray-8)]",
        offpage:
            "text-[var(--color-gray-3)] hover:text-[var(--color-gray-8)] transition cursor-pointer",
    };

    // 현재 경로와 비교해 on/off 상태 결정
    const getIconClass = (to) => {
        const isActive =
            pathname === to ||
            !!matchPath({ path: to, end: true }, pathname);
        return isActive ? STATE_CLASSES.onpage : STATE_CLASSES.offpage;
    };

    return (
        <div
            className={[
                "desktop:hidden",
                "fixed bottom-0 left-0 right-0",
                "w-full flex items-center justify-center",
                "mx-auto p-[16px] h-[60px] tablet:p-[16px] z-50",
                isMyPage
                    ? "bg-[var(--color-gray-2)] border-t border-[var(--color-gray-3)]"
                    : "bg-[var(--color-primary)] border-t border-[var(--color-gray-2)]",
            ].join(" ")}
        >
            <div
                className={[
                    "w-full p-[16px] max-w-[500px]",
                    "flex items-center justify-between mx-auto",
                ].join(" ")}
            >
                <SvgIcon
                    name="home"
                    onClick={() => navigate("/")}
                    iconClass={getIconClass("/")}
                />
                <SvgIcon
                    name="heart-1"
                    onClick={() => navigate("/post/likes")}
                    iconClass={getIconClass("/post/likes")}
                />
                <SvgIcon
                    name="forkKnife"
                    onClick={() =>
                        navigate("/post/create")
                    }
                    iconClass={getIconClass("/post/create")}
                />
                <SvgIcon
                    name="user"
                    onClick={() =>
                        navigate(isMyPage ? pathname : "/mypage")
                    }
                    iconClass={
                        isMyPage
                            ? STATE_CLASSES.onpage
                            : STATE_CLASSES.offpage
                    }
                />
            </div>
        </div>
    );
};

export default BottomNavigation;
