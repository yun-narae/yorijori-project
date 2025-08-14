import React, { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import DarkModeToggle from "./components/DarkModeToggle/DarkModeToggle";
import Header from "./components/Header/Header";

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    const hideHeader = location.pathname === "/post/create";

    useEffect(() => {
        if (location.pathname.startsWith("/myPage")) {
            document.body.classList.add("mypage");
        } else {
            document.body.classList.remove("mypage");
        }
    }, [location.pathname]);

    return (
        <div>
            {!hideHeader && (
                <Header
                    fill
                    path={location.pathname} // 현재 경로 전달
                    onButtonTitleClick={() => navigate("/login")}
                />
            )}
            <DarkModeToggle />
            <main>
                <Outlet />
            </main>
        </div>
    );
}
