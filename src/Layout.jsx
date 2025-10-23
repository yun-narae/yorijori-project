// src/Layout.jsx
import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation, matchPath } from "react-router-dom";
import Header from "./components/Header/Header";
import BottomNavigation from "./components/BottomNavigation/BottomNavigation";
import useScrollToTop from "./hooks/useScrollToTop";
import { useAuth } from "./contexts/AuthContext";

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    const { user: authUser } = useAuth();
    const meId = authUser?.id ?? null;

    // 스크롤 상단 고정
    useScrollToTop();

    // 헤더 숨김
    const hideHeader =
        !!matchPath({ path: "/post/create", end: true }, pathname) ||
        !!matchPath({ path: "/post/edit/:postId", end: false }, pathname);
        
    const matchLikes = matchPath({ path: "/post/likes/:userId", end: false }, pathname);


    // 하단 네비게이션 숨김 경로
    const hideBottomNav =
        // 정적 경로
        ["/post/create", "/login", "/login/find-password", "/register", "/register/success"]
            .some((p) => !!matchPath({ path: p, end: true }, pathname)) ||
        // 동적 경로 (상세/수정/내 글 목록)
        !!matchPath({ path: "/post/detail/:postId", end: false }, pathname) ||
        !!matchPath({ path: "/post/edit/:postId", end: false }, pathname) ||
        !!matchPath({ path: "/post/mypost/:userId", end: false }, pathname) ||
        !!matchPath({ path: "/post/mypost/:userId", end: false }, pathname) ||
        // 찜한 모임: 다른 사람일 때만 숨김(비로그인 포함)
        (!!matchLikes && (meId === null || matchLikes.params?.userId !== meId));

    // 마이페이지 진입 시 body 클래스 토글
    useEffect(() => {
        const isMyPage =
            !!matchPath({ path: "/mypage/:userId", end: false }, pathname) ||
            !!matchPath({ path: "/mypage", end: true }, pathname);

        document.body.classList.toggle("mypage", isMyPage);
    }, [pathname]);

    return (
        <div>
            {!hideHeader && (
                <Header
                    fill
                    path={pathname}
                    onButtonTitleClick={() => navigate("/login")}
                    buttonTitle="로그인"
                />
            )}

            <main>
                <Outlet />
            </main>

            {!hideBottomNav && <BottomNavigation />}
        </div>
    );
}
