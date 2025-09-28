// src/lib/deletePostWithConfirm.js
import pb from "./pocketbase";

const SUBMIT_SKELETON_MIN_MS = Number(import.meta.env.VITE_SUBMIT_SKELETON_MIN_MS || 600);

export async function deletePostWithConfirm(postId, opts = {}) {
    const {
        confirm,
        confirmOptions,
        before,
        onSuccess,
        onError,
        after,
        notify,
    } = opts;

    const start = Date.now();
    const PARTICIPATION_TABLES = ["post_participation"];

    async function collectIds(col, filter, pageSize = 50) {
        try {
            const ids = [];
            for (;;) {
                const res = await pb.collection(col).getList(1, pageSize, { filter, fields: "id" });
                const items = Array.isArray(res?.items) ? res.items : [];
                if (!items.length) break;
                for (const it of items) ids.push(it.id);
                if (items.length < pageSize) break;
            }
            return ids;
        } catch {
            return []; // 컬렉션 없음/권한 없음 → 무시
        }
    }

    async function deleteByIds(col, ids) {
        if (!ids?.length) return;
        await Promise.allSettled(ids.map((id) => pb.collection(col).delete(id)));
    }

    async function collectParticipationIds(filter) {
        const set = new Set();
        for (const col of PARTICIPATION_TABLES) {
            const ids = await collectIds(col, filter);
            ids.forEach((id) => set.add(id));
        }
        return [...set];
    }
    async function deleteParticipationByIds(ids) {
        for (const col of PARTICIPATION_TABLES) {
            await deleteByIds(col, ids);
        }
    }

    try {
        if (typeof confirm !== "function") {
            console.warn("deletePostWithConfirm: confirm 함수가 필요합니다.");
            return;
        }
        const ok = await confirm({
            title: "삭제하시겠습니까?",
            description: "이 게시글과 관련 댓글/예약 기록을 삭제합니다. 되돌릴 수 없습니다.",
            confirmText: "삭제",
            cancelText: "취소",
            tone: "danger",
            ...confirmOptions,
        });
        if (!ok) return;

        before?.();

        // 0) 자식 레코드 id 선 수집
        const commentIds = await collectIds("post_comments", `post = "${postId}"`);
        const participationIds = await collectParticipationIds(`post = "${postId}"`);

        // 1) 자식부터 삭제 (권한 규칙상 게시글 작성자가 삭제 가능해야 함)
        await deleteByIds("post_comments", commentIds);
        await deleteParticipationByIds(participationIds);

        // 2) 부모(게시글) 삭제
        await pb.collection("post").delete(postId);

        notify?.("삭제되었습니다.", { tone: "success" });
        onSuccess?.();
    } catch (error) {
        console.error("[deletePostWithConfirm] 실패:", error);
        notify?.("삭제에 실패했습니다. 잠시 후 다시 시도해주세요.", { tone: "error" });
        onError?.(error);
    } finally {
        const remain = Math.max(0, SUBMIT_SKELETON_MIN_MS - (Date.now() - start));
        setTimeout(() => after?.(), remain);
    }
}
