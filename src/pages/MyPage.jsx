// src/pages/MyPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import pb from "../lib/pocketbase";
import { useAuth } from "../contexts/AuthContext";
import useFetchFiles from "../hooks/useFetchFiles";

import CustomButton from "../components/CustomButton/CustomButton";
import ProfileAvatar from "../components/User/ProfileAvatar";
import SvgIcon from "../components/SvgIcon/SvgIcon";
import DarkModeToggle from "../components/DarkModeToggle/DarkModeToggle";
import UserName from "../components/User/UserName";
import MyPageSkeleton from "../components/Skeletons/MyPageSkeleton";

export default function MyPage() {
    const navigate = useNavigate();
    const { user: authUser, logout } = useAuth();
    const { userId } = useParams();

    const [profileUser, setProfileUser] = useState(null);

    // MyPosts와 동일한 스켈레톤 게이트
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { dataLoading } = useFetchFiles("files", 1, 50);
    const showSkeleton = dataLoading || isSubmitting;

    const isOwnPage = !userId || userId === authUser?.id;

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                setIsSubmitting(true);

                if (isOwnPage) {
                    setProfileUser(authUser ?? null);
                } else {
                    const u = await pb.collection("users").getOne(userId);
                    if (!cancelled) setProfileUser(u);
                }
            } catch {
                if (!cancelled) setProfileUser(null);
            } finally {
                if (!cancelled) setIsSubmitting(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [userId, authUser, isOwnPage]);

    const textClasses = {
        title:
            "text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-5)]",
        text:
            "font-bold text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-8)] hover:text-[var(--color-gray-6)] py-1 transition",
    };

    return (
        <>
            {showSkeleton ? (
                <MyPageSkeleton />
            ) : (
                <div
                    className="
                        flex flex-col 
                        max-w-[500px] mx-auto mt-8 mb-8
                        px-4
                        tablet:px-0
                        desktop:px-0
                    "
                >
                    <div className="mb-4 flex flex-col gap-2 items-center">
                        <ProfileAvatar
                            user={profileUser}
                            currentUserId={authUser?.id}
                            size="lg"
                            linkBehavior="self"
                            click={false}
                            path={location.pathname}
                        />

                        {profileUser ? (
                            <UserName user={profileUser} size="lg" />
                        ) : isOwnPage ? (
                            <p className="text-[var(--color-gray-8)]">로그인이 필요합니다</p>
                        ) : (
                            <p className="text-[var(--color-gray-6)]">유저를 찾을 수 없습니다</p>
                        )}

                        {isOwnPage && authUser ? (
                            <CustomButton
                                text="내 정보 수정"
                                variant="secondary"
                                size="sm"
                                custombuttonClass="!w-fit"
                            />
                        ) : isOwnPage && !authUser ? (
                            <CustomButton
                                text="회원가입/로그인"
                                variant="secondary"
                                size="sm"
                                custombuttonClass="!w-fit"
                                onClick={() => {
                                    navigate("/login");
                                }}
                            />
                        ) : null}
                    </div>

                    {profileUser ? (
                        <div className="flex flex-col gap-3">
                            <ul className="bg-[var(--color-gray-1)] px-3 pt-3 pb-1 rounded-lg">
                                <li className="mb-2">
                                    <b className={textClasses.title}>활동 모아보기</b>
                                </li>

                                <li className={textClasses.text}>
                                    <Link
                                        to={`/post/mypost/${profileUser.id}`}
                                        className="flex items-center justify-between"
                                    >
                                        <p>작성한 모임</p>
                                        <SvgIcon name="arrow-right" />
                                    </Link>
                                </li>

                                {isOwnPage && authUser && (
                                    <>
                                        <li className={textClasses.text}>
                                            <Link className="flex items-center justify-between">
                                                <p>예약한 모임</p>
                                                <SvgIcon name="arrow-right" />
                                            </Link>
                                        </li>
                                        <li className={textClasses.text}>
                                            <Link className="flex items-center justify-between">
                                                <p>찜한 모임</p>
                                                <SvgIcon name="arrow-right" />
                                            </Link>
                                        </li>
                                        <li className={textClasses.text}>
                                            <Link className="flex items-center justify-between">
                                                <p>최근 본 모임</p>
                                                <SvgIcon name="arrow-right" />
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>

                            {isOwnPage && authUser && (
                                <ul className="bg-[var(--color-gray-1)] p-3 rounded-lg">
                                    <li className="mb-2">
                                        <b className={textClasses.title}>다크모드</b>
                                    </li>
                                    <li>
                                        <DarkModeToggle />
                                    </li>
                                </ul>
                            )}

                            {isOwnPage && authUser && (
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
                                        <b className={`cursor-pointer hover:text-[var(--color-gray-7)] transition ${textClasses.title}`}>
                                            탈퇴 하기
                                        </b>
                                    </li>
                                </ul>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </>
    );
}
