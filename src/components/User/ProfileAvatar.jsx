import React, { useMemo } from "react";
import { Link, useLocation, matchPath, generatePath } from "react-router-dom";
import SvgIcon from "../SvgIcon/SvgIcon";
import getPbImageURL from "../../lib/getPbImageURL";

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
}) {
    const location = useLocation();
    const currentPath = path ?? location.pathname;

    // 현재 페이지가 마이페이지인지 (스타일 유지용)
    const isMyPage = !!matchPath({ path: "/mypage/:userId", end: false }, currentPath);

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
        // 로그아웃이면 네비게이션은 막고 모달만 띄울 것이므로 의미 없는 앵커
        computedTo = "#";
    } else if (linkBehavior === "self") {
        computedTo = toMyPage(currentUserId);
    } else {
        // 'auto': 작성자의 마이페이지로(없으면 내 마이페이지)
        computedTo = toMyPage(user?.id ?? currentUserId);
    }

    const linkTo = to ?? computedTo ?? "#";

    const AvatarInner = (
        <>
            {user?.images ? (
                <img
                    src={getPbImageURL(user, "images")}
                    alt="프로필"
                    className={[
                        "shrink-0",
                        "rounded-full object-cover",
                        sizeClasses[size],
                        borderClasses,
                    ].join(" ")}
                    loading="lazy"
                />
            ) : (
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
                    />
                </div>
            )}
        </>
    );

    // 클릭 가드: 로그인 안 되어 있으면 모달+로그인 유도
    const handleClick = (e) => {
        // 외부 핸들러가 있으면 먼저 호출되도록 하지 말고, 가드가 우선
        if (!currentUserId && typeof onRequireLogin === "function") {
            e.preventDefault();
            e.stopPropagation();
            onRequireLogin();
            return;
        }
        if (onClick) {
            // 로그인된 상태에서만 외부 onClick 실행
            const ret = onClick(e);
            return ret;
        }
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
