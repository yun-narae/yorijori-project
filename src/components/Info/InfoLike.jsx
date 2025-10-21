import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SvgIcon from "../SvgIcon/SvgIcon";
import { useAuth } from "../../contexts/AuthContext";
import pb from "../../lib/pocketbase";
import { useConfirm } from "../Modal/ConfirmProvider";

// 🔗 likes 스토리지 훅/유틸
import { useLikesStorage, readLikes } from "../../hooks/useLikesStorage";

export default function InfoLike({
    postId,
    initialCount = 0,
    count = true,
    readOnly = false,
    likedInitial = false,
    lazy = false,
    mode = "active",
    canPatch = false,
    className = "",
    infoLikeColor = "",
    infoLikeSize = "",
    iconClass = "",
    infoCountClass = "",
    onChange,
}) {
    const { user } = useAuth();
    const confirm = useConfirm();
    const navigate = useNavigate();
    const location = useLocation();
    const currentUserId =
        (pb.authStore && (pb.authStore.model?.id || pb.authStore.record?.id)) ||
        user?.id ||
        null;

    // 바인딩된 writer(빈 배열이면 key 삭제)
    const { writeLikes: writeLikesBound } = useLikesStorage(currentUserId);

    const initialCountNum = Number(initialCount) || 0;
    const [liked, setLiked] = useState(readOnly ? !!likedInitial : false);
    const [likeCount, setLikeCount] = useState(initialCountNum);

    const mutatingRef = useRef(false);
    const readyRef = useRef(false);

    const safeNum = (v, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);
    const rk = (tag) => `${tag}:${postId}:${currentUserId}:${Date.now()}`;

    useEffect(() => {
        setLikeCount(initialCountNum);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialCountNum, postId]);

    // 초기 liked를 로컬에서 복원
    useEffect(() => {
        if (!currentUserId || !postId || readOnly) return;
        try {
            const arr = readLikes(currentUserId);
            if (Array.isArray(arr) && arr.some((it) => String(it?.id) === String(postId))) {
                setLiked(true);
            }
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId, postId]);

    // 같은 탭: 커스텀 이벤트 동기화
    useEffect(() => {
        const onChanged = (e) => {
            const d = e.detail || {};
            if (String(d.postId) !== String(postId)) return;
            if (!currentUserId || String(d.userId) !== String(currentUserId)) return;
            if (typeof d.liked === "boolean") setLiked(!!d.liked);
            if (count && typeof d.count === "number") setLikeCount(Number(d.count));
        };
        window.addEventListener("likes:changed", onChanged);
        return () => window.removeEventListener("likes:changed", onChanged);
    }, [postId, currentUserId, count]);

    // 다른 탭: storage 동기화
    useEffect(() => {
        if (!currentUserId || !postId) return;
        const key = `likes_${currentUserId}`;
        const syncFromStorage = () => {
            try {
                const arr = readLikes(currentUserId);
                setLiked(arr.some((it) => String(it?.id) === String(postId)));
            } catch {}
        };
        const onStorage = (e) => {
            if (e.key === key) syncFromStorage();
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [currentUserId, postId]);

    // 서버 조회들
    const fetchMine = useCallback(async (signal) => {
        if (!currentUserId || !postId) return false;
        try {
            const page = await pb.collection("post_likes").getList(1, 1, {
                filter: `post="${String(postId)}" && user="${String(currentUserId)}"`,
                requestKey: rk("mine"),
                signal,
            });
            return page.totalItems > 0;
        } catch (err) {
            if (err.name !== 'AbortError' && !err.message?.includes('autocancelled')) {
                return false;
            }
            throw err; // AbortError는 다시 throw
        }
    }, [currentUserId, postId]);

    const fetchTotal = useCallback(async (signal) => {
        if (!postId) return initialCountNum;
        try {
            const page = await pb.collection("post_likes").getList(1, 1, {
                filter: `post="${String(postId)}"`,
                requestKey: rk("total"),
                signal,
            });
            return Number(page.totalItems || 0);
        } catch (err) {
            if (err.name !== 'AbortError' && !err.message?.includes('autocancelled')) {
                return initialCountNum;
            }
            throw err; // AbortError는 다시 throw
        }
    }, [postId, initialCountNum]);

    const ensureReady = useCallback(async (signal) => {
        if (readyRef.current || !postId) return;
        try {
            const [mine, totalMaybe] = await Promise.all([
                fetchMine(signal),
                count ? fetchTotal(signal) : Promise.resolve(initialCountNum),
            ]);
            setLiked(!!mine);
            if (count) setLikeCount(Number(totalMaybe || 0));
        } catch (err) {
            if (err.name !== 'AbortError' && !err.message?.includes('autocancelled')) {
                // AbortError가 아닌 경우에만 처리
            }
        }
        readyRef.current = true;
    }, [fetchMine, fetchTotal, postId, count, initialCountNum]);

    useEffect(() => {
        if (mode === "active" && !lazy) {
            const abortController = new AbortController();
            ensureReady(abortController.signal);
            return () => abortController.abort();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, lazy, postId]);

    // 리스트(passive) 초기 카운트 보정
    useEffect(() => {
        if (!count || mode !== "passive" || !postId) return;
        if (Number(initialCountNum) > 0) return;
        const abortController = new AbortController();
        (async () => {
            try {
                const total = await fetchTotal(abortController.signal);
                if (!abortController.signal.aborted && Number.isFinite(Number(total))) setLikeCount(Number(total));
            } catch (err) {
                if (err.name !== 'AbortError' && !err.message?.includes('autocancelled')) {
                    // AbortError가 아닌 경우에만 처리
                }
            }
        })();
        return () => {
            abortController.abort();
        };
    }, [count, mode, postId, initialCountNum, fetchTotal]);

    // 로컬 스냅샷(빈 배열이면 키 삭제)
    const writeLocalSnapshot = (mine) => {
        if (!currentUserId || !postId) return;
        try {
            let arr = readLikes(currentUserId);
            if (!Array.isArray(arr)) arr = [];
            if (mine) {
                if (!arr.some((it) => String(it?.id) === String(postId))) {
                    arr.push({ id: String(postId) });
                }
            } else {
                arr = arr.filter((it) => String(it?.id) !== String(postId));
            }
            writeLikesBound(arr); // 비면 key 삭제 + 이벤트 방송
        } catch {}
    };

    const createLike = async () => {
        try {
            await pb.collection("post_likes").create(
                { post: String(postId), user: String(currentUserId) },
                { requestKey: rk("create") }
            );
        } catch (e) {
            try {
                const page = await pb.collection("post_likes").getList(1, 1, {
                    filter: `post="${String(postId)}" && user="${String(currentUserId)}"`,
                    requestKey: rk("chkDup"),
                });
                if (page.totalItems === 0) throw e;
            } catch {
                throw e;
            }
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
        // ⬇️ 비로그인 시 모달만 띄우고 종료
        if (!currentUserId) {
            const ok = await confirm({
                title: "로그인이 필요합니다.",
                confirmText: "로그인하기",
                cancelText: "취소",
            });
            if (ok) {
                navigate("/login", { state: { from: location.pathname } });
            }
            return;
        }
        if (!postId || mutatingRef.current) return;
        mutatingRef.current = true;
        try {
            if (mode === "active" && !readyRef.current) await ensureReady();

            const base = Number.isFinite(likeCount) ? Number(likeCount) : initialCountNum;
            const nextLiked = !liked;
            const nextCount = Math.max(0, base + (nextLiked ? 1 : -1));

            setLiked(nextLiked);
            setLikeCount(nextCount); // 낙관적 UI

            if (nextLiked) await createLike();
            else await deleteLike();

            if (count) {
                const abortController = new AbortController();
                fetchTotal(abortController.signal)
                    .then((truth) => {
                        if (Number.isFinite(truth)) setLikeCount(Number(truth));
                    })
                    .catch((err) => {
                        if (err.name !== 'AbortError' && !err.message?.includes('autocancelled')) {
                            // AbortError가 아닌 경우에만 처리
                        }
                    });
            }

            if (canPatch) {
                try {
                    // eslint-disable-next-line no-undef
                    schedulePatchLikesCount(postId, nextCount);
                } catch {}
            }

            writeLocalSnapshot(nextLiked);
            onChange?.(nextLiked, nextCount);

            window.dispatchEvent(
                new CustomEvent("likes:changed", {
                    detail: { userId: currentUserId, postId, liked: nextLiked, count: nextCount },
                })
            );
        } catch {
            // 실패하면 서버 값으로 롤백
            if (mode === "active") {
                try {
                    const abortController = new AbortController();
                    const [mine, totalMaybe] = await Promise.all([
                        fetchMine(abortController.signal),
                        count ? fetchTotal(abortController.signal) : Promise.resolve(likeCount),
                    ]);
                    setLiked(!!mine);
                    if (count) setLikeCount(Number(totalMaybe || 0));
                } catch (err) {
                    if (err.name !== 'AbortError' && !err.message?.includes('autocancelled')) {
                        // AbortError가 아닌 경우에만 처리
                    }
                }
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
                    <span
                        className={[
                            "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm",
                            infoLikeColor,
                            infoLikeSize,
                            infoCountClass,
                        ].filter(Boolean).join(" ")}
                    >
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
                <span
                    className={[
                        "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm",
                        infoLikeColor,
                        infoLikeSize,
                        infoCountClass,
                    ].filter(Boolean).join(" ")}
                >
                    {safeNum(likeCount, initialCountNum)}
                </span>
            )}
        </button>
    );
}
