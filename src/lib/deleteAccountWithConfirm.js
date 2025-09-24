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
        ],
    } = opts;

    const start = Date.now();

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

        // 2) 관련 레코드 일괄 삭제
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

        for (const c of collections) {
            const name = c?.name;
            if (!name) continue;

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

        // 3) 서버 계정 삭제
        await pb.collection("users").delete(userId);

        // 4) 인증 해제 & 로컬 정리(해당 유저의 likes_*만 제거)
        try {
            pb.authStore?.clear?.();
        } catch (_) {}
        clearLocalForUser(userId);

        if (typeof notify === "function") {
            notify("탈퇴가 완료되었습니다.", { tone: "success" });
        }
        onSuccess?.();

        // 5) 홈으로 이동
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
