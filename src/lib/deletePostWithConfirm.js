// src/lib/deletePostWithConfirm.js
import pb from "./pocketbase";
// ✅ likes 스토리지 유틸(훅 없이 쓸 수 있는 순수 함수)
import { removeLikeId, writeLikes } from "../hooks/useLikesStorage";

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
        userId,
    } = opts;

    const start = Date.now();
    const PARTICIPATION_TABLES = ["post_participation"];

    function getCurrentUserId() {
        try {
        const id = localStorage.getItem("userid");
        if (id) return id;
        const raw = localStorage.getItem("pocketbase_auth");
        if (raw) return JSON.parse(raw)?.model?.id || null;
        } catch {}
        return null;
    }

    // ✅ 로컬 찜 목록에서 해당 post 제거 (0개면 key 삭제까지 자동)
    function removeLikeSnapshot(uid, pid) {
        if (!uid || !pid) return;
        try {
        removeLikeId(uid, pid); // 내부에서 비면 removeItem
        // (선택) 하트 아이콘 즉시 동기화용 이벤트
        window.dispatchEvent(
            new CustomEvent("likes:changed", {
            detail: { userId: uid, postId: pid, liked: false },
            })
        );
        } catch {}
    }

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

    try {
        if (typeof confirm !== "function") {
        console.warn("deletePostWithConfirm: confirm 함수가 필요합니다.");
        return;
        }
        const ok = await confirm({
        title: "삭제하시겠습니까?",
        description: "이 게시글과 관련 댓글/예약/좋아요 기록을 삭제합니다. 되돌릴 수 없습니다.",
        confirmText: "삭제",
        cancelText: "취소",
        tone: "danger",
        ...confirmOptions,
        });
        if (!ok) return;

        before?.();

        // 0) 자식 레코드 id 수집
        const commentIds       = await collectIds("post_comments", `post = "${postId}"`);
        const likeIds          = await collectIds("post_likes",    `post = "${postId}"`); // ✅ 추가
        const participationIds = await collectParticipationIds(     `post = "${postId}"`);

        // 1) 자식부터 삭제
        await deleteByIds("post_comments", commentIds);
        await deleteByIds("post_likes", likeIds);                   // ✅ 추가
        await deleteParticipationByIds(participationIds);

        // 2) 부모(게시글) 삭제
        await pb.collection("post").delete(postId);

        // 3) 내 로컬 찜 스냅샷 정리 (0개면 키 삭제)
        const uid = userId || getCurrentUserId();
        removeLikeSnapshot(uid, postId);

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
