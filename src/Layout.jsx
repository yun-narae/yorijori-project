import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import DarkModeToggle from './components/DarkModeToggle/DarkModeToggle';
import Header from './components/Header/Header';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    const hideHeader = location.pathname === "/post/create";

    return (
        <div>
            {!hideHeader && (
                <Header
                    fill
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
