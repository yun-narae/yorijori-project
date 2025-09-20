// src/components/InfoLike/InfoLike.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import SvgIcon from "../SvgIcon/SvgIcon";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Props
 * - postId: string (필수) - 게시물 ID
 * - post: object (선택) - 저장할 최소 필드 포함 권장
 * - initialCount: number (선택) - 좋아요 초기 숫자
 * - count: boolean (선택, 기본 true) - 숫자 표시 여부
 * - className, infoLikeColor, infoLikeSize: 스타일용
 * - onChange: (liked:boolean, nextCount:number) => void (선택)
 *
 * 저장 형식:
 * localStorage key = likes_${userId}
 * value = JSON.stringify([{ id: string, ...postSummary }])
 */
export default function InfoLike({
    postId,
    post = null,
    initialCount = 0,
    count = false,                // boolean: 숫자 표시/숨김
    className = "",
    infoLikeColor = "",
    infoLikeSize = "",
    onChange,
    likeIconClass = "",
    infoCountClass = "",
}) {
    const { user } = useAuth();
    const userId = user?.id;

    const storageKey = useMemo(() => (userId ? `likes_${userId}` : null), [userId]);

    const readLikes = useCallback(() => {
        if (!storageKey) return [];
        try {
            const raw = localStorage.getItem(storageKey);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }, [storageKey]);

    const isLikedInitially = useMemo(() => {
        if (!storageKey) return false;
        return readLikes().some((it) => it?.id === postId);
    }, [readLikes, storageKey, postId]);

    const baseCount = Number.isFinite(initialCount) ? initialCount : 0;

    // 페이지 이동 시에도 즉시 보정: 이미 찜 상태면 +1
    const [liked, setLiked] = useState(isLikedInitially);
    const [likeCount, setLikeCount] = useState(baseCount + (isLikedInitially ? 1 : 0));

    // initialCount가 바뀔 때도 보정 유지
    useEffect(() => {
        setLikeCount(baseCount + (liked ? 1 : 0));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseCount]);
    
    // 스토리지/커스텀 이벤트로 동기화
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key !== storageKey) return;
            const exists = readLikes().some((it) => it?.id === postId);
            setLiked(exists);
        };
        const onCustom = (e) => {
            const d = e.detail;
            if (!d || d.userId !== userId || d.postId !== postId) return;
            setLiked(d.liked);
            setLikeCount(d.count);
        };
        window.addEventListener("storage", onStorage);
        window.addEventListener("likes:changed", onCustom);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("likes:changed", onCustom);
        };
    }, [readLikes, storageKey, postId, userId]);

    const writeLikes = useCallback(
        (next) => {
            if (!storageKey) return;
            localStorage.setItem(storageKey, JSON.stringify(next));
        },
        [storageKey]
    );

    const toggleLike = () => {
        if (!userId) return;

        const list = readLikes();

        if (liked) {
            const next = list.filter((it) => it?.id !== postId);
            writeLikes(next);
            const nextCount = Math.max(0, likeCount - 1);
            setLiked(false);
            setLikeCount(nextCount);
            onChange?.(false, nextCount);
            window.dispatchEvent(
                new CustomEvent("likes:changed", {
                    detail: { userId, postId, liked: false, count: nextCount },
                })
            );
        } else {
            const toSave = post && post.id ? post : { id: postId };
            const exists = list.some((it) => it?.id === postId);
            const next = exists ? list : [{ ...toSave, id: postId }, ...list];
            writeLikes(next);
            const nextCount = likeCount + 1;
            setLiked(true);
            setLikeCount(nextCount);
            onChange?.(true, nextCount);
            window.dispatchEvent(
                new CustomEvent("likes:changed", {
                    detail: { userId, postId, liked: true, count: nextCount },
                })
            );
        }
    };

    const iconName = liked ? "heart-2" : "heart-1";

    return (
        <button
            type="button"
            className={["flex items-center", className].join(" ")}
            onClick={toggleLike}
            aria-pressed={liked}
            title={liked ? "좋아요 취소" : "좋아요"}
        >
            <SvgIcon
                name={iconName}
                frameSize="xs"
                frameClass="pointer-events-none"
                iconClass={`w-[20px] h-[20px] ${likeIconClass} ${infoLikeColor}`}
            />
            {count && (                       /* count=true일 때만 숫자 표시 */
                <span className={`text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm ${infoLikeColor} ${infoLikeSize} ${infoCountClass}`}>{likeCount}</span>
            )}
        </button>
    );
}
