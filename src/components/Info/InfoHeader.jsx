// src/components/Info/InfoHeader.jsx
import React, { useMemo } from "react";
import ProfileAvatar from "../User/ProfileAvatar";
import UserName from "../User/UserName";
import TimeBadge from "../Badges/TimeBadge";

export default function InfoHeader({
    // 표시 전용 직통 프롭 (author 없이도 렌더되도록)
    avatarUrl,
    name,

    // 하위 호환/선택
    author,
    user,
    currentUserId,
    createdAt,          // 작성 시간
    updatedAt,          // 추가: 수정 시간 (선택)

    // 스타일/표시 옵션
    className = "",
    nameSize = "md",
    avatarSize = "md",
    nameClass,
    timeClass,

    // 링크 동작 제어
    linkBehavior = "auto",
    path,

    onRequireLogin,
}) {
    const recordUser = author ?? user ?? null;

    const displayName = useMemo(() => {
        if (typeof name === "string" && name.length > 0) return name;
        return (
            recordUser?.nickname ||
            recordUser?.name ||
            recordUser?.username ||
            "알 수 없음"
        );
    }, [name, recordUser]);

    const avatarSizeClass = useMemo(() => {
        const map = { md: "w-[40px] h-[40px]", lg: "w-[132px] h-[132px]" };
        return map[avatarSize] || map.md;
    }, [avatarSize]);

    return (
        <div className={["flex items-center gap-2", className].join(" ")}>
            {recordUser ? (
                <ProfileAvatar
                    user={recordUser}
                    currentUserId={currentUserId}
                    size={avatarSize}
                    linkBehavior={linkBehavior}
                    path={path}
                    onRequireLogin={onRequireLogin}
                />
            ) : (
                avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={displayName}
                        className={[
                            "rounded-full object-cover shrink-0",
                            "border border-[var(--color-gray-2)] hover:bg-[var(--color-gray-2)] transition",
                            avatarSizeClass,
                        ].join(" ")}
                        loading="lazy"
                    />
                ) : (
                    <ProfileAvatar
                        user={null}
                        currentUserId={currentUserId}
                        size={avatarSize}
                        linkBehavior={linkBehavior}
                        path={path}
                    />
                )
            )}

            <div className="flex flex-col">
                {typeof name === "string" && name.length > 0 ? (
                    <span className={["font-bold", nameClass].join(" ")}>
                        {displayName}
                    </span>
                ) : (
                    <UserName user={recordUser} size={nameSize} nameClass={nameClass} />
                )}

                {/* TimeBadge에 created/updated 동시 전달 */}
                <TimeBadge
                    as="time"
                    created={createdAt}
                    updated={updatedAt}
                    timeClass={timeClass}
                />
            </div>
        </div>
    );
}
