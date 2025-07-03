import { Outlet } from 'react-router-dom';
import DarkModeToggle from './components/DarkModeToggle/DarkModeToggle';
import Header from './components/Header/Header';

export default function Layout() {
    return (
        <div>
            <Header
                showTitle
                showLogo
                showBack
                buttonTitle = "회원가입"
                // Icon2Name = "delete"
                onShowIcon2={() => console.log("메뉴")}
                onButtonTitleClick={() => console.log("타이틀버튼")}
                headerClass=""
                fill
            />
            <DarkModeToggle />

            <Outlet />
        </div>
    );
}