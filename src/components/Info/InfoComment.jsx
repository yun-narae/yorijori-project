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
    const baseClass = ["flex items-center gap-[3px]", className].join(" ");
    const textClass = `${infoCommentColor} ${infoCommentSize}`;

    async function fetchCount(pid) {
        try {
            const res = await pb.collection("post_comments").getList(1, 1, {
                filter: `post = "${pid}"`,
            });
            setLiveCount(Number(res?.totalItems || 0));
        } catch {
            setLiveCount(count);
        }
    }

    React.useEffect(() => {
        if (!postId) {
            setLiveCount(count);
            return;
        }

        let unsub = null;

        // 1) PB 실시간: create/delete는 즉시 증감, 그 외는 필요 시 재조회
        (async () => {
            try {
                unsub = await pb.collection("post_comments").subscribe("*", (e) => {
                    const rec = e?.record;
                    const p = rec?.post;
                    if (p !== postId) return;

                    if (e.action === "create") {
                        // 등록 즉시 +1
                        setLiveCount((n) => n + 1);
                        return;
                    }
                    if (e.action === "delete") {
                        // 삭제 즉시 -1 (하한 0)
                        setLiveCount((n) => Math.max(0, n - 1));
                        return;
                    }

                    fetchCount(postId);
                });
            } catch (_) {}
        })();

        // 2) 로컬 이벤트: 폼/아이템에서 쏘는 comments:changed 수신
        const onLocal = (ev) => {
            const d = ev?.detail || {};
            if (d.postId !== postId) return;

            // 폼에서 생성 성공 시 { postId, created } 형태로 브로드캐스트 권장
            if (d.created && d.created.post === postId) {
                // 등록 즉시 +1
                setLiveCount((n) => n + 1);
                return;
            }

            // 삭제를 로컬에서 방송하는 경우 { postId, deletedId } 같이 넣었다면 즉시 -1
            if (d.deletedId) {
                setLiveCount((n) => Math.max(0, n - 1));
                return;
            }

            // 기타 케이스는 안전하게 재조회
            fetchCount(postId);
        };
        window.addEventListener("comments:changed", onLocal);

        // 초기 1회 정확한 값으로 세팅
        fetchCount(postId);

        return () => {
            try {
                if (unsub) pb.collection("post_comments").unsubscribe("*");
            } catch (_) {}
            window.removeEventListener("comments:changed", onLocal);
        };
    }, [postId, count]);

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
