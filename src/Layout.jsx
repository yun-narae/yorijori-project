import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation, matchPath } from "react-router-dom";
import Header from "./components/Header/Header";
import BottomNavigation from "./components/BottomNavigation/BottomNavigation";

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const hideHeader = location.pathname === "/post/create";

    // BottomNavigation 숨김 경로 확장
    const hideBottomNav =
        // 정적 경로
        ["/post/create", "/login", "/login/find-password", "/register", "/register/success"]
            .some((p) => !!matchPath({ path: p, end: true }, location.pathname)) ||
        // 동적 경로
        !!matchPath({ path: "/post/detail/:postId", end: false }, location.pathname) ||
        !!matchPath({ path: "/post/edit/:postId", end: false }, location.pathname) ||
        !!matchPath({ path: "/post/mypost/:userId", end: false }, location.pathname);

    useEffect(() => {
        const isMyPage =
            !!matchPath({ path: "/mypage/:userId", end: false }, location.pathname) ||
            !!matchPath({ path: "/mypage", end: true }, location.pathname);

        document.body.classList.toggle("mypage", isMyPage);
    }, [location.pathname]);

    return (
        <div>
            {!hideHeader && (
                <Header
                    fill
                    path={location.pathname}
                    onButtonTitleClick={() => navigate("/login")}
                />
            )}

            <main>
                <Outlet />
            </main>

            {!hideBottomNav && <BottomNavigation />}
        </div>
    );
}
