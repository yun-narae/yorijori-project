import { Outlet, useNavigate } from 'react-router-dom';
import DarkModeToggle from './components/DarkModeToggle/DarkModeToggle';
import Header from './components/Header/Header';

export default function Layout() {
    const navigate = useNavigate();

    return (
        <div>
            <Header
                showTitle
                showLogo
                showBack
                buttonTitle = "회원가입"
                // Icon2Name = "delete"
                onShowIcon2={() => console.log("메뉴")}
                onButtonTitleClick={() => navigate("/register")}
                headerClass=""
                fill
            />
            <DarkModeToggle />

            <Outlet />
        </div>
    );
}