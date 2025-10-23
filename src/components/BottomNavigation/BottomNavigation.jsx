// src/components/BottomNavigation/BottomNavigation.jsx
import React from "react";
import { Link, useLocation, matchPath } from "react-router-dom";
import SvgIcon from "../SvgIcon/SvgIcon";
import { useAuth } from "../../contexts/AuthContext";

export default function BottomNavigation() {
    const location = useLocation();
    const { user } = useAuth();
    const pathname = location.pathname;

    // ✅ /mypage/:userId 인 경우: 내 페이지면 보이고, 다른 유저면 숨김
    const mypageMatch = matchPath({ path: "/mypage/:userId", end: true }, pathname);
    const isMyPageParam = !!mypageMatch;
    const isOwnMyPage = isMyPageParam && user && mypageMatch.params?.userId === user.id;
    if (isMyPageParam && !isOwnMyPage) return null;

    // (스타일 분기) /mypage 루트 또는 내 마이페이지일 때
    const isMyPageRoot =
        !!matchPath({ path: "/mypage", end: true }, pathname) || isOwnMyPage;

    const STATE_CLASSES = {
        onpage: "text-[var(--color-gray-8)]",
        offpage:
            "text-[var(--color-gray-3)] hover:text-[var(--color-gray-8)] transition cursor-pointer",
    };

    const getIconClass = (to) => {
        const isActive =
            pathname === to || !!matchPath({ path: to, end: true }, pathname);
        return isActive ? STATE_CLASSES.onpage : STATE_CLASSES.offpage;
    };

    // 링크 목적지 계산 (비로그인 시 /login)
    const paths = {
        home: "/",
        // 찜 목록은 로그인 시 자신의 userId로 이동
        likes: user ? `/post/likes/${user.id}` : "/login",
        create: user ? "/post/create" : "/login",
        mypage: user ? `/mypage/${user.id}` : "/login",
    };

    return (
        <div
            className={[
                "desktop:hidden",
                "fixed bottom-0 left-0 right-0 w-full flex items-center justify-center",
                "mx-auto p-[16px] h-[60px] tablet:p-[16px] z-20",
                isMyPageRoot
                    ? "bg-[var(--color-gray-2)] border-t border-[var(--color-gray-3)]"
                    : "bg-[var(--color-primary)] border-t border-[var(--color-gray-2)]",
            ].join(" ")}
        >
            <div className="w-full p-[16px] max-w-[500px] flex items-center justify-between mx-auto">
                <Link to={paths.home} title="홈">
                    <SvgIcon name="home" iconClass={getIconClass(paths.home)} tabIndex={-1} />
                </Link>

                {/* ✅ 아이콘 활성화 매칭은 패턴(/post/likes/:userId)으로 체크 */}
                <Link to={paths.likes} title={user ? "찜한 모임" : "로그인이 필요합니다"}>
                    <SvgIcon name="heart-1" iconClass={getIconClass("/post/likes/:userId")} tabIndex={-1} />
                </Link>

                <Link to={paths.create} title={user ? "모임 만들기" : "로그인이 필요합니다"}>
                    <SvgIcon name="forkKnife" iconClass={getIconClass("/post/create")} tabIndex={-1} />
                </Link>

                <Link to={paths.mypage} title={user ? "마이페이지" : "로그인이 필요합니다"}>
                    <SvgIcon
                        name="user"
                        iconClass={isMyPageRoot ? STATE_CLASSES.onpage : STATE_CLASSES.offpage}
                        tabIndex={-1}
                    />
                </Link>
            </div>
        </div>
    );
}
