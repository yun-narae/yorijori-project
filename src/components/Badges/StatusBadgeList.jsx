import React, { useEffect, useRef, useState } from "react";
import pb from "../../lib/pocketbase";
import StatusBadge from "./StatusBadge";

/** 상태 계산 */
function getStatusesFromPost(post) {
    if (!post) return [];
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

    const isClosed = due != null && diffDays <= 0;
    const isImminent = due != null && diffDays > 0 && diffDays <= 3;
    const isFree = fee === 0 || fee === "0";

    // 1) 모집마감
    if (isClosed) return ["모집마감"];

    // 2) 모집중 + 마감임박 + 무료클래스 → 마감임박, 무료클래스
    if (isImminent && isFree) return ["마감임박", "무료클래스"];

    // 3) 모집중 + 마감임박 → 마감임박만
    if (isImminent) return ["마감임박"];

    // 4) 모집중 + 무료클래스 → 모집중, 무료클래스
    if (isFree) return ["모집중", "무료클래스"];

    // 5) 그 외 → 모집중만
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
        // posts가 이미 있으면 fetch 불필요
        if (posts.length) return;

        // postId가 없거나 같은 id로 이미 가져왔으면 중복 방지
        if (!postId || fetchedForIdRef.current === postId) return;

        let mounted = true;
        fetchedForIdRef.current = postId;

        (async () => {
            try {
                const rec = await pb
                    .collection(collection)
                    .getOne(postId, { fields: "id,fee,reservation,date,editor,expand.editor" });
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
                if (!statuses?.length) return null; // ✅ 빈/undefined 방어
                return (
                    <div key={p?.id ?? idx} className="flex flex-wrap gap-1">
                        {statuses.map((s, i) =>
                            s ? ( // ✅ status가 falsy면 렌더 안 함 → "undefined" 표시 방지
                                <StatusBadge key={`${p?.id ?? idx}-${s}-${i}`} status={s} />
                            ) : null
                        )}
                    </div>
                );
            })}
        </>
    );
}
