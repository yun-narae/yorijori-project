import { Outlet, useNavigate } from 'react-router-dom';
import DarkModeToggle from './components/DarkModeToggle/DarkModeToggle';
import Header from './components/Header/Header';

export default function Layout() {
    const navigate = useNavigate();

    return (
        <div className="overflow-y-auto">
            <Header
                onButtonTitleClick={() => navigate("/login")}
                fill
            />
            <DarkModeToggle />

            <main className="
                mt-28
            ">
                <Outlet />
            </main>
        </div>
    );
}