import React from "react";
import { useLocation, matchPath, useNavigate } from "react-router-dom";
import SvgIcon from "../SvgIcon/SvgIcon";
import { useNavItems } from "../../lib/NavItems";
import { useAuth } from "../../contexts/AuthContext";

const BottomNavigation = () => {
    const NAV_ITEMS = useNavItems();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth(); // ✅ 로그인 상태 확인
    const pathname = location.pathname;

    const isMyPage =
        !!matchPath({ path: "/mypage/:userId", end: false }, pathname) ||
        !!matchPath({ path: "/mypage", end: true }, pathname);

    const STATE_CLASSES = {
        onpage: "text-[var(--color-gray-8)]",
        offpage:
            "text-[var(--color-gray-3)] hover:text-[var(--color-gray-8)] transition cursor-pointer",
    };

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
                {/* 홈 아이콘 (항상 접근 가능) */}
                <SvgIcon
                    name="home"
                    onClick={() => navigate("/")}
                    iconClass={getIconClass("/")}
                />

                {/* 좋아요 (로그인 필요) */}
                <SvgIcon
                    name="heart-1"
                    onClick={() =>
                        user ? navigate("/post/likes") : navigate("/login")
                    }
                    iconClass={getIconClass("/post/likes")}
                />

                {/* 글 작성 (로그인 필요) */}
                <SvgIcon
                    name="forkKnife"
                    onClick={() =>
                        user ? navigate("/post/create") : navigate("/login")
                    }
                    iconClass={getIconClass("/post/create")}
                />

                {/* 마이페이지 (로그인 필요) */}
                <SvgIcon
                    name="user"
                    onClick={() =>
                        user
                            ? navigate(isMyPage ? pathname : `/mypage/${user.id}`)
                            : navigate("/login")
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
