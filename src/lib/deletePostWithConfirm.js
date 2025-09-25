// src/lib/deletePostWithConfirm.js
import pb from "./pocketbase";

const SUBMIT_SKELETON_MIN_MS = Number(import.meta.env.VITE_SUBMIT_SKELETON_MIN_MS || 600);

/**
 * 게시글 삭제 (항상 커스텀 Confirm 모달 사용)
 *
 * @param {string} postId
 * @param {object} opts
 * @param {(o: {title?:string, description?:string, confirmText?:string, cancelText?:string, tone?:'default'|'danger'}) => Promise<boolean>} opts.confirm - useConfirm 훅에서 받은 confirm 함수 (필수)
 * @param {Function} [opts.before]   - 삭제 요청 전 호출
 * @param {Function} [opts.onSuccess] - 성공 시 호출
 * @param {Function} [opts.onError]  - 실패 시 호출
 * @param {Function} [opts.after]    - 로딩 스켈레톤 최소 시간 보장 후 호출
 * @param {object}   [opts.confirmOptions] - 모달 텍스트 커스터마이즈
 * @param {(msg:string, o?:{tone?:'success'|'error'|'warning'}) => void} [opts.notify] - 성공/실패/경고 알림(토스트 등)
 */
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

    // 내부 유틸: 필터로 id만 수집
    async function collectIds(col, filter, pageSize = 50) {
        const ids = [];
        for (;;) {
            const res = await pb.collection(col).getList(1, pageSize, { filter, fields: "id" });
            const items = Array.isArray(res?.items) ? res.items : [];
            if (items.length === 0) break;
            for (const it of items) ids.push(it.id);
            if (items.length < pageSize) break;
        }
        return ids;
    }

    // 내부 유틸: id 배열로 삭제(best-effort)
    async function deleteByIds(col, ids) {
        if (!ids?.length) return;
        const results = await Promise.allSettled(ids.map((id) => pb.collection(col).delete(id)));
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length) {
            console.warn(`[${col}] 일부 레코드 삭제 실패 (${failed.length}건)`);
        }
    }

    try {
        // ✅ 항상 네가 만든 Confirm 모달만 사용
        if (typeof confirm !== "function") {
            console.warn(
                "deletePostWithConfirm: confirm 함수가 없습니다. useConfirm()으로 가져온 confirm을 opts.confirm에 전달하세요."
            );
            return; // confirm 없으면 아무 것도 하지 않음 (디자인 유지)
        }

        const ok = await confirm({
            title: "삭제하시겠습니까?",
            description: "이 게시글을 삭제합니다. 삭제 후 되돌릴 수 없습니다.",
            confirmText: "삭제",
            cancelText: "취소",
            tone: "danger",
            ...confirmOptions,
        });
        if (!ok) return;

        before?.();

        // ★ 0) 댓글 id를 먼저 수집 (이후 post가 삭제되면 post=N/A가 되어 필터가 안먹음)
        const commentIds = await collectIds("post_comments", `post = "${postId}"`);

        // ★ 1) 게시글 먼저 삭제 (실패 시 전체 실패로 처리하고 댓글은 건드리지 않음)
        try {
            await pb.collection("post").delete(postId);
        } catch (err) {
            const code = err?.status || err?.response?.status || err?.data?.code;
            const notFound = code === 404 || err?.response?.code === 404 || err?.data?.code === 404;
            if (!notFound) {
                throw err; // 권한(403) 등은 그대로 실패 처리
            }
        }

        // ★ 2) 수집해둔 id로 댓글 정리(best-effort)
        try {
            await deleteByIds("post_comments", commentIds);
        } catch (err) {
            console.error("[deletePost] post_comments 정리 중 오류:", err);
            if (typeof notify === "function") {
                notify("댓글 정리 중 일부 오류가 있었지만 게시글은 삭제되었습니다.", { tone: "warning" });
            }
        }

        if (typeof notify === "function") {
            notify("삭제되었습니다.", { tone: "success" });
        }
        onSuccess?.();
    } catch (error) {
        const details = error?.response?.data || error?.data;
        console.error("삭제 실패:", error);
        console.error("PocketBase details:", details);

        if (typeof notify === "function") {
            notify("삭제에 실패했습니다. 잠시 후 다시 시도해주세요.", { tone: "error" });
        }
        onError?.(error);
    } finally {
        const elapsed = Date.now() - start;
        const remain = Math.max(0, SUBMIT_SKELETON_MIN_MS - elapsed);
        setTimeout(() => after?.(), remain);
    }
}
