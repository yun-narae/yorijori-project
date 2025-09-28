// src/lib/deleteAccountWithConfirm.js
import pb from "./pocketbase";

const SUBMIT_SKELETON_MIN_MS = Number(import.meta.env.VITE_SUBMIT_SKELETON_MIN_MS || 600);

/**
 * 계정 삭제(탈퇴): 내가 쓴 글/임시글 + 내가 단 댓글/참여 + 내 글에 달린 댓글/참여 → 계정 삭제
 * - 자식(댓글/참여) 먼저, 부모(게시글/계정) 나중
 */
export async function deleteAccountWithConfirm(userId, opts = {}) {
    const {
        confirm,
        notify,
        before,
        after,
        onSuccess,
        onError,
        navigate,
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
            return [];
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

    // 로컬 좋아요 캐시 등 정리
    function clearLocal(uid) {
        try {
            const keys = [`likes_${uid}`, `likes-${uid}`, `likes:${uid}`];
            keys.forEach((k) => localStorage.removeItem(k));
        } catch {}
    }

    try {
        const ok = await (typeof confirm === "function"
            ? confirm({
                  title: "정말 탈퇴하시겠습니까?",
                  description: "작성한 게시글/임시저장/참여/댓글이 삭제되며 되돌릴 수 없습니다.",
                  confirmText: "탈퇴",
                  cancelText: "취소",
                  tone: "danger",
              })
            : Promise.resolve(window.confirm("정말 탈퇴하시겠습니까?")));
        if (!ok) return;

        before?.();

        // 0) 내가 쓴 글 id
        const myPostIds = await collectIds("post", `editor = "${userId}"`);

        // 1) 자식 먼저 모두 수집
        const myCommentIds = await collectIds("post_comments", `user = "${userId}"`);
        const myJoinIds = await collectParticipationIds(`user = "${userId}"`);

        const commentsOnMyPosts = [];
        const joinsOnMyPosts = [];
        for (const pid of myPostIds) {
            const cids = await collectIds("post_comments", `post = "${pid}"`);
            if (cids.length) commentsOnMyPosts.push(...cids);

            const jids = await collectParticipationIds(`post = "${pid}"`);
            if (jids.length) joinsOnMyPosts.push(...jids);
        }

        // 2) 자식 삭제 (내가 쓴 것 + 내 글에 달린 것)
        await deleteByIds("post_comments", [...new Set([...myCommentIds, ...commentsOnMyPosts])]);
        await deleteParticipationByIds([...new Set([...myJoinIds, ...joinsOnMyPosts])]);

        // 3) 부모(내가 쓴 글/임시글 등) 삭제
        await Promise.allSettled(
            myPostIds.map((id) => pb.collection("post").delete(id))
        );
        await Promise.allSettled(
            (await collectIds("post_draft", `editor = "${userId}"`))
                .map((id) => pb.collection("post_draft").delete(id))
        );

        // 4) 계정 삭제
        await pb.collection("users").delete(userId);

        // 5) 인증/로컬 정리
        try { pb.authStore?.clear?.(); } catch {}
        clearLocal(userId);

        notify?.("탈퇴가 완료되었습니다.", { tone: "success" });
        onSuccess?.();

        if (typeof navigate === "function") navigate("/", { replace: true });
        else window.location.replace("/");
    } catch (error) {
        console.error("[deleteAccountWithConfirm] 실패:", error);
        notify?.("탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", { tone: "error" });
        onError?.(error);
    } finally {
        const remain = Math.max(0, SUBMIT_SKELETON_MIN_MS - (Date.now() - start));
        setTimeout(() => after?.(), remain);
    }
}
