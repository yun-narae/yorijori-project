// src/pages/PostLikes.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import PostCardCompact from "../components/PostCard/PostCardCompact";
import pb from "../lib/pocketbase";
import { useAuth } from "../contexts/AuthContext";
import { useConfirm } from "../components/Modal/ConfirmProvider";
import { deletePostWithConfirm } from "../lib/deletePostWithConfirm";

// 로컬스토리지 키
const KEY = (uid) => `likes_${uid}`;

function readLikes(uid) {
    try {
        const raw = localStorage.getItem(KEY(uid));
        const arr = raw ? JSON.parse(raw) : [];
        // 중복 id 제거
        const seen = new Set();
        return arr.filter((x) => {
            const id = x?.id;
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
        });
    } catch {
        return [];
    }
}

function writeLikes(uid, list) {
    try {
        if (localStorage.getItem("__likes_block__") === "1") return; // ★ 쓰기락
        localStorage.setItem(KEY(uid), JSON.stringify(list));
    } catch {}
}

// 서버 레코드를 로컬 캐시 형태로 축약
function toCacheShape(rec) {
    const created =
        rec.created ?? rec.createdAt ?? rec["@created"] ?? "";
    const updated =
        rec.updated ?? rec["@updated"] ?? "";

    return {
        id: rec.id,
        title: rec.title,
        images: rec.images ?? [],
        category: rec.category ?? [],
        location: rec.location ?? "",
        date: rec.date ?? "",
        timeStart: rec.timeStart ?? "",
        timeEnd: rec.timeEnd ?? "",
        fee: rec.fee ?? 0,

        // 작성/수정 시간 ✨ (헤더에서 사용)
        created,
        createdAt: created, // 혹시 컴포넌트가 createdAt을 보더라도 대응
        updated,

        collectionId: rec.collectionId ?? rec["@collectionId"],
        editor: rec.editor ?? rec.expand?.editor ?? null,
        expand: rec.expand ? { editor: rec.expand.editor ?? null } : undefined,
    };
}

// 특정 게시물의 좋아요 합계를 post_likes에서 계산
async function fetchLikesTotal(postId) {
    try {
        const page = await pb.collection("post_likes").getList(1, 1, {
            filter: `post="${String(postId)}"`,
        });
        return Number(page.totalItems || 0);
    } catch {
        return 0;
    }
}

// 얕은 항목(id만 있는 것)들을 서버 데이터로 수화
async function hydrateShallowItems(items) {
    const results = [];
    for (const it of items || []) {
        const id = it?.id;
        if (!id) continue;
        try {
            const rec = await pb.collection("post").getOne(id, { expand: "editor" });
            results.push(toCacheShape(rec));
        } catch (err) {
            // 이미 삭제된 게시물(404)은 로컬에서도 제거
            const msg = String(err?.message || "");
            if (err?.status === 404 || msg.includes("not found") || msg.includes("Missing")) {
                // skip
            } else {
                // 일시적 오류인 경우엔 최소 정보만 유지
                results.push({ id: it.id });
            }
        }
    }
    return results;
}

// 항상 서버 합계로 덮어쓰기
async function fillLikesCount(items) {
    const filled = await Promise.all(
        (items ?? []).map(async (it) => {
            if (!it || !it.id) return it;
            const total = await fetchLikesTotal(it.id);
            return { ...it, likesCount: total };
        })
    );
    return filled;
}

// (선택) 내가 작성한 글이면 서버 post.likesCount 캐시도 동기화
async function patchServerLikesCountIfOwner(post, meId) {
    try {
        const editorId =
            typeof post?.editor === "string"
                ? post.editor
                : post?.editor?.id || post?.expand?.editor?.id;
        if (!editorId || editorId !== meId) return;

        const total = await fetchLikesTotal(post.id);
        await pb.collection("post").update(post.id, { likesCount: total });
    } catch {
        // 권한/규칙에 막히면 조용히 무시
    }
}

// ★ 로컬에 없을 때 서버에서 userId의 좋아요 목록을 백업 로드
async function fetchLikedPostIdsByUser(userId) {
    const ids = new Set();
    let page = 1;
    const perPage = 100;

    for (;;) {
        try {
            const res = await pb.collection("post_likes").getList(page, perPage, {
                filter: `user="${String(userId)}"`,
                fields: "post",
            });
            for (const it of res?.items || []) {
                const pid =
                    typeof it?.post === "string" ? it.post : it?.post?.id || null;
                if (pid) ids.add(pid);
            }
            if (!res?.items?.length || page >= (res?.totalPages || page)) break;
            page += 1;
        } catch {
            break; // 접근 규칙에 막히면 조용히 포기
        }
    }

    return [...ids].map((id) => ({ id }));
}

export default function PostLikes() {
    const { userId } = useParams();
    const { user: me } = useAuth();
    const confirm = useConfirm();
    const navigate = useNavigate();

    const [likedPosts, setLikedPosts] = useState(null); // null=로딩
    const loadingRef = useRef(false);

    // ✨ 리스트에서 '삭제' 처리
    const handleDeleteInList = (postId) => {
        if (!postId) return;
        deletePostWithConfirm(postId, {
            confirm,
            before: () => {},
            after: () => {},
            onSuccess: () => {
                setLikedPosts((prev) => {
                    const next = (prev || []).filter((p) => p.id !== postId);
                    writeLikes(userId, next);
                    return next;
                });
                window.dispatchEvent(
                    new CustomEvent("post:deleted", { detail: { postId } })
                );
            },
        });
    };

    // ✨ 리스트에서 '수정' 처리
    const handleEditInList = (postId) => {
        if (!postId) return;
        navigate(`/post/edit/${postId}`);
    };

    const load = async () => {
        if (!userId || loadingRef.current) return;
        loadingRef.current = true;

        try {
            setLikedPosts(null);

            // 1) 로컬에서 읽기
            let raw = readLikes(userId);

            // 1-1) 로컬이 비어 있으면 서버에서 해당 userId의 찜 목록을 백업 로드
            if (!raw.length) {
                raw = await fetchLikedPostIdsByUser(userId);
            }

            // 2) 얕은 데이터(id만) 보정
            const hydrated = await hydrateShallowItems(raw);

            // 3) 서버 post_likes 합계로 항상 덮어쓰기
            const withCounts = await fillLikesCount(hydrated);

            // 4) 내 글이면 서버 post.likesCount 캐시도 맞춰둠(선택)
            await Promise.all(
                withCounts.map((p) => (me ? patchServerLikesCountIfOwner(p, me.id) : null))
            );

            // 5) 화면 반영 + 로컬 캐시도 최신으로 저장
            setLikedPosts(withCounts);
            writeLikes(userId, withCounts);
        } finally {
            loadingRef.current = false;
        }
    };

    useEffect(() => {
        load();

        // 같은 탭 하트 동기화
        const onChanged = () => {
            load();
        };
        // 다른 탭/창 동기화
        const onStorage = (e) => {
            if (e.key && e.key.startsWith("likes_")) load();
        };
        // 화면 복귀 시 새로고침
        const onFocus = () => load();
        const onVis = () => document.visibilityState === "visible" && load();

        // 앱 내부에서 게시글 삭제 후 쏘는 커스텀 이벤트도 처리
        const onPostDeleted = (e) => {
            const pid = e?.detail?.postId;
            if (!pid) return;
            setLikedPosts((prev) => {
                const next = (prev || []).filter((p) => p.id !== pid);
                writeLikes(userId, next);
                return next;
            });
        };

        window.addEventListener("likes:changed", onChanged);
        window.addEventListener("storage", onStorage);
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVis);
        window.addEventListener("post:deleted", onPostDeleted);

        return () => {
            window.removeEventListener("likes:changed", onChanged);
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVis);
            window.removeEventListener("post:deleted", onPostDeleted);
            try {
                pb.collection("post").unsubscribe("*");
            } catch {}
        };
    }, [userId, me?.id]);

    // 서버에서 post 삭제가 발생하면 로컬 찜 목록에서도 제거
    useEffect(() => {
        let unsub;
        (async () => {
            try {
                unsub = await pb.collection("post").subscribe("*", (e) => {
                    if (e.action === "delete") {
                        const cur = readLikes(userId);
                        const next = cur.filter((p) => p?.id !== e.record?.id);
                        if (next.length !== cur.length) {
                            writeLikes(userId, next);
                            setLikedPosts(next);
                        }
                    }
                });
            } catch {}
        })();
        return () => {
            try {
                pb.collection("post").unsubscribe("*");
            } catch {}
        };
    }, [userId]);

    return (
        <>
            <PageTitleBar title="찜한 모임" />

            {likedPosts === null ? (
                <div className="h-screen flex items-center justify-center text-[var(--color-gray-5)]">
                    불러오는 중…
                </div>
            ) : likedPosts.length === 0 ? (
                <div className="h-screen flex flex-col max-w-[500px] mx-auto items-center justify-center px-4 tablet:px-0 desktop:px-0">
                    <p className="font-bold text-mo-title-md tablet:text-tab-title-md desktop:text-pc-title-md text-[var(--color-gray-5)] text-center">
                        아직 좋아요한 게시물이 없어요.
                    </p>
                </div>
            ) : (
                <ul className="flex flex-col gap-3 max-w-[500px] mx-auto mt-8 mb-8 px-[16px] tablet:px-0 desktop:px-0">
                    {likedPosts.map((post) => {
                        const editorId =
                            typeof post?.editor === "string"
                                ? post.editor
                                : post?.editor?.id || post?.expand?.editor?.id;
                        const isOwner = editorId && me?.id && String(editorId) === String(me.id);

                        return (
                            <li key={post.id}>
                                <PostCardCompact
                                    post={post}
                                    user={me}
                                    showInfoHeader={true}
                                    showStatusBadge={true}
                                    showSvgIcon={true}
                                    onDeletePost={isOwner ? () => handleDeleteInList(post.id) : undefined}
                                    onEditPost={isOwner ? () => handleEditInList(post.id) : undefined}
                                />
                            </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
}
