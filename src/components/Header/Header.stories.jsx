import React from "react";
import Header from "./Header";
import { MemoryRouter } from "react-router-dom";
import ConfirmProvider from "../Modal/ConfirmProvider";
import { AuthProvider } from "../../contexts/AuthContext";
import SvgIcon from "../SvgIcon/SvgIcon";
import CustomButton from "../CustomButton/CustomButton";
import pb from "../../lib/pocketbase";

// Storybook용 Header 컴포넌트 - props를 직접 사용
const StorybookHeader = (props) => {
    const location = { pathname: "/" };
    const navigate = () => {};
    const { user } = React.useContext(React.createContext({ user: null }));
    const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
    const menuBtnRef = React.useRef(null);
    const [screenSize, setScreenSize] = React.useState("desktop");

    // Storybook에서는 props를 직접 사용
    const showLogo = props.showLogo;
    const showBack = props.showBack;
    const showTitle = props.showTitle;
    const showNav = false;
    const showHamburger = false;
    const icon2Name = props.Icon2Name;
    const onShowIcon2Merged = props.onShowIcon2;
    const mergedButtonTitle = props.buttonTitle;
    const showButtonTitle = true;
    const showProfile = false;
    const currentTitle = props.buttonTitle || "";

    const bgClass = "bg-[var(--color-primary)]";

    return (
        <header
            className={[
                "desktop:fixed desktop:top-0 desktop:left-0 desktop:right-0",
                "border-b border-[var(--color-gray-2)]",
                "w-full",
                "flex items-center justify-center",
                "mx-auto",
                "h-[60px]",
                "z-50",
                bgClass,
                props.headerClass || "",
            ].join(" ")}
        >
            <div
                className={[
                    "w-full",
                    "mx-auto",
                    "relative",
                    "flex items-center justify-between",
                    "gap-5",
                    "max-w-[1060px]",
                    "desktop:max-w-[1060px]",
                    "px-3",
                ].join(" ")}
            >
                <div
                    className={[
                        "flex items-center justify-start",
                        "gap-5",
                    ].join(" ")}
                >
                    <div className="flex items-center justify-between gap-3">
                        {showBack && (
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                aria-label="뒤로가기"
                                tabIndex={0}
                                className="flex items-center"
                            >
                                <SvgIcon
                                    name="arrow-left"
                                    frameSize="md"
                                    iconSize="xs"
                                    fill={props.fill}
                                />
                            </button>
                        )}
                        
                        <h1 className="flex items-center w-fit">
                            {showLogo ? (
                                <a href="/" className="flex items-center">
                                    <svg className="w-8 h-4 text-[var(--color-gray-8)]">
                                        <use href="/logo.svg" />
                                    </svg>
                                </a>
                            ) : (
                                <span className="sr-only">요리조리</span>
                            )}
                        </h1>
                    </div>
                </div>

                {showTitle && currentTitle && (
                    <div>
                        <p className="absolute left-1/2 top-1/2 w-auto translate-x-[-50%] translate-y-[-50%] text-base font-bold text-[var(--color-gray-8)]">
                            {currentTitle}
                        </p>
                    </div>
                )}

                <ul
                    className={[
                        "flex",
                        "items-center",
                        "gap-2",
                        props.buttonGroupClass || "",
                    ].join(" ")}
                >
                    <li className="flex items-center gap-1 order-2">
                        {icon2Name && (
                            <button
                                type="button"
                                onClick={onShowIcon2Merged}
                                aria-label={icon2Name}
                            >
                                <SvgIcon
                                    name={icon2Name}
                                    frameSize="md"
                                    iconSize="xs"
                                    fill={props.fill}
                                />
                            </button>
                        )}
                    </li>

                    {showButtonTitle && mergedButtonTitle && (
                        <li>
                            <CustomButton
                                text={mergedButtonTitle}
                                size="sm"
                                variant="secondary"
                                onClick={props.onButtonTitleClick}
                            />
                        </li>
                    )}
                </ul>
            </div>
        </header>
    );
};

// Mock navigate function to prevent navigation
const mockNavigate = () => {};

export default {
    title: "Components/Header",
    component: StorybookHeader,
    decorators: [
        (Story) => (
            <MemoryRouter initialEntries={["/"]}>
                <AuthProvider>
                    <ConfirmProvider>
                        <Story />
                    </ConfirmProvider>
                </AuthProvider>
            </MemoryRouter>
        ),
    ],
    argTypes: {
        showTitle: { control: "boolean" },
        showLogo: { control: "boolean" },
        showBack: { control: "boolean" },
        buttonTitle: { control: "text" },
        Icon2Name: { control: "select", options: ["user", "search", ""] },
        fill: { control: "boolean" },
        onShowIcon2: { action: "Icon2 클릭됨!" },
        onButtonTitleClick: { action: "버튼 클릭됨!" },
    },
};

const Template = (args) => {
    // Override all navigation methods to prevent navigation
    React.useEffect(() => {
        const originalPushState = window.history.pushState;
        const originalReplaceState = window.history.replaceState;
        const originalBack = window.history.back;
        const originalForward = window.history.forward;
        const originalGo = window.history.go;
        
        window.history.pushState = mockNavigate;
        window.history.replaceState = mockNavigate;
        window.history.back = mockNavigate;
        window.history.forward = mockNavigate;
        window.history.go = mockNavigate;
        
        // Prevent link clicks
        const handleClick = (e) => {
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        
        document.addEventListener('click', handleClick, true);
        
        return () => {
            window.history.pushState = originalPushState;
            window.history.replaceState = originalReplaceState;
            window.history.back = originalBack;
            window.history.forward = originalForward;
            window.history.go = originalGo;
            document.removeEventListener('click', handleClick, true);
        };
    }, []);
    
    return <StorybookHeader {...args} />;
};

export const Default = Template.bind({});
Default.args = {
    showTitle: true,
    showLogo: true,
    showBack: false,
    buttonTitle: "회원가입",
    fill: true,
};

export const ShowBack = Template.bind({});
ShowBack.args = {
    showTitle: true,
    showLogo: false, // 모바일에서 로고 숨김
    showBack: true,
    buttonTitle: "회원가입",
    fill: true,
};

export const HiddenTitle = Template.bind({});
HiddenTitle.args = {
    showTitle: false,
    showLogo: false, // 모바일에서 로고 숨김
    showBack: true,
    buttonTitle: "회원가입", // 타이틀로 표시될 텍스트
    fill: true,
};

export const HiddenButton = Template.bind({});
HiddenButton.args = {
    showTitle: false,
    showLogo: true,
    showBack: true,
    Icon2Name: "search",
    fill: true,
};

export const IconDuble = Template.bind({});
IconDuble.args = {
    showTitle: false,
    showLogo: true,
    showBack: true,
    buttonTitle: "회원가입",
    Icon2Name: "search",
    fill: true,
};

// Logged-in state story: seed pb.authStore so AuthProvider reports a user
const LoggedInWrapper = ({ children }) => {
    // Synchronously seed auth before AuthProvider mounts to avoid flicker/reset on refresh
    const mockUser = {
        id: "user-logged-in",
        nickname: "홍길동",
        email: "user@example.com",
        collectionName: "users",
        images: [], // 빈 배열로 설정하여 기본 아이콘 렌더링
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
    };
    try {
        pb.authStore.save("mock-token", mockUser);
    } catch (_) {}
    // NOTE: pb.authStore.clear() on unmount is removed to make the login state persist
    // across story changes within the Storybook session.
    return children;
};

export const Logout = Template.bind({});
Logout.args = {
    showTitle: true,
    showLogo: true,
    showBack: true,
    buttonTitle: "로그아웃",
    Icon2Name: "",
    fill: true,
    onShowIcon2: () => {},
    onButtonTitleClick: () => {},
};