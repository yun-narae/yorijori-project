// src/lib/deleteAccountWithConfirm.js
import pb from "./pocketbase";

const SUBMIT_SKELETON_MIN_MS = Number(import.meta.env.VITE_SUBMIT_SKELETON_MIN_MS || 600);

/**
 * 계정 삭제(탈퇴) 유틸 - 관련 레코드(게시글/임시저장 등) 먼저 삭제 후 계정 삭제
 *
 * @param {string} userId                            // 현재 탈퇴 대상 유저 id
 * @param {object} opts
 * @param {(o:{title?:string,description?:string,confirmText?:string,cancelText?:string,tone?:'default'|'danger'})=>Promise<boolean>} [opts.confirm]
 * @param {(msg:string, o?:{tone?:'success'|'error'})=>void} [opts.notify]
 * @param {Function} [opts.before]                   // 네트워크 전
 * @param {Function} [opts.after]                    // 스켈레톤 최소 노출 보장 후
 * @param {Function} [opts.onSuccess]                // 전부 성공 시
 * @param {(err:any)=>void} [opts.onError]           // 실패 시
 * @param {(path:string, o?:{replace?:boolean})=>void} [opts.navigate] // react-router navigate
 *
 * @param {Array<{name:string, ownerField?:string, filter?:string}>} [opts.collections]
 *   - 삭제할 관련 컬렉션 목록
 *   - ownerField: 기본은 "editor" (해당 필드가 userId인 레코드 삭제)
 *   - filter: 직접 필터 문자열을 주면 ownerField 대신 사용됨
 *
 * 기본 컬렉션:
 *   post(작성글), post_draft(임시저장) 를 대상으로 함
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
        collections = [
            { name: "post", ownerField: "editor" },
            { name: "post_draft", ownerField: "editor" },
            // 주의: post_comments는 아래에서 ID 기반으로 따로 정리하므로 기본 배열에는 넣지 않음
        ],
    } = opts;

    const start = Date.now();

    // 공통 유틸: 필터로 id 수집
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

    // 공통 유틸: id 배열로 삭제(best-effort)
    async function deleteByIds(col, ids) {
        if (!ids?.length) return;
        const results = await Promise.allSettled(ids.map((id) => pb.collection(col).delete(id)));
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length) {
            console.warn(`[${col}] 일부 레코드 삭제 실패 (${failed.length}건)`);
        }
    }

    // 공통 유틸: 필터로 페이지 순회 삭제(권한 허용 범위에서만 동작)
    const deleteAllWhere = async (col, filter, pageSize = 50) => {
        for (;;) {
            const res = await pb.collection(col).getList(1, pageSize, { filter });
            const items = Array.isArray(res?.items) ? res.items : [];
            if (items.length === 0) break;

            const results = await Promise.allSettled(
                items.map((it) => pb.collection(col).delete(it.id))
            );
            const failed = results.filter((r) => r.status === "rejected");
            if (failed.length > 0) {
                throw new Error(`[${col}] 일부 레코드 삭제 실패 (${failed.length}건)`);
            }
        }
    };

    // ✅ 탈퇴 유저 본인 것만 지우는 로컬 정리
    function clearLocalForUser(uid) {
        try {
            // 1) 좋아요 캐시: 해당 유저 것만 제거
            const likeKey = `likes_${uid}`;
            localStorage.removeItem(likeKey);

            // (혹시 예전 포맷을 쓴 적이 있다면 함께 정리)
            localStorage.removeItem(`likes-${uid}`);
            localStorage.removeItem(`likes:${uid}`);

            // 2) 그 외 유저 소유 로컬 값(선택) — 본인일 때만 제거
            if (localStorage.getItem("userId") === uid) {
                localStorage.removeItem("userId");
            }

            // 3) 같은 탭 즉시 반영 + 다른 탭에도 동기화 알림
            try {
                window.dispatchEvent(
                    new CustomEvent("likes:changed", {
                        detail: { userId: uid, cleared: true },
                    })
                );
                // storage 이벤트는 다른 탭에서만 자동 발생하므로 수동 트리거(최소 호환)
                window.dispatchEvent(new Event("storage"));
            } catch (_) {}
        } catch (e) {
            console.warn("clearLocalForUser failed:", e);
        }
    }

    try {
        // 1) 확인 모달
        let ok = true;
        if (typeof confirm === "function") {
            ok = await confirm({
                title: "정말 탈퇴하시겠습니까?",
                description: "작성하신 게시글, 임시저장 등 모든 데이터가 삭제되며 되돌릴 수 없습니다.",
                confirmText: "탈퇴",
                cancelText: "취소",
                tone: "danger",
            });
        } else {
            ok = window.confirm("정말 탈퇴하시겠습니까?");
        }
        if (!ok) return;

        before?.();

        // 2) 🔎 선(先) 수집 — 포스트/유저 삭제 전에 댓글 id를 모두 확보
        //    - a) 본인이 작성한 게시글 id
        const ownedPostIds = await collectIds("post", `editor = "${userId}"`);
        //    - b) 본인이 단 댓글
        const commentIdsByUser = await collectIds("post_comments", `user = "${userId}"`);
        //    - c) 본인 게시글에 달린 모든 댓글(다른 사람이 단 것 포함)
        const commentIdsOnOwnedPosts = [];
        for (const pid of ownedPostIds) {
            const ids = await collectIds("post_comments", `post = "${pid}"`);
            if (ids.length) commentIdsOnOwnedPosts.push(...ids);
        }
        const allCommentIds = Array.from(new Set([...commentIdsByUser, ...commentIdsOnOwnedPosts]));

        // 3) 관련 레코드 일괄 삭제 (post_comments는 아래에서 id 기반으로 별도 처리)
        for (const c of collections) {
            const name = c?.name;
            if (!name) continue;
            if (name === "post_comments") continue; // 안전장치

            const filter =
                typeof c?.filter === "string" && c.filter.trim().length > 0
                    ? c.filter
                    : `${c?.ownerField ?? "editor"} = "${userId}"`;

            try {
                await deleteAllWhere(name, filter);
            } catch (err) {
                console.error(`[deleteAccount] ${name} 삭제 중 오류:`, err);
                throw err;
            }
        }

        // 4) 🧹 수집한 id로 댓글 정리(베스트에포트)
        //    - 권한 규칙에 따라 일부는 403이 날 수 있음(아래 'API Rule' 참고)
        try {
            await deleteByIds("post_comments", allCommentIds);
        } catch (err) {
            console.error("[deleteAccount] post_comments 정리 중 오류:", err);
            // 계속 진행(최종 유저 삭제는 수행)
        }

        // 5) 서버 계정 삭제
        await pb.collection("users").delete(userId);

        // 6) 인증 해제 & 로컬 정리(해당 유저의 likes_*만 제거)
        try {
            pb.authStore?.clear?.();
        } catch (_) {}
        clearLocalForUser(userId);

        if (typeof notify === "function") {
            notify("탈퇴가 완료되었습니다.", { tone: "success" });
        }
        onSuccess?.();

        // 7) 홈으로 이동
        if (typeof navigate === "function") {
            navigate("/", { replace: true });
        } else {
            window.location.replace("/");
        }
    } catch (error) {
        const details = error?.response?.data || error?.data;
        console.error("탈퇴 실패:", error);
        console.error("PocketBase details:", details);

        if (typeof notify === "function") {
            notify("탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.", { tone: "error" });
        }
        onError?.(error);
    } finally {
        const elapsed = Date.now() - start;
        const remain = Math.max(0, SUBMIT_SKELETON_MIN_MS - elapsed);
        setTimeout(() => after?.(), remain);
    }
}
