import React from "react";
import { useLocation } from "react-router-dom";
import ProfileAvatar from "../User/ProfileAvatar";
import UserName from "../User/UserName";
import TimeBadge from "../Badges/TimeBadge";

/**
 * - 아바타, 사용자 이름, 시간 표시
 */
export default function InfoGroup({
    user,               // users 레코드 (선택)
    currentUserId,      // 현재 로그인 유저 id (내 프로필 링크 처리용)
    createdAt,          // 시간 표시용 (Date | ISO string)
    className = "",
    nameSize = "md",    // UserName size prop
    avatarSize = "md",  // ProfileAvatar size: 'md' | 'lg'
}) {
    const location = useLocation();

    return (
        <div className={["flex items-center gap-2", className].join(" ")}>
            <ProfileAvatar
                user={user}
                currentUserId={currentUserId}
                size={avatarSize}
                linkBehavior="auto"
                path={location.pathname}
            />

            <div className="flex flex-col">
                <UserName user={user} size={nameSize} />
                <TimeBadge updated={createdAt} as="time" />
            </div>
        </div>
    );
}
