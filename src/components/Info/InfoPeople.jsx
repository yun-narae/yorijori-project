// src/components/Info/InfoPeople.jsx
import React from "react";
import SvgIcon from "../SvgIcon/SvgIcon";
import ProfileAvatar from "../User/ProfileAvatar";

/**
 * 두 가지 모드 지원
 * - 기본(인원수 모드): "0/10" 표기
 * - 프로필 모드(showProfiles=true): 참여자 아바타 리스트
 *   · profiles 가 비어있으면 "참여자가 없습니다." 문구 표기
 */
export default function InfoPeople({
    post,
    className = "",
    iconShow = true,
    infoColor,
    infoSize,
    showProfiles = false,       // true면 프로필 모드
    profiles = [],              // 프로필 모드에서 렌더할 사용자 배열
    emptyText = "참여자가 없습니다.", // 프로필 모드에서 비어있을 때 문구
}) {
    const reserved =
        post?.reservedCount ??
        (Array.isArray(post?.reservations) ? post.reservations.length : post?.reservations ?? 0) ??
        0;
    const cap = post?.capacity ?? 0;

    if (showProfiles) {
        const hasParticipants = Array.isArray(profiles) && profiles.length > 0;

        return (
            <div className={["w-full flex items-center", className].join(" ")}>
                {hasParticipants ? (
                    <div className="flex -space-x-2">
                        {profiles.map((u, idx) => (
                            <ProfileAvatar
                                key={u?.id || idx}
                                user={u}
                                click={null}
                            />
                        ))}
                    </div>
                ) : (
                    <span className={`${infoSize} ${infoColor}`}>{emptyText}</span>
                )}
            </div>
        );
    }

    // 기본(인원수) 모드
    return (
        <div className={["w-full flex items-center", className].join(" ")}>
            {iconShow ? (
                <SvgIcon
                    name="user"
                    frameSize="xs"
                    frameClass="pointer-events-none"
                    iconClass={`w-[16px] h-[16px] ${infoColor}`}
                />
            ) : null}

            <span className={`${infoSize} ${infoColor} truncate`}>
                {reserved}
                <span className={`${infoColor} ${infoSize} px-[2px]`}>/</span>
                {cap}
            </span>
        </div>
    );
}
