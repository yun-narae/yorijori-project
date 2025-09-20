// src/components/InfoLike/InfoLike.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import SvgIcon from "../SvgIcon/SvgIcon";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Props
 * - postId: string (필수)
 * - post: object (선택) - 저장할 최소 필드 포함 권장(특히 editor)
 * - initialCount: number (선택) - 서버/초깃값
 * - count: boolean (선택, 기본 false) - 숫자 표시 여부
 * - className, infoLikeColor, infoLikeSize, likeIconClass, infoCountClass: 스타일
 * - onChange: (liked:boolean, nextCount:number) => void (선택)
 */
export default function InfoLike({
    postId,
    post = null,
    initialCount = 0,
    count = false,
    aggregateAcrossUsers = false,
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

    // 모든 사용자 로컬에서 이 post를 좋아요한 사용자 수 집계
    const countAcrossUsers = useCallback(() => {
        try {
            let total = 0;
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (!k || !k.startsWith("likes_")) continue;
                const arr = JSON.parse(localStorage.getItem(k) || "[]");
                if (Array.isArray(arr) && arr.some((it) => it?.id === postId)) total += 1;
            }
            return total;
        } catch {
            return 0;
        }
    }, [postId]);

    const isLikedInitially = useMemo(() => {
        if (!storageKey) return false;
        return readLikes().some((it) => it?.id === postId);
    }, [readLikes, storageKey, postId]);

    const baseCount = Number.isFinite(initialCount) ? initialCount : 0;

    // 초기값: 집계 모드면 모든 사용자 합산, 아니면 "나만 +1"
    const [liked, setLiked] = useState(isLikedInitially);
    const [likeCount, setLikeCount] = useState(
        aggregateAcrossUsers
            ? baseCount + countAcrossUsers()
            : baseCount + (isLikedInitially ? 1 : 0)
    );

    // initialCount 변경 시에도 보정 유지
    useEffect(() => {
        setLikeCount(
            aggregateAcrossUsers
                ? baseCount + countAcrossUsers()
                : baseCount + (liked ? 1 : 0)
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseCount, aggregateAcrossUsers, countAcrossUsers, liked]);

    // editor id 추출 유틸(최소 정보 보강용)
    const extractEditorId = (p) => {
        if (!p) return null;
        const ed = p.editor;
        if (typeof ed === "string") return ed;
        if (ed && typeof ed === "object" && ed.id) return ed.id;
        const ex = p?.expand?.editor;
        if (typeof ex === "string") return ex;
        if (ex && typeof ex === "object" && ex.id) return ex.id;
        return null;
    };

    // 스토리지/커스텀 이벤트 동기화
    useEffect(() => {
        const onStorage = (e) => {
            if (aggregateAcrossUsers) {
                setLiked(isLikedInitially => isLikedInitially); // liked는 아래에서 별도로 보정
                setLikeCount(baseCount + countAcrossUsers());   // 전량 재집계
                return;
            }
            if (e.key !== storageKey) return;
            const exists = readLikes().some((it) => it?.id === postId);
            setLiked(exists);
            setLikeCount(baseCount + (exists ? 1 : 0));
        };
        const onCustom = () => {
            if (aggregateAcrossUsers) {
                setLikeCount(baseCount + countAcrossUsers());   // 전량 재집계
            }
            // 집계 비사용 모드는 다른 인스턴스에서 전달된 count를 그대로 사용 중
        };
        window.addEventListener("storage", onStorage);
        window.addEventListener("likes:changed", onCustom);
        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("likes:changed", onCustom);
        };
    }, [storageKey, postId, baseCount, countAcrossUsers, aggregateAcrossUsers, readLikes]);

    const writeLikes = useCallback(
        (next) => {
            if (!storageKey) return;
            localStorage.setItem(storageKey, JSON.stringify(next));
        },
        [storageKey]
    );

    const toggleLike = () => {
        if (!userId || !postId) return;

        const list = readLikes();

        if (liked) {
            const next = list.filter((it) => it?.id !== postId);
            writeLikes(next);

            if (aggregateAcrossUsers) {
                setLiked(false);
                const agg = baseCount + countAcrossUsers();     // 이미 삭제 반영됨
                setLikeCount(agg);
                onChange?.(false, agg);
                window.dispatchEvent(
                    new CustomEvent("likes:changed", {
                        detail: { userId, postId, liked: false, count: agg },
                    })
                );
            } else {
                const nextCount = Math.max(0, likeCount - 1);
                setLiked(false);
                setLikeCount(nextCount);
                onChange?.(false, nextCount);
                window.dispatchEvent(
                    new CustomEvent("likes:changed", {
                        detail: { userId, postId, liked: false, count: nextCount },
                    })
                );
            }
        } else {
            // 저장 객체 + editor 보강
            const base = post && post.id ? { ...post } : { id: postId };
            if (!base.editor) {
                const eid = extractEditorId(post);
                if (eid) base.editor = eid;
            }
            const exists = list.some((it) => it?.id === postId);
            const next = exists ? list : [{ ...base, id: postId }, ...list];
            writeLikes(next);

            if (aggregateAcrossUsers) {
                setLiked(true);
                const agg = baseCount + countAcrossUsers();     // 이미 추가 반영됨
                setLikeCount(agg);
                onChange?.(true, agg);
                window.dispatchEvent(
                    new CustomEvent("likes:changed", {
                        detail: { userId, postId, liked: true, count: agg },
                    })
                );
            } else {
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
            {count && (
                <span className={`text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm ${infoLikeColor} ${infoLikeSize} ${infoCountClass}`}>
                    {likeCount}
                </span>
            )}
        </button>
    );
}
