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
    const [ready, setReady] = React.useState(false); // 초기 fetch 완료 여부
    const baseClass = ["flex items-center gap-[3px]", className].join(" ");
    const textClass = `${infoCommentColor} ${infoCommentSize}`;

    const fetchCount = React.useCallback(async (pid, signal) => {
        if (!pid) return;
        try {
            // totalItems만 필요하므로 1개만 조회
            const res = await pb.collection("post_comments").getList(1, 1, {
                filter: `post = "${pid}"`,
                requestKey: `comments:count:${pid}`,
                signal,
            });
            setLiveCount(Number(res?.totalItems || 0));
        } catch (err) {
            // AbortError는 정상적인 취소이므로 에러 로그를 출력하지 않음
            if (err.name !== 'AbortError' && !err.message?.includes('autocancelled')) {
                // 실패 시 이전 값 유지
            }
        }
    }, []);

    // 초기 1회 정확한 값으로 세팅
    React.useEffect(() => {
        if (!postId) {
            setLiveCount(count);
            setReady(false);
            return;
        }
        const abortController = new AbortController();
        (async () => {
            await fetchCount(postId, abortController.signal);
            if (!abortController.signal.aborted) setReady(true);
        })();
        return () => { abortController.abort(); };
    }, [postId, count, fetchCount]);

    // 로컬 브로드캐스트 수신: 항상 정확도를 위해 재조회 (증감 연산 금지)
    React.useEffect(() => {
        if (!postId) return;
        const abortController = new AbortController();
        const onLocal = (ev) => {
            if (ev?.detail?.postId !== postId) return;
            fetchCount(postId, abortController.signal);
        };
        window.addEventListener("comments:changed", onLocal);
        return () => {
            abortController.abort();
            window.removeEventListener("comments:changed", onLocal);
        };
    }, [postId, fetchCount]);

    // 실시간 구독: 어떤 액션이든 안전하게 재조회만 수행
    React.useEffect(() => {
        if (!ready || !postId) return;
        const abortController = new AbortController();
        let unsub = null;
        let pollId = null;

        (async () => {
            try {
                unsub = await pb.collection("post_comments").subscribe("*", (e) => {
                    const rec = e?.record;
                    const targetId = rec?.post || rec?.expand?.post?.id;
                    if (String(targetId) !== String(postId)) return;
                    fetchCount(postId, abortController.signal);
                });
            } catch {
                // 실시간 실패 시 폴링 대체 (간격을 늘려서 서버 부하 감소)
                pollId = setInterval(() => fetchCount(postId, abortController.signal), 30000);
            }
        })();

        return () => {
            abortController.abort();
            if (pollId) clearInterval(pollId);
            try { typeof unsub === "function" && unsub(); } catch {}
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

export function InfoCommentV1(props) { return <InfoComment {...props} variant="v1" />; }
export function InfoCommentV2(props) { return <InfoComment {...props} variant="v2" />; }
