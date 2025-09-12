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
    author,                 // 작성자 레코드 (우선)
    user,                   // 기존 user 레코드
    currentUserId,          // 권한/링크 판단용 (내 계정 id)
    createdAt,              // 시간 뱃지에 표시할 값 (ISO | Date)

    // 스타일/표시 옵션
    className = "",
    nameSize = "md",
    avatarSize = "md",      // 'md' | 'lg'
    nameClass,
    timeClass,

    // 링크 동작 제어 (ProfileAvatar로 전달)
    linkBehavior = "auto",  // 'auto' | 'self' | 'none'
    path,                   // ProfileAvatar path override (선택)

    onRequireLogin,         // 로그아웃 시 호출할 가드
}) {
    // 1) 표시에 사용할 레코드: author > user > null
    const recordUser = author ?? user ?? null;

    // 2) 표시 이름: name > recordUser 필드 > 기본값
    const displayName = useMemo(() => {
        if (typeof name === "string" && name.length > 0) return name;
        return (
            recordUser?.nickname ||
            recordUser?.name ||
            recordUser?.username ||
            "알 수 없음"
        );
    }, [name, recordUser]);

    // 3) 아바타 사이즈 클래스를 ProfileAvatar 규격에 맞춤
    const avatarSizeClass = useMemo(() => {
        const map = {
            md: "w-[40px] h-[40px]",
            lg: "w-[132px] h-[132px]",
        };
        return map[avatarSize] || map.md;
    }, [avatarSize]);

    return (
        <div className={["flex items-center gap-2", className].join(" ")}>
            {/* A. 유저 레코드가 있으면: ProfileAvatar(자동 링크/마이페이지 처리) */}
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
                /* B. 레코드는 없지만 avatarUrl이 있으면: 정적 이미지 */
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
                    /* C. 둘 다 없으면: ProfileAvatar 기본 아이콘으로 폴백 */
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
                {/* name 프롭이 오면 그대로 텍스트, 아니면 UserName 컴포넌트 사용 */}
                {typeof name === "string" && name.length > 0 ? (
                    <span className={["font-bold", nameClass].join(" ")}>
                        {displayName}
                    </span>
                ) : (
                    <UserName
                        user={recordUser}
                        size={nameSize}
                        nameClass={nameClass}
                    />
                )}

                <TimeBadge
                    updated={createdAt}
                    as="time"
                    timeClass={timeClass}
                />
            </div>
        </div>
    );
}
