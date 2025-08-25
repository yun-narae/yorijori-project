import React from "react";
import { Link, useLocation, matchPath, generatePath } from "react-router-dom";
import SvgIcon from "../SvgIcon/SvgIcon";
import getPbImageURL from "../../lib/getPbImageURL";

export default function ProfileAvatar({
    user,
    currentUserId,
    size = "md",
    linkBehavior = "auto", // 'auto' | 'self' | 'none'
    click = true,          // true면 Link 작동, false면 단순 표시
    path,                  // 선택: 외부에서 현재 경로를 넘기고 싶을 때
    className,
    to,                    // 외부에서 목적지 강제 지정
    onClick,               // 외부에서 클릭 핸들러 지정
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
    const toMyPage = (uid) => (uid ? generatePath("/mypage/:userId", { userId: uid }) : undefined);

    // 링크 목적지 계산 (외부 to 프롭이 최우선)
    const selfId = currentUserId ?? user?.id;
    const autoLink =
        linkBehavior === "none" || !click
            ? undefined
            : linkBehavior === "self"
                ? toMyPage(selfId)
                : !user?.id
                    ? toMyPage(selfId)
                    : user.id === currentUserId
                        ? toMyPage(currentUserId)
                        : toMyPage(user.id);

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
                        frameClass={`${iconSizeClasses[size]} `}
                        iconClass={`${iconSizeClasses[size]}  text-[var(--color-gray-4)] -translate-y-[1px]`}
                    />
                </div>
            )}
        </>
    );

    // onClick을 Link로 전달 (사용자 onClick이 있으면 기본 이동 막고 실행)
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
