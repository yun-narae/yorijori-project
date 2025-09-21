// src/components/Info/InfoLike.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import SvgIcon from "../SvgIcon/SvgIcon";
import { useAuth } from "../../contexts/AuthContext";
import pb from "../../lib/pocketbase";

// --- 합쳐서 1회만 patch 하도록 큐 ---
const patchQueue = {};
const schedulePatchLikesCount = async (postId, nextTotal) => {
    const key = String(postId);
    try {
        if (patchQueue[key]?.timer) clearTimeout(patchQueue[key].timer);
        patchQueue[key] = {
        total: nextTotal,
        timer: setTimeout(async () => {
            try {
            await pb.collection("post").update(key, { likesCount: patchQueue[key].total });
            } catch {
            // 권한 없거나 404면 조용히 패스
            } finally {
            delete patchQueue[key];
            }
        }, 700),
        };
    } catch {}
    };

    export default function InfoLike({
    postId,
    post = null,
    initialCount = 0,
    count = true,
    readOnly = false,
    likedInitial = false,
    lazy = false,
    mode = "active",          // 리스트: "passive", 디테일: "active"
    canPatch = false,         // 소유자만 post.likesCount 캐시 patch
    className = "",
    infoLikeColor = "",
    infoLikeSize = "",
    iconClass = "",
    infoCountClass = "",
    onChange,
    }) {
    const { user } = useAuth();
    const currentUserId =
        (pb.authStore && (pb.authStore.model?.id || pb.authStore.record?.id)) ||
        user?.id ||
        null;

    // post.likesCount가 있으면 그걸 우선, 없으면 props.initialCount
    const initialCountNum =
        Number(
        post && typeof post.likesCount !== "undefined"
            ? post.likesCount
            : initialCount
        ) || 0;

    const [liked, setLiked] = useState(readOnly ? !!likedInitial : false);
    const [likeCount, setLikeCount] = useState(initialCountNum);

    const mutatingRef = useRef(false);
    const readyRef = useRef(false);

    const safeNum = (v, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);
    const rk = (tag) => `${tag}:${postId}:${currentUserId}:${Date.now()}`;

    // 외부에서 initialCount(혹은 post.likesCount)가 바뀌면 카운트 즉시 반영
    useEffect(() => {
        setLikeCount(initialCountNum);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialCountNum, postId]);

    // 초기 liked: 리스트 재방문 시 비어 보이는 문제 방지 (로컬 스냅샷 복원)
    useEffect(() => {
        if (!currentUserId || !postId || readOnly) return;
        try {
        const key = `likes_${currentUserId}`;
        const arr = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(arr) && arr.some((it) => String(it?.id) === String(postId))) {
            setLiked(true);
        }
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId, postId]);

    // ─────────────────────────────────────────────
    // ★★★ 여기부터 “하트끼리 상태 공유” 핵심 코드 ★★★
    // 같은 탭 내: 커스텀 이벤트로 즉시 동기화
    useEffect(() => {
        const onChanged = (e) => {
        const d = e.detail || {};
        if (String(d.postId) !== String(postId)) return;

        // 같은 로그인 사용자 이벤트일 때에만 내 liked 갱신
        if (!currentUserId || String(d.userId) !== String(currentUserId)) return;

        if (typeof d.liked === "boolean") setLiked(!!d.liked);
        if (count && typeof d.count === "number") setLikeCount(Number(d.count));
        };
        window.addEventListener("likes:changed", onChanged);
        return () => window.removeEventListener("likes:changed", onChanged);
    }, [postId, currentUserId, count]);

    // 다른 탭/창: storage 이벤트로 동기화
    useEffect(() => {
        if (!currentUserId || !postId) return;
        const key = `likes_${currentUserId}`;
        const syncFromStorage = () => {
        try {
            const arr = JSON.parse(localStorage.getItem(key) || "[]");
            setLiked(arr.some((it) => String(it?.id) === String(postId)));
        } catch {}
        };
        const onStorage = (e) => {
        if (e.key === key) syncFromStorage();
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [currentUserId, postId]);
    // ─────────────────────────────────────────────

    // 서버 조회들 (active에서만 의미)
    const fetchMine = useCallback(async () => {
        if (!currentUserId || !postId) return false;
        try {
        const page = await pb.collection("post_likes").getList(1, 1, {
            filter: `post="${String(postId)}" && user="${String(currentUserId)}"`,
            requestKey: rk("mine"),
        });
        return page.totalItems > 0;
        } catch {
        return false;
        }
    }, [currentUserId, postId]);

    const fetchTotal = useCallback(async () => {
        if (!postId) return initialCountNum;
        try {
        const page = await pb.collection("post_likes").getList(1, 1, {
            filter: `post="${String(postId)}"`,
            requestKey: rk("total"),
        });
        return Number(page.totalItems || 0);
        } catch {
        return initialCountNum;
        }
    }, [postId, initialCountNum]);

    const ensureReady = useCallback(async () => {
        if (readyRef.current || !postId) return;
        try {
        const [mine, totalMaybe] = await Promise.all([
            fetchMine(),
            count ? fetchTotal() : Promise.resolve(initialCountNum),
        ]);
        setLiked(!!mine);
        if (count) setLikeCount(Number(totalMaybe || 0));
        } catch {}
        readyRef.current = true;
    }, [fetchMine, fetchTotal, postId, count, initialCountNum]);

    useEffect(() => {
        if (mode === "active" && !lazy) ensureReady();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, lazy, postId]);

    // 리스트(passive)에서 초기 카운트가 0이면 서버 합계로 1회 보정
    useEffect(() => {
        if (!count || mode !== "passive" || !postId) return;
        if (Number(initialCountNum) > 0) return;

        let cancelled = false;
        (async () => {
        try {
            const total = await fetchTotal();
            if (!cancelled && Number.isFinite(Number(total))) {
            setLikeCount(Number(total));
            }
        } catch {}
        })();
        return () => { cancelled = true; };
    }, [count, mode, postId, initialCountNum, fetchTotal]);

    // 로컬 스냅샷
    const writeLocalSnapshot = (mine) => {
        try {
        const key = `likes_${currentUserId}`;
        let arr = JSON.parse(localStorage.getItem(key) || "[]");
        if (!Array.isArray(arr)) arr = [];
        if (mine) {
            if (!arr.some((it) => String(it?.id) === String(postId))) arr.push({ id: String(postId) });
        } else {
            arr = arr.filter((it) => String(it?.id) !== String(postId));
        }
        localStorage.setItem(key, JSON.stringify(arr));
        } catch {}
    };

    const createLike = async () => {
        try {
        await pb.collection("post_likes").create(
            { post: String(postId), user: String(currentUserId) },
            { requestKey: rk("create") }
        );
        } catch (e) {
        // 유니크 제약으로 이미 존재할 수 있음 → 서버 상태 재확인
        try {
            const page = await pb.collection("post_likes").getList(1, 1, {
            filter: `post="${String(postId)}" && user="${String(currentUserId)}"`,
            requestKey: rk("chkDup"),
            });
            if (page.totalItems === 0) throw e;
        } catch { throw e; }
        }
    };

    const deleteLike = async () => {
        try {
        const found = await pb.collection("post_likes").getList(1, 1, {
            filter: `post="${String(postId)}" && user="${String(currentUserId)}"`,
            requestKey: rk("findDel"),
        });
        if (found.totalItems > 0) {
            await pb.collection("post_likes").delete(found.items[0].id, { requestKey: rk("del") });
        }
        } catch {}
    };

    const toggleLike = async () => {
        if (!currentUserId || !postId || mutatingRef.current) return;
        mutatingRef.current = true;
        try {
        if (mode === "active" && !readyRef.current) await ensureReady();

        const base = Number.isFinite(likeCount) ? Number(likeCount) : initialCountNum;
        const nextLiked = !liked;
        const nextCount = Math.max(0, base + (nextLiked ? 1 : -1));

        setLiked(nextLiked);
        setLikeCount(nextCount); // 낙관적

        if (nextLiked) await createLike();
        else await deleteLike();

        // 서버 진실값으로 보정
        if (count) {
            fetchTotal().then((truth) => {
            if (Number.isFinite(truth)) setLikeCount(Number(truth));
            }).catch(() => {});
        }

        if (canPatch) schedulePatchLikesCount(postId, nextCount);

        writeLocalSnapshot(nextLiked);
        onChange?.(nextLiked, nextCount);

        // ★ 모든 InfoLike에게 방송 → 같은 페이지의 하트들 즉시 동기화
        window.dispatchEvent(
            new CustomEvent("likes:changed", {
            detail: { userId: currentUserId, postId, liked: nextLiked, count: nextCount },
            })
        );
        } catch {
        // 실패하면 서버 상태로 롤백
        if (mode === "active") {
            try {
            const [mine, totalMaybe] = await Promise.all([
                fetchMine(),
                count ? fetchTotal() : Promise.resolve(likeCount),
            ]);
            setLiked(!!mine);
            if (count) setLikeCount(Number(totalMaybe || 0));
            } catch {}
        }
        } finally {
        mutatingRef.current = false;
        }
    };

    const iconName = liked ? "heart-2" : "heart-1";

    if (readOnly) {
        return (
        <span className={["flex items-center gap-1 pointer-events-none select-none", className].join(" ")}>
            <SvgIcon
            name={iconName}
            frameSize="xs"
            frameClass="pointer-events-none"
            iconClass={["w-[20px] h-[20px]", infoLikeColor, iconClass].filter(Boolean).join(" ")}
            />
            {count && (
            <span className={["text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm", infoLikeColor, infoLikeSize, infoCountClass].filter(Boolean).join(" ")}>
                {safeNum(likeCount, initialCountNum)}
            </span>
            )}
        </span>
        );
    }

    return (
        <button
        type="button"
        className={["flex items-center", className].join(" ")}
        onClick={toggleLike}
        aria-pressed={liked}
        >
        <SvgIcon
            name={iconName}
            frameSize="xs"
            frameClass="pointer-events-none"
            iconClass={["w-[20px] h-[20px]", infoLikeColor, iconClass].filter(Boolean).join(" ")}
        />
        {count && (
            <span className={["text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm", infoLikeColor, infoLikeSize, infoCountClass].filter(Boolean).join(" ")}>
            {safeNum(likeCount, initialCountNum)}
            </span>
        )}
        </button>
    );
}
