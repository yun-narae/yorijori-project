// src/components/Info/InfoPeople.jsx
import React from "react";
import SvgIcon from "../SvgIcon/SvgIcon";
import ProfileAvatar from "../User/ProfileAvatar";

/**
 * 두 가지 모드 지원
 * - 기본(인원수 모드): "3/10" 또는 "10명" 표기
 * - 프로필 모드(showProfiles=true): 예약자 아바타 리스트
 *   · profiles 가 비어있으면 "예약자가 없습니다." 문구 표기
 *
 * 추가 props:
 * - showReserved: true 이면 "예약수/정원", false 이면 "정원(+단위)" 만 표기
 * - unit: showReserved=false 일 때 뒤에 붙일 단위 문자열(예: "명")
 */
export default function InfoPeople({
    post,
    className = "",
    iconShow = true,
    infoColor,
    infoSize,
    showProfiles = false,       // true면 프로필 모드
    profiles = [],              // 프로필 모드에서 렌더할 사용자 배열
    emptyText = "예약자가 없습니다.", // 프로필 모드에서 비어있을 때 문구
    showReserved = true,        // 예약수/정원 비율을 보여줄지 여부
    unit = "",                  // showReserved=false일 때 정원 뒤에 붙일 단위(예: "명")
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

            {showReserved ? (
                // 3/10 형태
                <span className={`${infoSize} ${infoColor} truncate`}>
                    {reserved}
                    <span className={`${infoColor} ${infoSize} px-[2px]`}>/</span>
                    {cap}
                </span>
            ) : (
                // 10명 형태 (단위 없으면 숫자만)
                <span className={`${infoSize} ${infoColor} truncate`}>
                    {cap}
                    {unit ? <span className={`${infoColor} ${infoSize} ml-[4px]`}>{unit}</span> : null}
                </span>
            )}
        </div>
    );
}
