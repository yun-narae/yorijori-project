// src/components/Comments/PostCommentList.jsx
import React from "react";
import pb from "../../lib/pocketbase";
import InfoHeaderRowGroup from "../Info/InfoHeaderRowGroup";
import Input from "../Input/Input";
import CustomButton from "../CustomButton/CustomButton";
import { useConfirm } from "../Modal/ConfirmProvider";

/**
 * 특정 postId에 달린 댓글 목록을 최신순으로 보여줍니다.
 * - 수정/삭제 PB 연동 완료
 */
export default function PostCommentList({ postId, currentUser }) {
    const [items, setItems] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [editingId, setEditingId] = React.useState(null);
    const [draft, setDraft] = React.useState("");
    const [saving, setSaving] = React.useState(false);
    const [deletingId, setDeletingId] = React.useState(null);
    const confirm = useConfirm();

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
        
        // 1) PB 실시간
        (async () => {
          try {
            unsub = await pb.collection("post_comments").subscribe("*", (e) => {
              if (e?.record?.post === postId) fetchList();
            });
          } catch (_) {}
        })();
        
        // 2) 로컬(동일 탭) 등록/수정/삭제 신호
        const onLocal = (ev) => {
            const d = ev?.detail || {};
            if (d.postId !== postId) return;
            
            if (d.updated && d.updated.post === postId) {
                setItems((prev) => prev.map((c) => (c.id === d.updated.id ? d.updated : c)));
                return;
            }

            // created가 있으면 낙관적으로 앞에 붙이고, 없으면 전체 새로고침
            if (d.created && d.created.post === postId) {
                setItems((prev) => {
                // 중복 방지
                if (prev.some((it) => it.id === d.created.id)) return prev;
                return [d.created, ...prev];
                });
            } else {
                fetchList();
            }
        };
        
        window.addEventListener("comments:changed", onLocal);
        
        return () => {
          window.removeEventListener("comments:changed", onLocal);
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
        setSaving(false);
    }

    // 수정
    async function saveEdit() {
        if (!editingId) return;
        const content = draft.trim();
      
        if (content.length === 0) {
          confirm({ title: "내용을 입력하세요." });
          return;
        }
        if (content.length > 300) {
          confirm({ title: "최대 300자까지 가능합니다." });
          return;
        }
      
        try {
          setSaving(true);
      
          // 서버 업데이트
          const updated = await pb
            .collection("post_comments")
            .update(editingId, { comment: content });
      
          // 1) 동일 탭 즉시 반영(리스트 교체)
          setItems((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      
          // 2) 다른 컴포넌트(리스트/카운터)가 듣도록 브로드캐스트
          window.dispatchEvent(
            new CustomEvent("comments:changed", {
              detail: { postId: updated.post, updated },
            })
          );
      
          // 편집 종료
          setEditingId(null);
          setDraft("");
        } catch (err) {
          console.error("댓글 수정 실패:", err);
          confirm({ title: "수정 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." });
        } finally {
          setSaving(false);
        }
    }

    async function handleDelete(item) {
        if (!item?.id) return;

        const ok = await confirm({
            title: "댓글을 삭제하시겠어요?",
            confirmText: "삭제",
            cancelText: "취소",
        });
        if (!ok) return;

        try {
            setDeletingId(item.id);
            await pb.collection("post_comments").delete(item.id);
            await fetchList();
            window.dispatchEvent(new CustomEvent("comments:changed", { detail: { postId } }));
        } catch (err) {
            console.error("댓글 삭제 실패:", err);
            confirm({
                title: "삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
            });
        } finally {
            setDeletingId(null);
        }
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
            {items.map((it, index) => {
                const author = it?.expand?.user ?? null;
                const isMine = currentUser?.id && it?.user === currentUser.id;
                const isEditing = editingId === it.id;
                const isDeleting = deletingId === it.id;

                return (
                    <li key={it.id} className="flex flex-col gap-2">
                        {/* 헤더 */}
                        <div className="flex items-start justify-between">
                            <div className="min-w-0">
                                <InfoHeaderRowGroup
                                    post={null}
                                    currentUserId={currentUser?.id}
                                    author={author}
                                    createdAt={it?.created}
                                    updatedAt={it?.updated}
                                    showSvgIcon={false}
                                    showStatusBadge={false}
                                    showEditAndDelete={false}
                                />
                            </div>

                            {isMine ? (
                                <div className="flex shrink-0 items-center gap-3 text-mo-text tablet:text-tab-text desktop:text-pc-text">
                                    {!isEditing ? (
                                        <>
                                            <CustomButton 
                                                variant="tertiary"
                                                text="수정"
                                                onClick={() => beginEdit(it)}
                                                basebuttonClass="group hover:!bg-transparent !p-0"
                                                basebuttontextClass="!text-[var(--color-gray-6)] group-hover:!text-[var(--color-gray-4)]"
                                            />
                                            <CustomButton 
                                                variant="tertiary"
                                                text={isDeleting ? "삭제중…" : "삭제"}
                                                onClick={() => handleDelete(it)}
                                                basebuttonClass="group hover:!bg-transparent !p-0"
                                                basebuttontextClass="!text-[var(--color-gray-6)] group-hover:!text-[var(--color-gray-4)]"
                                            />
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
                                <Input
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    placeholder="최대 300자까지 가능해요."
                                    name="요리모임에 대한 소개"
                                    textarea
                                    disabled={saving}
                                />
                                <div className="flex shrink-0 items-center justify-end gap-3 text-[var(--color-gray-6)] text-mo-text tablet:text-tab-text desktop:text-pc-text">
                                    <CustomButton 
                                        variant="tertiary"
                                        text={saving ? "저장중…" : "저장"}
                                        onClick={saveEdit}
                                        custombuttonClass="!w-fit"
                                        basebuttonClass="group hover:!bg-transparent !p-0"
                                        basebuttontextClass="!text-[var(--color-gray-6)] group-hover:!text-[var(--color-gray-4)]"
                                    />
                                    <CustomButton 
                                        variant="tertiary"
                                        text="취소"
                                        onClick={cancelEdit}
                                        custombuttonClass="!w-fit"
                                        basebuttonClass="group hover:!bg-transparent !p-0"
                                        basebuttontextClass="!text-[var(--color-gray-6)] group-hover:!text-[var(--color-gray-4)]"
                                    />
                                </div>
                            </div>
                        )}

                        {items.length > 1 && index < items.length - 1 && (
                            <span className="h-[1px] w-full bg-[var(--color-gray-2)]" />
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
