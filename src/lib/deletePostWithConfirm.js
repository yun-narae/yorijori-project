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
 * @param {(msg:string, o?:{tone?:'success'|'error'}) => void} [opts.notify] - 성공/실패 알림(토스트 등)
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

        await pb.collection("post").delete(postId);

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
