// src/components/User/ProfileAvatar.jsx
import React, { useState } from "react";
import { Link, useLocation, matchPath, generatePath } from "react-router-dom";
import SvgIcon from "../SvgIcon/SvgIcon";
import getPbImageURL from "../../lib/getPbImageURL";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfileAvatar({
    user,                   // 표시할 대상(작성자)
    currentUserId,          // 로그인한 내 계정 id (가드 기준)
    size = "md",
    linkBehavior = "auto",  // 'auto' | 'self' | 'none'
    click = true,
    path,
    className,
    to,                     // 외부에서 목적지 강제
    onClick,
    onRequireLogin,         // 로그아웃 시 호출할 가드
    headerName,
    avatarUrl               // 직접 이미지 URL (Storybook용)
}) {
    const location = useLocation();
    const currentPath = path ?? location.pathname;

    // 현재 페이지가 마이페이지인지 (스타일 유지용)
    const isMyPage = !!matchPath({ path: "/mypage/:userId", end: false }, currentPath);

    const { user: authUser } = useAuth();
    const [nickname, setNickname] = useState(authUser?.nickname ?? "");

    const borderClasses = isMyPage
        ? "bg-[var(--color-gray-1)] hover:bg-[var(--color-gray-1)] transition"
        : "border border-[var(--color-gray-2)] hover:bg-[var(--color-gray-2)] transition";

    const sizeClasses = {
        md: "w-[40px] h-[40px]",
        lg: "w-[132px] h-[132px]",
    };

    const iconSizeClasses = {
        md: "w-[20px] h-[20px]",
        lg: "w-[80px] h-[80px]",
    };

    const linkClassName = `flex items-center justify-center ${!click ? "pointer-events-none" : ""}`;

    const toMyPage = (uid) =>
        uid ? generatePath("/mypage/:userId", { userId: uid }) : undefined;

    // 목적지 계산: 로그인 여부는 currentUserId로 판단
    let computedTo;
    if (linkBehavior === "none" || !click) {
        computedTo = undefined;
    } else if (!currentUserId) {
        // 비로그인
        // - 헤더(내 프로필 아이콘)는 바로 /login 으로 이동
        // - 그 외(카드 등)는 아래 handleClick에서 onRequireLogin이 있으면 가드(모달) 처리
        computedTo = linkBehavior === "self" ? "/login" : "/login";
        // 필요 시: computedTo = linkBehavior === "self" ? "/login" : "#";
        // (지금은 둘 다 /login으로 통일)
    } else if (linkBehavior === "self") {
        computedTo = toMyPage(currentUserId);
    } else {
        // 'auto': 작성자의 마이페이지로(없으면 내 마이페이지)
        computedTo = toMyPage(user?.id ?? currentUserId);
    }

    const linkTo = to ?? computedTo ?? "#";

    const AvatarInner = (
        <>
            {(user?.images && user.images.length > 0) || avatarUrl ? (
                <>
                    <div className="flex items-center gap-1">
                        <img
                            src={avatarUrl || getPbImageURL(user, "images")}
                            alt="프로필"
                            className={[
                                "shrink-0",
                                "rounded-full object-cover",
                                sizeClasses[size],
                                borderClasses,
                            ].join(" ")}
                            loading="lazy"
                        />
                        {headerName && (
                            <div className="text-[var(--color-gray-8)] flex flex-col text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm">
                                <span className="flex items-center gap-[2px]">
                                    <b>{nickname}</b> 
                                    <p>님</p>
                                </span>
                                <span>반가워요!</span>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="flex items-center gap-1">
                    <div
                        className={[
                            "flex items-center justify-center",
                            "rounded-full bg-[var(--color-gray-2)] border border-[var(--color-gray-3)] hover:bg-[var(--color-gray-3)] transition",
                            sizeClasses[size],
                        ].join(" ")}
                    >
                        <SvgIcon
                            name="user-profile"
                            frameClass={iconSizeClasses[size]}
                            iconClass={`${iconSizeClasses[size]} text-[var(--color-gray-4)] -translate-y-[1px]`}
                            tabIndex={-1}
                        />
                    </div>
                    {headerName && (
                        <div className="text-[var(--color-gray-8)] flex flex-col text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm">
                            <span className="flex items-center gap-[2px]">
                                <b>{nickname}</b> 
                                <p>님</p>
                            </span>
                            <span>반가워요!</span>
                        </div>
                    )}
                </div>
            )}
        </>
    );

    // 클릭 가드
    const handleClick = (e) => {
        // 비로그인 + onRequireLogin 이 주어진 경우(카드 등)에는 가드 실행
        if (!currentUserId && typeof onRequireLogin === "function" && linkBehavior !== "self") {
            e.preventDefault();
            e.stopPropagation();
            onRequireLogin();
            return;
        }
        // 그 외엔 기본 동작(링크 이동)
        if (onClick) onClick(e);
    };

    // 링크 비활성 모드
    if (linkBehavior === "none" || !click) {
        return (
            <div className={[linkClassName, className ?? ""].join(" ")}>
                {AvatarInner}
            </div>
        );
    }

    return (
        <Link to={linkTo} onClick={handleClick} className={[linkClassName, className ?? ""].join(" ")}>
            {AvatarInner}
        </Link>
    );
}
