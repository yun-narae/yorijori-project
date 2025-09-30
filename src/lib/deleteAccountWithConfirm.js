// src/lib/deleteAccountWithConfirm.js
import pb from "./pocketbase";
import { pruneAllLikesByPost } from "../hooks/useLikesStorage";

const SUBMIT_SKELETON_MIN_MS = Number(import.meta.env.VITE_SUBMIT_SKELETON_MIN_MS || 600);

/**
 * 계정 삭제(탈퇴): 내가 쓴 글/댓글/참여/좋아요 + 내 글에 달린 댓글/참여/좋아요 제거 후 계정 삭제
 * - 자식(댓글/참여/좋아요) 먼저 → 부모(게시글/계정) 나중
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
        // 필요 시 확장 컬렉션 전달 가능
        collections = [
            { name: "post", ownerField: "editor" }, // 내가 쓴 글
        ],
    } = opts;

    const start = Date.now();
    const PARTICIPATION_TABLES = ["post_participation"]; // 필요 시 추가

    /* ───────────── 공통 유틸 ───────────── */
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

    async function deleteAllWhere(col, filter, pageSize = 50) {
        for (;;) {
            const res = await pb.collection(col).getList(1, pageSize, { filter });
            const items = Array.isArray(res?.items) ? res.items : [];
            if (!items.length) break;
            await Promise.allSettled(items.map((it) => pb.collection(col).delete(it.id)));
            if (items.length < pageSize) break;
        }
    }

    function clearLocal(uid) {
        try {
            // 1) likes 캐시 — 내 것만
            ["likes_", "likes-", "likes:"].forEach((pfx) => {
                localStorage.removeItem(`${pfx}${uid}`);
            });

            // 2) draft(초안) — 새/레거시 전부 제거
            const exactKeys = [
                `draft:post:${uid}`,
                "draft:post",       // 레거시
                `post_draft:${uid}`,
                `draft_post_${uid}`,
            ];
            exactKeys.forEach((k) => localStorage.removeItem(k));

            for (let i = localStorage.length - 1; i >= 0; i--) {
                const k = localStorage.key(i);
                if (!k) continue;
                if (k === `draft:post:${uid}` || k.startsWith("draft:post")) {
                    localStorage.removeItem(k);
                }
            }

            // 3) 방송
            window.dispatchEvent(new CustomEvent("draft:cleared", { detail: { userId: uid } }));
            window.dispatchEvent(new CustomEvent("likes:changed", { detail: { userId: uid, cleared: true } }));
        } catch {}
    }

    try {
        // 0) 확인
        const ok = await (typeof confirm === "function"
            ? confirm({
                  title: "정말 탈퇴하시겠습니까?",
                  description: "작성하신 게시글/댓글/예약/좋아요 및 임시저장이 삭제되며 되돌릴 수 없습니다.",
                  confirmText: "탈퇴",
                  cancelText: "취소",
                  tone: "danger",
              })
            : Promise.resolve(window.confirm("정말 탈퇴하시겠습니까?")));
        if (!ok) return;

        before?.();

        /* 1) 선 수집 — 내 글/댓글/참여/좋아요 및 ‘내 글에 달린’ 댓글/참여/좋아요 */
        // a) 내가 쓴 글
        const myPostIds = await collectIds("post", `editor = "${userId}"`);

        // b) 내가 단 댓글 + 내 글에 달린 모든 댓글
        const myCommentIds = await collectIds("post_comments", `user = "${userId}"`);
        const commentsOnMyPosts = [];
        for (const pid of myPostIds) {
            const ids = await collectIds("post_comments", `post = "${pid}"`);
            if (ids.length) commentsOnMyPosts.push(...ids);
        }

        // c) 내가 참여한 기록 + 내 글의 참여 기록
        const myJoinIds = [];
        for (const col of PARTICIPATION_TABLES) {
            const ids = await collectIds(col, `user = "${userId}"`);
            myJoinIds.push(...ids);
        }
        const joinsOnMyPosts = [];
        for (const pid of myPostIds) {
            for (const col of PARTICIPATION_TABLES) {
                const ids = await collectIds(col, `post = "${pid}"`);
                joinsOnMyPosts.push(...ids);
            }
        }

        // d) 좋아요 — 내가 누른 좋아요 + 내 글에 달린 좋아요
        const myLikeIds = await collectIds("post_likes", `user = "${userId}"`);
        const likesOnMyPosts = [];
        for (const pid of myPostIds) {
            const ids = await collectIds("post_likes", `post = "${pid}"`);
            likesOnMyPosts.push(...ids);
        }

        /* 2) 자식 레코드부터 정리 */
        await deleteByIds("post_comments", Array.from(new Set([...myCommentIds, ...commentsOnMyPosts])));
        for (const col of PARTICIPATION_TABLES) {
            const filtered = Array.from(new Set([...myJoinIds, ...joinsOnMyPosts]));
            await deleteByIds(col, filtered);
        }
        await deleteByIds("post_likes", Array.from(new Set([...myLikeIds, ...likesOnMyPosts])));

        /* 3) 부모(내가 쓴 글) 삭제 */
        // 기본 옵션: { name:"post", ownerField:"editor" }
        for (const c of collections) {
            const name = c?.name;
            if (!name) continue;
            const filter =
                typeof c?.filter === "string" && c.filter.trim()
                    ? c.filter
                    : `${c?.ownerField ?? "editor"} = "${userId}"`;
            await deleteAllWhere(name, filter);
        }

        /* 4) 서버 계정 삭제 */
        await pb.collection("users").delete(userId);

        /* 5) 인증 해제 및 로컬 정리 (내 uid 관련 키/초안 제거) */
        try { pb.authStore?.clear?.(); } catch {}
        clearLocal(userId);

        /* 6) 🔔 이 브라우저에 남아 있는 ‘모든 유저’의 likes_* 키에서
               내가 삭제한 모든 게시글 id 제거 (0개면 키 삭제) */
        for (const pid of myPostIds) {
            pruneAllLikesByPost(pid); // 내부에서 removeItem + 이벤트 방송
        }

        notify?.("탈퇴가 완료되었습니다.", { tone: "success" });
        onSuccess?.();

        if (typeof navigate === "function") navigate("/", { replace: true });
        else window.location.replace("/");
    } catch (error) {
        const details = error?.response?.data || error?.data;
        console.error("[deleteAccountWithConfirm] 실패:", error, details);
        notify?.("탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", { tone: "error" });
        onError?.(error);
    } finally {
        const remain = Math.max(0, SUBMIT_SKELETON_MIN_MS - (Date.now() - start));
        setTimeout(() => after?.(), remain);
    }
}
