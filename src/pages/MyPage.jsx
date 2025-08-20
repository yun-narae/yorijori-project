import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import CustomButton from "../components/CustomButton/CustomButton";
import ProfileAvatar from "../components/User/ProfileAvatar";
import { SvgIcon } from '../components/SvgIcon/SvgIcon';
import DarkModeToggle from '../components/DarkModeToggle/DarkModeToggle';
import UserName from "../components/User/UserName";

const MyPage = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const textClasses = {
        title: "text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-5)]",
        text: "font-bold text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-8)] hover:text-[var(--color-gray-6)] py-1 transition",
    };

    return (
        <div className="
            flex flex-col 
            max-w-[500px] mx-auto mt-8 mb-8
            px-4
            tablet:px-0
            desktop:px-0
        ">
            <div className="mb-4 flex flex-col gap-2 items-center">
                <ProfileAvatar
                    user={user}
                    currentUserId={user?.id}
                    size="lg"
                    linkBehavior="self"
                    click={false}
                    path={location.pathname}
                />

                {user? (
                    <UserName user={user} size="lg" />
                    ) : (
                        "로그인이 필요합니다."
                )}

                {user? (
                    <CustomButton
                        text="내 정보 수정"
                        variant="secondary"
                        size="sm"
                        custombuttonClass="!w-fit"
                    />
                ) : (
                    <CustomButton
                        text="회원가입/로그인"
                        variant="secondary"
                        size="sm"
                        custombuttonClass="!w-fit"
                        onClick={() => {
                            navigate("/login");
                        }}
                    />
                ) }
                
            </div>


            {user? (
                <div className="flex flex-col gap-3">
                <ul className="bg-[var(--color-gray-1)] px-3 pt-3 pb-1 rounded-lg">
                    <li className="mb-2">
                        <b className={textClasses.title}>
                            내 활동
                        </b>
                    </li>
                    <li className={textClasses.text}>
                        <Link to={`/post/mypost/:userId`} className="flex items-center justify-between">
                            <p>작성한 모임</p>
                            <SvgIcon
                                name="arrow-right"
                            />
                        </Link>
                    </li>
                    <li className={textClasses.text}>
                        <Link className="flex items-center justify-between">
                            <p>예약한 모임</p>
                            <SvgIcon
                                name="arrow-right"
                            />
                        </Link>
                    </li>
                    <li className={textClasses.text}>
                        <Link className="flex items-center justify-between">
                            <p>찜한 모임</p>
                            <SvgIcon
                                name="arrow-right"
                            />
                        </Link>
                    </li>
                    <li className={textClasses.text}>
                        <Link className="flex items-center justify-between">
                            <p>최근 본 모임</p>
                            <SvgIcon
                                name="arrow-right"
                            />
                        </Link>
                    </li>
                </ul>
                <ul className="bg-[var(--color-gray-1)] p-3 rounded-lg">
                    <li className="mb-2">
                        <b className={textClasses.title}>
                            다크모드
                        </b>
                    </li>
                    <li>
                        <DarkModeToggle />
                    </li>
                </ul>
                <ul className="bg-[var(--color-gray-1)] p-3 rounded-lg">
                    <li className="py-1">
                        <b 
                            className={`cursor-pointer hover:text-[var(--color-gray-7)] transition ${textClasses.title}`}
                            onClick={() => {
                                logout();
                                navigate("/");
                            }}
                        >
                            로그아웃 하기
                        </b>
                    </li>
                    <li className="py-1">
                        <b 
                            className={`cursor-pointer hover:text-[var(--color-gray-7)] transition ${textClasses.title}`}
                        >
                            탈퇴 하기
                        </b>
                    </li>
                </ul>
            </div>
            ) : (
                <ul className="bg-[var(--color-gray-1)] p-3 rounded-lg">
                    <li className="mb-2">
                        <b className={textClasses.title}>
                            다크모드
                        </b>
                    </li>
                    <li>
                        <DarkModeToggle />
                    </li>
                </ul>
            )}
        </div>
    );
};

export default MyPage;
