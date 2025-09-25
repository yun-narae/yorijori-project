import React from "react";
import pb from "../../lib/pocketbase";

export default function InfoComment({
    count = 0,
    className = "",
    infoCommentColor,
    infoCommentSize,
    variant = "v1", // "v1" | "v2"
    postId, // ★ 추가: post_comments에서 합계를 가져오기 위한 postId
}) {
    const [liveCount, setLiveCount] = React.useState(count);
    const baseClass = ["flex items-center gap-[3px]", className].join(" ");
    const textClass = `${infoCommentColor} ${infoCommentSize}`;

    // ★ postId가 주어지면 post_comments를 통해 합계를 조회하고, 실시간으로 반영
    React.useEffect(() => {
        let mounted = true;
        let unsub = null;

        async function fetchCount(pid) {
            try {
                // 1개 페이지만 받아도 totalItems로 전체 개수를 얻을 수 있음
                const res = await pb
                    .collection("post_comments")
                    .getList(1, 1, { filter: `post = "${pid}"` });
                if (!mounted) return;
                setLiveCount(Number(res?.totalItems || 0));
            } catch (_) {
                if (!mounted) return;
                setLiveCount(count);
            }
        }

        async function subscribeRealtime(pid) {
            try {
                unsub = await pb
                    .collection("post_comments")
                    .subscribe("*", (e) => {
                        // 해당 post에 대한 변경만 반영
                        const p = e?.record?.post;
                        if (!p) return;
                        // record.post가 단일 relation이면 문자열 id
                        if (p === pid) {
                            // 변경마다 다시 total을 가져오는 방식(안전)
                            fetchCount(pid);
                        }
                    });
            } catch (_) {}
        }

        if (postId) {
            fetchCount(postId);
            subscribeRealtime(postId);
        } else {
            setLiveCount(count);
        }

        return () => {
            mounted = false;
            try { unsub && pb.collection("post_comments").unsubscribe("*"); } catch (_) {}
        };
    }, [postId, count]);

    const displayCount = postId ? liveCount : count;

    if (variant === "v2") {
        // 예: "12개의 댓글"
        return (
            <div className={baseClass}>
                <span className={textClass}>{displayCount}</span>
                <span className={textClass}>개의</span>
                <span className={`${textClass} whitespace-nowrap`}>댓글</span>
            </div>
        );
    }

    // v1 (기본): "댓글 12"
    return (
        <div className={baseClass}>
            <span className={`${textClass} whitespace-nowrap`}>댓글</span>
            <span className={textClass}>{displayCount}</span>
        </div>
    );
}

// 편의용 별칭
export function InfoCommentV1(props) {
    return <InfoComment {...props} variant="v1" />;
}
export function InfoCommentV2(props) {
    return <InfoComment {...props} variant="v2" />;
}
