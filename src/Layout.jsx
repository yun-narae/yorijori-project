import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation, matchPath } from "react-router-dom";
import Header from "./components/Header/Header";
import BottomNavigation from "./components/BottomNavigation/BottomNavigation";
import { useAuth } from "./contexts/AuthContext";

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const hideHeader = location.pathname === "/post/create";
    const hideBottomNav = location.pathname === "/post/create";

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
