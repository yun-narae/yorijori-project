import React from "react";
import pb from "../../lib/pocketbase";
import { useAuth } from "../../contexts/AuthContext";
import Input from "../Input/Input";
import CustomButton from "../CustomButton/CustomButton";
import { useConfirm } from "../Modal/ConfirmProvider";

/**
 * PostDetail에 포함해서 사용하는 댓글 등록 폼
 * - postId: 필수 (어떤 게시물에 달 댓글인지)
 * - onCreated: 성공 시 호출 (목록/카운트 갱신용)
 */
export default function PostCommentForm({ postId, onCreated, className = "" }) {
    const { user } = useAuth();
    const [comment, setComment] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);
    const confirm = useConfirm();

    const canSubmit = !!user?.id && !!postId && comment.trim().length > 0 && comment.length <= 300;

    async function handleSubmit(e) {
        e?.preventDefault?.();
        if (!canSubmit || submitting) return;

        try {
            setSubmitting(true);

            await pb.collection("post_comments").create({
                post: postId,
                user: user.id,
                comment: comment.trim(),
            });

            setComment("");

            window.dispatchEvent(new CustomEvent("comments:changed", { detail: { postId } }));

            onCreated?.(); // 외부(목록/카운트) 갱신 트리거
        } catch (err) {
            console.error("댓글 등록 실패:", err);
            confirm({
                title: "댓글 등록 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className={["flex flex-col gap-2", className].join(" ")}>
            <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="최대 300자까지 가능해요."
                name="요리모임에 대한 소개"
                textarea
                disabled={submitting}
            />
            <CustomButton
                text="댓글 작성"
                size="sm"
                custombuttonClass="self-end !w-[70px]"
                type="submit"
                disabled={!canSubmit || submitting}
            />
        </form>
    );
}
