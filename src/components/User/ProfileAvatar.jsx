import React from "react";
import { Link, useLocation, matchPath, generatePath } from "react-router-dom";
import SvgIcon from "../SvgIcon/SvgIcon";
import getPbImageURL from "../../lib/getPbImageURL";

export default function ProfileAvatar({
    user,
    currentUserId,
    size = "md",
    linkBehavior = "auto", // 'auto' | 'self' | 'none'
    click = true,
    path,
    className,
    to,
    onClick,
}) {
    const location = useLocation();
    const currentPath = path ?? location.pathname;

    // 현재 페이지가 마이페이지인지 패턴으로 판별
    const isMyPage = !!matchPath({ path: "/mypage/:userId", end: false }, currentPath);

    // 스타일 (기존 유지)
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

    // URL 생성 헬퍼
    const toMyPage = (uid) =>
        uid ? generatePath("/mypage/:userId", { userId: uid }) : undefined;

    // ✅ 링크 목적지 계산 (외부 to 프롭이 최우선)
    const selfId = currentUserId ?? user?.id;

    let autoLink;
    if (linkBehavior === "none" || !click) {
        autoLink = undefined;
    } else if (!user?.id) {
        // ✅ 로그인 안 된 경우 → /login
        autoLink = "/login";
    } else if (linkBehavior === "self") {
        autoLink = toMyPage(selfId);
    } else {
        // 'auto'일 때: 전달된 user의 마이페이지로
        // (currentUserId와 다르면 해당 user의 페이지, 같으면 본인 페이지)
        autoLink = toMyPage(user.id ?? selfId);
    }

    const linkTo = to ?? autoLink ?? "#";

    const AvatarInner = (
        <>
            {user?.images ? (
                <img
                    src={getPbImageURL(user, "images")}
                    alt="프로필"
                    className={`
                        shrink-0
                        rounded-full object-cover
                        ${sizeClasses[size]}
                        ${borderClasses}
                    `}
                    loading="lazy"
                />
            ) : (
                <div
                    className={`
                        flex items-center justify-center
                        rounded-full bg-[var(--color-gray-2)] border border-[var(--color-gray-3)] hover:bg-[var(--color-gray-3)] transition
                        ${sizeClasses[size]}
                    `}
                >
                    <SvgIcon
                        name="user-profile"
                        frameClass={`${iconSizeClasses[size]}`}
                        iconClass={`${iconSizeClasses[size]} text-[var(--color-gray-4)] -translate-y-[1px]`}
                    />
                </div>
            )}
        </>
    );

    // 외부 onClick이 있으면 네비게이션 막고 그 핸들러만 실행
    const handleClick = (e) => {
        if (onClick) {
            e.preventDefault();
            onClick(e);
        }
    };

    return (
        <Link to={linkTo} onClick={handleClick} className={`${linkClassName} ${className ?? ""}`}>
            {AvatarInner}
        </Link>
    );
}
