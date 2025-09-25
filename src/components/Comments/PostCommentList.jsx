import React from "react";
import pb from "../../lib/pocketbase";
import InfoHeaderRowGroup from "../Info/InfoHeaderRowGroup";

function formatRelative(iso) {
    if (!iso) return "";
    const t = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, Math.floor((now - t) / 1000)); // sec
    if (diff < 60) return "방금 전";
    const m = Math.floor(diff / 60);
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    const d = Math.floor(h / 24);
    return `${d}일 전`;
}

/**
 * 특정 postId에 달린 댓글 목록을 최신순으로 보여줍니다.
 * - 지금 단계: 시간 노출 + 수정/삭제 UI만 우선 추가
 * - 다음 단계: 실제 수정/삭제 동작 연결
 */
export default function PostCommentList({ postId, currentUser }) {
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [editingId, setEditingId] = React.useState(null);
    const [draft, setDraft] = React.useState("");

    const fetchList = React.useCallback(async () => {
        if (!postId) return;
        setLoading(true);
        try {
            const res = await pb.collection("post_comments").getList(1, 50, {
                filter: `post = "${postId}"`,
                sort: "-created",
                expand: "user",
            });
            setItems(Array.isArray(res?.items) ? res.items : []);
        } catch (err) {
            console.error("댓글 목록 불러오기 실패:", err);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    React.useEffect(() => {
        let unsub = null;
        fetchList();
        (async () => {
            try {
                unsub = await pb.collection("post_comments").subscribe("*", (e) => {
                    const p = e?.record?.post;
                    if (p === postId) fetchList();
                });
            } catch (_) {}
        })();
        return () => {
            try { unsub && pb.collection("post_comments").unsubscribe("*"); } catch (_) {}
        };
    }, [postId, fetchList]);

    function beginEdit(item) {
        setEditingId(item.id);
        setDraft(item.comment || "");
    }
    function cancelEdit() {
        setEditingId(null);
        setDraft("");
    }
    async function saveEdit() {
        // ★ 다음 단계에서 pb.collection("post_comments").update(editingId, { comment: draft }) 연결
        // 지금은 UI만: 저장 눌러도 편집 종료만 수행
        setEditingId(null);
        setDraft("");
        // fetchList();  // 실제 연결 시 유지
    }
    async function handleDelete(item) {
        // ★ 다음 단계에서 실제 삭제 연결
        // confirm 모달 후 delete 진행 예정
        console.log("TODO: delete", item.id);
    }

    if (!postId) return null;

    if (loading) {
        return (
            <ul className="flex flex-col gap-3">
                <li className="text-[var(--color-gray-5)]">불러오는 중…</li>
            </ul>
        );
    }

    if (items.length === 0) {
        return (
            <ul className="flex flex-col gap-3">
                <li className="text-[var(--color-gray-5)]">첫 댓글을 남겨보세요!</li>
            </ul>
        );
    }

    return (
        <ul className="flex flex-col gap-3">
            {items.map((it) => {
                const author = it?.expand?.user ?? null;
                const isMine = currentUser?.id && it?.user === currentUser.id;
                const isEditing = editingId === it.id;

                return (
                    <li key={it.id} className="flex flex-col gap-2">
                        {/* 헤더 영역: 작성자 / 우측 액션 */}
                        <div className="flex items-start justify-between">
                            <div className="min-w-0">
                                <InfoHeaderRowGroup
                                    post={null}
                                    currentUserId={currentUser?.id}
                                    author={author}
                                    createdAt={it?.created}     // 작성시각
                                    updatedAt={it?.updated}     // 수정시각
                                    showSvgIcon={false}
                                    showStatusBadge={false}
                                    showEditAndDelete={false}
                                />
                            </div>

                            {isMine ? (
                                <div className="flex shrink-0 items-center gap-3 text-[var(--color-gray-6)] text-mo-text tablet:text-tab-text desktop:text-pc-text">
                                    {!isEditing ? (
                                        <>
                                            <button
                                                type="button"
                                                className="hover:opacity-80"
                                                onClick={() => beginEdit(it)}
                                            >
                                                수정
                                            </button>
                                            <button
                                                type="button"
                                                className="hover:opacity-80"
                                                onClick={() => handleDelete(it)}
                                            >
                                                삭제
                                            </button>
                                        </>
                                    ) : null}
                                </div>
                            ) : null}
                        </div>

                        {/* 본문 / 편집 UI */}
                        {!isEditing ? (
                            <p className="text-[var(--color-gray-7)] text-mo-text tablet:text-tab-text desktop:text-pc-text break-words">
                                {it.comment}
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <textarea
                                    className="w-full rounded-[10px] bg-[var(--color-gray-1)] px-4 py-3 outline-none text-[var(--color-gray-7)] text-mo-text tablet:text-tab-text desktop:text-pc-text"
                                    maxLength={300}
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    placeholder="최대 300자까지 가능해요."
                                />
                                <div className="flex items-center gap-2 self-end">
                                    <button
                                        type="button"
                                        className="px-3 py-1 rounded-[8px] bg-[var(--color-primary)] text-[var(--color-gray-0)] hover:opacity-90"
                                        onClick={saveEdit}
                                    >
                                        저장
                                    </button>
                                    <button
                                        type="button"
                                        className="px-3 py-1 rounded-[8px] bg-[var(--color-gray-2)] text-[var(--color-gray-7)] hover:opacity-90"
                                        onClick={cancelEdit}
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        )}

                        <span className="h-[1px] w-full bg-[var(--color-gray-2)]" />
                    </li>
                );
            })}
        </ul>
    );
}
