// 4-space indent 유지
import { useCallback, useEffect, useState } from "react";

export const likesKey = (uid) => `likes_${uid}`;

/* ============== 순수 유틸 (리액트X, 어디서든 사용 가능) ============== */
export function readLikes(uid) {
    try {
        const raw = localStorage.getItem(likesKey(uid));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function writeLikes(uid, list, { broadcast = true } = {}) {
    try {
        if (localStorage.getItem("__likes_block__") === "1") return;
        const key = likesKey(uid);

        if (!Array.isArray(list) || list.length === 0) {
            localStorage.removeItem(key);               // ✅ 비면 key 삭제
        } else {
            localStorage.setItem(key, JSON.stringify(list));
        }

        if (broadcast) {
            window.dispatchEvent(new CustomEvent("likes:changed", {
                detail: { userId: uid, list: list || [] },
            }));
        }
    } catch {}
}

export function addLikeId(uid, postId, opts) {
    const list = readLikes(uid);
    if (!list.some((it) => String(it?.id) === String(postId))) {
        writeLikes(uid, [...list, { id: String(postId) }], opts);
    }
}

export function removeLikeId(uid, postId, opts) {
    const list = readLikes(uid);
    const next = list.filter((it) => String(it?.id) !== String(postId));
    writeLikes(uid, next, opts); // 내부에서 0개면 키 삭제
}

export function pruneLikes(uid, existingIds = [], opts) {
    const set = new Set((existingIds || []).map(String));
    const list = readLikes(uid);
    const next = list.filter((it) => set.has(String(it?.id)));
    writeLikes(uid, next, opts);
}

export function blockLikesWrites(enable = true) {
    if (enable) localStorage.setItem("__likes_block__", "1");
    else localStorage.removeItem("__likes_block__");
}

/* ===================== 훅 (컴포넌트에서 사용) ===================== */
export function useLikesStorage(uid) {
    const [likes, setLikes] = useState(() => readLikes(uid));

    // 같은 탭: 커스텀 이벤트
    useEffect(() => {
        if (!uid) return;
        const onChanged = (e) => {
            if (e.detail?.userId === uid) setLikes(readLikes(uid));
        };
        window.addEventListener("likes:changed", onChanged);
        return () => window.removeEventListener("likes:changed", onChanged);
    }, [uid]);

    // 다른 탭: storage 이벤트
    useEffect(() => {
        if (!uid) return;
        const key = likesKey(uid);
        const onStorage = (e) => {
            if (e.key === key) setLikes(readLikes(uid));
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [uid]);

    // uid에 바인딩된 API들
    const write = useCallback((list, opts) => writeLikes(uid, list, opts), [uid]);
    const add = useCallback((postId, opts) => addLikeId(uid, postId, opts), [uid]);
    const remove = useCallback((postId, opts) => removeLikeId(uid, postId, opts), [uid]);
    const prune = useCallback((ids, opts) => pruneLikes(uid, ids, opts), [uid]);

    return { likes, writeLikes: write, addLike: add, removeLike: remove, pruneLikes: prune, key: likesKey(uid) };
}
