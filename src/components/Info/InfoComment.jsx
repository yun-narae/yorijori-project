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
            const res = await pb
                .collection("post_comments")
                .getList(1, 1, { filter: `post = "${pid}"` });
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

        // 1) PB 실시간: delete는 관계정보가 없을 수 있으므로 무조건 갱신
        (async () => {
            try {
                unsub = await pb.collection("post_comments").subscribe("*", (e) => {
                    if (e?.action === "delete") {
                        fetchCount(postId);
                        return;
                    }
                    const p = e?.record?.post;
                    if (p === postId) fetchCount(postId);
                });
            } catch (_) {}
        })();

        // 2) 로컬 이벤트: 목록 컴포넌트에서 수동 브로드캐스트 받을 때
        const onLocal = (ev) => {
            if (ev?.detail?.postId === postId) fetchCount(postId);
        };
        window.addEventListener("comments:changed", onLocal);

        // 초기 1회
        fetchCount(postId);

        return () => {
            try { unsub && pb.collection("post_comments").unsubscribe("*"); } catch (_) {}
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
