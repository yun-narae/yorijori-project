import { Link, Outlet, useLocation } from 'react-router-dom';
import DarkModeToggle from './components/DarkModeToggle/DarkModeToggle';

export default function Layout() {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const isTest = location.pathname === '/test';

    return (
        <div>
            <nav className="flex gap-4 p-4 text-mo-title-lg bg-[var(--color-gray-2)] text-[var(--color-gray-8)]">
                <Link to="/" className={isHome ? 'underline' : ''}>
                    Home
                </Link>
                <Link to="/test" className={isTest ? 'underline' : ''}>
                    Test-Pages
                </Link>
            </nav>
            <DarkModeToggle />

            <Outlet />
        </div>
    );
}