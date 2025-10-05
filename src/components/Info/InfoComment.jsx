// src/components/Info/InfoComment.jsx
import React from "react";
import pb from "../../lib/pocketbase";

export default function InfoComment({
    count = 0,
    className = "",
    infoCommentColor,
    infoCommentSize,
    variant = "v1",
    postId,
}) {
    const [liveCount, setLiveCount] = React.useState(count);
    const [ready, setReady] = React.useState(false); // 초기 fetch 끝났는지
    const baseClass = ["flex items-center gap-[3px]", className].join(" ");
    const textClass = `${infoCommentColor} ${infoCommentSize}`;

    const fetchCount = React.useCallback(
        async (pid) => {
        if (!pid) return;
        try {
            // 댓글 수는 totalItems로 충분
            const res = await pb.collection("post_comments").getList(1, 1, {
            filter: `post = "${pid}"`,
            requestKey: `comments:count:${pid}`,
            });
            setLiveCount(Number(res?.totalItems || 0));
        } catch {
            // 조용히 이전 값 유지
        }
        },
        []
    );

    // 초기 1회 정확한 값으로 세팅
    React.useEffect(() => {
        if (!postId) {
        setLiveCount(count);
        setReady(false);
        return;
        }
        let cancelled = false;
        (async () => {
        await fetchCount(postId);
        if (!cancelled) setReady(true);
        })();
        return () => {
        cancelled = true;
        };
    }, [postId, count, fetchCount]);

    // 로컬 브로드캐스트 수신 (폼/아이템에서 window.dispatchEvent로 송신)
    React.useEffect(() => {
        if (!postId) return;
        const onLocal = (ev) => {
        const d = ev?.detail || {};
        if (d.postId !== postId) return;

        // 생성 성공: { postId, created: { post: postId } }
        if (d.created && d.created.post === postId) {
            setLiveCount((n) => n + 1);
            return;
        }
        // 삭제 성공: { postId, deletedId }
        if (d.deletedId) {
            setLiveCount((n) => Math.max(0, n - 1));
            return;
        }
        // 기타는 안전하게 다시 조회
        fetchCount(postId);
        };
        window.addEventListener("comments:changed", onLocal);
        return () => window.removeEventListener("comments:changed", onLocal);
    }, [postId, fetchCount]);

    // 초기 로딩이 끝난 뒤에만 realtime 시도 (실패 시 폴링 전환)
    React.useEffect(() => {
        if (!ready || !postId) return;

        let unsub = null;   // realtime unsubscribe 함수
        let pollId = null;  // 폴링 타이머

        (async () => {
        try {
            // 필터 구독이 막힐 수 있어 "*" 구독 후 해당 post만 반영
            unsub = await pb.collection("post_comments").subscribe("*", (e) => {
            const rec = e?.record;
            const targetId = rec?.post || rec?.expand?.post?.id;
            if (String(targetId) !== String(postId)) return;

            if (e.action === "create") {
                setLiveCount((n) => n + 1);
                return;
            }
            if (e.action === "delete") {
                setLiveCount((n) => Math.max(0, n - 1));
                return;
            }
            // update 등은 정확히 맞추기 위해 재조회
            fetchCount(postId);
            });
        } catch {
            // /api/realtime 404 등으로 실패하면 조용히 폴링으로 대체
            pollId = setInterval(() => fetchCount(postId), 15000);
        }
        })();

        return () => {
        if (pollId) clearInterval(pollId);
        try {
            if (typeof unsub === "function") unsub();
        } catch {}
        try {
            pb.collection("post_comments").unsubscribe("*");
        } catch {}
        };
    }, [ready, postId, fetchCount]);

    const displayCount = postId ? liveCount : count;

    if (variant === "v2") {
        return (
        <div className={baseClass}>
            <span className={textClass}>{displayCount}</span>
            <span className={textClass}>개의</span>
            <span className={`${textClass} whitespace-nowrap`}>댓글</span>
        </div>
        );
    }

    return (
        <div className={baseClass}>
        <span className={`${textClass} whitespace-nowrap`}>댓글</span>
        <span className={textClass}>{displayCount}</span>
        </div>
    );
}

export function InfoCommentV1(props) {
    return <InfoComment {...props} variant="v1" />;
}
export function InfoCommentV2(props) {
    return <InfoComment {...props} variant="v2" />;
}
