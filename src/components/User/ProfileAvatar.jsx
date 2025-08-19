import React from "react";
import { Link } from "react-router-dom";
import SvgIcon from "../SvgIcon/SvgIcon";
import getPbImageURL from "../../lib/getPbImageURL";

export default function ProfileAvatar({
    user,
    currentUserId,
    size = "md",
    linkBehavior = "auto", // 'auto' | 'self' | 'none'
    click = true, // true면 Link 작동, false면 단순 표시
    path
}) {

    const isMyPage = path?.startsWith(`/mypage/${user.id}`);

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
    
    let linkTo = null;
    if (click) {
        if (linkBehavior === "self") {
            // 내가 나 자신 클릭 → 내 마이페이지
            linkTo = `/mypage/${user.id}`;
        } else if (linkBehavior === "auto") {
            if (!user?.id) {
                // expand.user 없음 → 내 마이페이지로 이동해 회원가입 유도
                linkTo = `/mypage/${user.id}`;
            } else {
                // 다른 사람 클릭 → 상대방 마이페이지
                linkTo = user.id === currentUserId ? `/mypage/${user.id}` : `/mypage/${user.id}`;
            }
        }
    }
  
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
                />
            ) : (
                <div
                    className={`
                        flex items-center justify-center
                        rounded-full
                        ${sizeClasses[size]}
                        ${borderClasses}
                    `}
                >
                    <SvgIcon
                        name="user-profile"
                        frameClass={iconSizeClasses[size]}
                        iconClass={`${iconSizeClasses[size]} text-[var(--color-gray-3)] -translate-y-[1px]`}
                    />
                </div>
            )}
        </>
    );
  
    const linkClassName = `flex items-center justify-center ${!click ? "pointer-events-none" : ""}`;

    return (
        <Link to={linkTo || "#"} className={linkClassName}>
            {AvatarInner}
        </Link>
    );
  }