import { Outlet, useNavigate } from 'react-router-dom';
import DarkModeToggle from './components/DarkModeToggle/DarkModeToggle';
import Header from './components/Header/Header';

export default function Layout() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen overflow-y-auto">
            <Header
                // showTitle
                // showLogo
                // showBack
                // buttonTitle="회원가입"
                onButtonTitleClick={() => navigate("/register")}
                fill
            />
            <DarkModeToggle />

            <main className="mt-28">
                <Outlet />
            </main>
        </div>
    );
}