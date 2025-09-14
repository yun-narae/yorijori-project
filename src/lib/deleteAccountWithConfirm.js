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
            { name: "post_draft", ownerField: "editor" }, // 임시저장 컬렉션 이름이 다르면 이 배열만 교체하면 됩니다.
        ],
    } = opts;

    const start = Date.now();

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
            let page = 1;
            // 페이지를 앞으로 읽어오면서 삭제. 삭제에 따라 nextPage 개념이 흔들릴 수 있어 루프 재조회.
            // 안전하게 더 이상 항목이 없을 때까지 반복.
            // (PocketBase getList는 {page, perPage, totalItems} 응답)
            // 필터 예: `editor="USER_ID"`
            // 주의: 컬렉션 규칙에 따라 권한 필요.
            // 실패는 throw 하여 상위 catch로 전달.
            for (;;) {
                const res = await pb.collection(col).getList(page, pageSize, { filter });
                const items = Array.isArray(res?.items) ? res.items : [];
                if (items.length === 0) break;

                // 병렬 삭제(실패한 항목은 로깅)
                const results = await Promise.allSettled(items.map(it => pb.collection(col).delete(it.id)));
                const failed = results.filter(r => r.status === "rejected");
                if (failed.length > 0) {
                    // 규칙/권한 문제로 일부 남을 수 있음 — 에러를 올려서 전체 프로세스를 중단하는 편을 택함
                    throw new Error(`[${col}] 일부 레코드 삭제 실패 (${failed.length}건)`);
                }

                // 다음 페이지로 진행
                page += 1;
            }
        };

        // 사용자 소유 레코드 삭제 루프
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
                throw err; // 전체 중단
            }
        }

        // 3) 계정 삭제
        await pb.collection("users").delete(userId);

        // 4) 인증 해제 & 홈으로 이동
        try {
            pb.authStore?.clear?.();
        } catch (_) {}
        if (typeof notify === "function") {
            notify("탈퇴가 완료되었습니다.", { tone: "success" });
        }
        onSuccess?.();

        if (typeof navigate === "function") {
            navigate("/", { replace: true });
        } else {
            // 라우터 navigate가 없으면 하드 리다이렉트(보조)
            window.location.assign("/");
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
