// src/components/Badges/StatusBadgeList.jsx
import React, { useEffect, useRef, useState } from "react";
import pb from "../../lib/pocketbase";
import StatusBadge from "./StatusBadge";

/** 상태 계산 */
function getStatusesFromPost(post) {
    if (!post) return [];

    // ✅ 정원/예약인원 기반 마감 판단
    const cap = Number(post?.capacity ?? 0);
    const reserved = Number(
        post?.reservedCount ??
        (Array.isArray(post?.reservations) ? post.reservations.length : post?.reservations ?? 0) ??
        0
    );
    const isFull = cap > 0 && reserved >= cap;
    if (isFull) return ["모집마감"];

    // 기존 날짜/무료 로직
    const fee = post?.fee;
    const raw = post?.reservation ?? post?.date;

    const clip = (d) => {
        const x = new Date(d);
        x.setHours(0, 0, 0, 0);
        return x.getTime();
    };

    const today = clip(new Date());
    const due = raw ? clip(new Date(raw)) : null;
    const diffDays =
        due == null ? Infinity : Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    const isClosedByDate = due != null && diffDays <= 0;
    const isImminent = due != null && diffDays > 0 && diffDays <= 3;
    const isFree = fee === 0 || fee === "0";

    if (isClosedByDate) return ["모집마감"];
    if (isImminent && isFree) return ["마감임박", "무료클래스"];
    if (isImminent) return ["마감임박"];
    if (isFree) return ["모집중", "무료클래스"];
    return ["모집중"];
}

export default function StatusBadgeList({
    posts = [],
    postId,
    collection = "post",
    onLoaded,
}) {
    const [fetched, setFetched] = useState([]);
    const fetchedForIdRef = useRef(null);

    // postId로 내부 fetch (딱 한 번)
    useEffect(() => {
        if (posts.length) return;
        if (!postId || fetchedForIdRef.current === postId) return;

        let mounted = true;
        fetchedForIdRef.current = postId;

        (async () => {
            try {
                // ✅ 정원/예약 필드도 함께 가져오기
                const rec = await pb
                    .collection(collection)
                    .getOne(postId, {
                        fields: "id,fee,reservation,date,capacity,reservations,editor,expand.editor",
                    });
                if (!mounted) return;
                setFetched([rec]);
                onLoaded?.([rec]);
            } catch (e) {
                console.error("[StatusBadgeList] fetch error:", e);
                if (!mounted) return;
                setFetched([]);
                onLoaded?.([]);
            }
        })();

        return () => {
            mounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [postId, collection, posts.length]);

    const items = posts?.length ? posts : fetched;

    return (
        <>
            {items.map((p, idx) => {
                const statuses = p?._forceStatus ?? getStatusesFromPost(p);
                if (!statuses?.length) return null;
                return (
                    <div key={p?.id ?? idx} className="flex flex-wrap gap-1">
                        {statuses.map((s, i) =>
                            s ? <StatusBadge key={`${p?.id ?? idx}-${s}-${i}`} status={s} /> : null
                        )}
                    </div>
                );
            })}
        </>
    );
}
