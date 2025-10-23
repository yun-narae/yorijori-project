// src/components/Info/InfoPeople.jsx
import React from "react";
import SvgIcon from "../SvgIcon/SvgIcon";
import ProfileAvatar from "../User/ProfileAvatar";
import pb from "../../lib/pocketbase";

/**
 * - showReserved=true  → "예약수/정원" 형태 (reservedCount가 주어졌을 때만 사용)
 * - showReserved=false → "정원(+단위)" 형태 (capacity만 필요)
 * - showProfiles=true  → 아바타 리스트 모드
 */
export default function InfoPeople({
    post,
    className = "",
    iconShow = true,
    infoColor,
    infoSize,
    showProfiles = false,
    profiles = [],
    emptyText = "예약자가 없습니다.",
    showReserved = true,
    unit = "",
}) {
    // reservedCount는 상위에서 내려줄 때만 사용 (여기서는 fetch하지 않음)
    const reserved =
        post?.reservedCount ??
        (Array.isArray(post?.reservations) ? post.reservations.length : post?.reservations ?? 0) ??
        0;

    // capacity는 없으면 1회 보강(fetch)
    const [cap, setCap] = React.useState(
        typeof post?.capacity === "number" ? Number(post.capacity) : null
    );

    React.useEffect(() => {
        let cancelled = false;
        const needFetch = cap === null && post?.id;
        if (!needFetch) return;

        (async () => {
        try {
            const rec = await pb.collection("post").getOne(post.id, {
            requestKey: `post:cap:${post.id}`,
            });
            if (!cancelled) setCap(Number(rec?.capacity ?? 0));
        } catch {
            if (!cancelled) setCap(0); // 실패 시 0(무제한)로 표시
        }
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [post?.id]); // post.id 바뀔 때만

    // 프로필 모드
    if (showProfiles) {
        const hasParticipants = Array.isArray(profiles) && profiles.length > 0;
        return (
        <div className={["w-full flex items-center", className].join(" ")}>
            {hasParticipants ? (
            <div className="flex -space-x-2">
                {profiles.map((u, idx) => (
                <ProfileAvatar key={u?.id || idx} user={u} click={null} />
                ))}
            </div>
            ) : (
            <span className={`${infoSize} ${infoColor}`}>{emptyText}</span>
            )}
        </div>
        );
    }

    // 아이콘 + 텍스트 레이아웃
    return (
        <div className={["w-full flex items-center", className].join(" ")}>
        {iconShow ? (
            <SvgIcon
                name="user"
                frameSize="xs"
                frameClass="pointer-events-none"
                iconClass={`w-[16px] h-[16px] ${infoColor}`}
                tabIndex={-1}
            />
        ) : null}

        {showReserved ? (
            // 예약수/정원(상위에서 reservedCount를 내려줄 때만 사용)
            <span className={`${infoSize} ${infoColor} truncate`}>
            {reserved}
            <span className={`${infoColor} ${infoSize} px-[2px]`}>/</span>
            {cap ?? 0}
            </span>
        ) : (
            // 정원만 표기
            <span className={`${infoSize} ${infoColor} truncate`}>
            {cap ?? 0}
            {unit ? <span className={`${infoColor} ${infoSize} ml-[4px]`}>{unit}</span> : null}
            </span>
        )}
        </div>
    );
}
