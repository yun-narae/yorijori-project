// src/lib/deletePostWithConfirm.js
import pb from "./pocketbase";

const SUBMIT_SKELETON_MIN_MS = Number(import.meta.env.VITE_SUBMIT_SKELETON_MIN_MS || 600);

export async function deletePostWithConfirm(postId, opts = {}) {
    const start = Date.now();
    try {
        const ok = window.confirm("삭제하겠습니까?");
        if (!ok) return;

        opts.before?.();
        await pb.collection("post").delete(postId);
        window.alert("삭제되었습니다.");
        opts.onSuccess?.();
    } catch (error) {
        const details = error?.response?.data || error?.data;
        console.error("삭제 실패:", error);
        console.error("PocketBase details:", details);
        window.alert("삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
        opts.onError?.(error);
    } finally {
        const elapsed = Date.now() - start;
        const remain = Math.max(0, SUBMIT_SKELETON_MIN_MS - elapsed);
        setTimeout(() => opts.after?.(), remain);
    }
}
