// src/pages/MyPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, generatePath } from "react-router-dom";
import pb from "../lib/pocketbase";
import { useAuth } from "../contexts/AuthContext";
import useFetchFiles from "../hooks/useFetchFiles";

import CustomButton from "../components/CustomButton/CustomButton";
import ProfileAvatar from "../components/User/ProfileAvatar";
import SvgIcon from "../components/SvgIcon/SvgIcon";
import DarkModeToggle from "../components/DarkModeToggle/DarkModeToggle";
import UserName from "../components/User/UserName";
import MyPageSkeleton from "../components/Skeletons/MyPageSkeleton";
import { useConfirm } from "../components/Modal/ConfirmProvider";

import { deleteAccountWithConfirm } from "../lib/deleteAccountWithConfirm";

// 탈퇴 시 소유 데이터 정리 대상(필요 시 컬렉션 추가)
const COLLECTIONS_TO_CLEAN = [
    { name: "post", ownerField: "editor" },
];

export default function MyPage() {
    const navigate = useNavigate();
    const { user: authUser, logout } = useAuth();
    const { userId } = useParams();

    const [profileUser, setProfileUser] = useState(null);

    // MyPosts와 동일한 스켈레톤 게이트
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { dataLoading } = useFetchFiles("files", 1, 50);
    const showSkeleton = dataLoading || isSubmitting;

    // 현재 페이지가 내 페이지인지 판별(파라미터가 없거나 내 id와 같으면 true)
    const isOwnPage = !userId || userId === authUser?.id;

    const confirm = useConfirm();

    useEffect(() => {
        let cancelled = false;

        // [Step 0] 탈퇴/로그아웃 직후: URL에 남은 삭제된 userId로 API를 치지 않도록 즉시 홈으로
        if (!authUser && userId) {
            navigate("/", { replace: true });
            return;
        }

        // [Step 1] 내 페이지라면 서버 호출 없이 세션의 authUser로 즉시 렌더(빠르고 안전)
        if (!userId || (authUser?.id && userId === authUser.id)) {
            setProfileUser(authUser ?? null);
            return;
        }

        // [Step 2] 다른 유저 페이지일 때만 서버에서 사용자 조회
        const run = async () => {
            setIsSubmitting(true);
            try {
                const rec = await pb.collection("users").getOne(userId);
                if (cancelled) return;
                setProfileUser(rec);
            } catch (err) {
                if (!cancelled) {
                    if (err?.status === 404) {
                        navigate("/", { replace: true });
                    } else {
                        console.error("MyPage user load failed:", err);
                        setProfileUser(null);
                    }
                }
            } finally {
                if (!cancelled) setIsSubmitting(false);
            }
        };

        run();
        return () => { cancelled = true; };
    }, [userId, authUser?.id, navigate]);

    const textClasses = {
        title:
            "text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-5)]",
        text:
            "font-bold text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-8)] hover:text-[var(--color-gray-6)] py-1 transition",
    };

    // ── 탈퇴 버튼 핸들러: 공통 유틸 사용
    const handleDeleteAccount = async () => {
        if (!authUser) return;

        await deleteAccountWithConfirm(authUser.id, {
            confirm,
            navigate,
            collections: COLLECTIONS_TO_CLEAN,
            before: () => setIsSubmitting(true),
            after: () => setIsSubmitting(false),
            onSuccess: () => {
                // 세션/컨텍스트 로그아웃만 이곳에서 처리 (이동은 유틸이 수행)
                logout();
            },
            onError: (e) => {
                console.error("탈퇴 실패:", e);
            },
        });
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
                    {/* 상단 프로필 영역 */}
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
                                aria-label="내 정보 수정 페이지로 이동"
                                variant="secondary"
                                size="sm"
                                custombuttonClass="!w-fit"
                                basebuttonClass="hover:bg-[var(--color-gray-3)]"
                                onClick={() => navigate("/mypage/edit")}
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

                    {/* 하단 섹션들 */}
                    {profileUser ? (
                        <div className="flex flex-col gap-3">
                            {/* 활동 모아보기 */}
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

                                <li className={textClasses.text}>
                                    <Link
                                        to={generatePath("/post/likes/:userId", { userId: profileUser.id })}
                                        className="flex items-center justify-between"
                                    >
                                        <p>찜한 모임</p>
                                        <SvgIcon name="arrow-right" />
                                    </Link>
                                </li>

                                <li className={textClasses.text}>
                                    <Link
                                        to={generatePath("/post/participation/:userId", { userId: profileUser.id })}
                                        className="flex items-center justify-between"
                                    >
                                        <p>예약한 모임</p>
                                        <SvgIcon name="arrow-right" />
                                    </Link>
                                </li>
                            </ul>

                            {/* 환경 설정: 다크모드 */}
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

                            {/* 계정 영역: 로그아웃/탈퇴 */}
                            {isOwnPage && authUser && (
                                <ul className="bg-[var(--color-gray-1)] p-3 rounded-lg">
                                    <li className="py-1">
                                        <CustomButton
                                            text="로그아웃 하기"
                                            variant="tertiary"
                                            size="sm"
                                            custombuttonClass="!w-fit cursor-pointer"
                                            onClick={() => {
                                                logout();
                                                navigate("/");
                                            }}
                                            basebuttonClass="group !px-0 !bg-transparent hover:!bg-transparent active:!bg-transparent focus:!ring-0"
                                            basebuttontextClass={[
                                                "transition-colors",
                                                "!text-[var(--color-gray-5)]",
                                                "text-mo-title tablet:text-tab-title desktop:text-pc-title",
                                                "group-hover:!text-[var(--color-gray-7)]",
                                            ].join(" ")}
                                        />
                                    </li>
                                    <li className="py-1">
                                        <CustomButton
                                            text="탈퇴 하기"
                                            variant="tertiary"
                                            size="sm"
                                            custombuttonClass="!w-fit cursor-pointer"
                                            onClick={handleDeleteAccount}
                                            basebuttonClass="group !px-0 !bg-transparent hover:!bg-transparent active:!bg-transparent focus:!ring-0"
                                            basebuttontextClass={[
                                                "transition-colors",
                                                "!text-[var(--color-gray-5)]",
                                                "text-mo-title tablet:text-tab-title desktop:text-pc-title",
                                                "group-hover:!text-[var(--color-gray-7)]",
                                            ].join(" ")}
                                        />
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
