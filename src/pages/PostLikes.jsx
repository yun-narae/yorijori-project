// src/pages/PostLikes.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import PostCardCompact from "../components/PostCard/PostCardCompact";
import pb from "../lib/pocketbase";
import { useAuth } from "../contexts/AuthContext";

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
        localStorage.setItem(KEY(uid), JSON.stringify(list));
    } catch {}
}

// 서버 레코드를 로컬 캐시 형태로 축약
function toCacheShape(rec) {
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
        // 캐시엔 저장하되 화면 렌더는 항상 서버 합계로 덮어씀
        likesCount: typeof rec.likesCount === "number" ? rec.likesCount : undefined,
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
    for (const it of items) {
        const isShallow = !it || !it.title || !Array.isArray(it.images);
        if (!isShallow) {
            results.push(it);
            continue;
        }
        try {
            const rec = await pb.collection("post").getOne(it.id, { expand: "editor" });
            results.push(toCacheShape(rec));
        } catch {
            results.push({ id: it.id });
        }
    }
    return results;
}

// 항상 서버 합계로 덮어쓰기(순차 실행로 429 방지)
async function fillLikesCountAlways(items) {
    const out = [];
    for (const it of items) {
        if (!it?.id) {
            out.push(it);
            continue;
        }
        const total = await fetchLikesTotal(it.id);
        out.push({ ...it, likesCount: total });
    }
    return out;
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

export default function PostLikes() {
    const { userId } = useParams();
    const { user: me } = useAuth();

    const [likedPosts, setLikedPosts] = useState(null); // null=로딩
    const loadingRef = useRef(false);

    const load = async () => {
        if (!userId || loadingRef.current) return;
        loadingRef.current = true;

        try {
            setLikedPosts(null);

            // 1) 로컬에서 읽기
            const raw = readLikes(userId);

            // 2) 얕은 데이터(id만) 보정
            const hydrated = await hydrateShallowItems(raw);

            // 3) 서버 post_likes 합계로 항상 덮어쓰기(순차)
            const withCounts = await fillLikesCountAlways(hydrated);

            // 4) 내 글이면 서버 post.likesCount 캐시도 맞춰둠(선택)
            await Promise.all(
                withCounts.map((p) => (me ? patchServerLikesCountIfOwner(p, me.id) : null))
            );

            // 5) 화면 반영 + 로컬 캐시도 최신으로 저장
            setLikedPosts(withCounts);
            console.table(withCounts.map(p => ({
                id: p.id,
                title: p.title,
                likesCount: p.likesCount
            })));
            writeLikes(userId, withCounts);
        } finally {
            loadingRef.current = false;
        }
    };

    useEffect(() => {
        load();

        // 같은 탭 하트 동기화
        const onChanged = (e) => {
            // 페이지 주인의 likes_*만 보고 있으므로 userId 불문하고 새로고침
            load();
        };
        // 다른 탭/창 동기화
        const onStorage = (e) => {
            if (e.key && e.key.startsWith("likes_")) load();
        };
        // 화면 복귀 시 새로고침
        const onFocus = () => load();
        const onVis = () => document.visibilityState === "visible" && load();

        window.addEventListener("likes:changed", onChanged);
        window.addEventListener("storage", onStorage);
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVis);

        return () => {
            window.removeEventListener("likes:changed", onChanged);
            window.removeEventListener("storage", onStorage);
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVis);
        };
    }, [userId, me?.id]);

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
                    {likedPosts.map((post) => (
                        <li key={post.id}>
                            <PostCardCompact
                                post={post}
                                user={me}
                                showInfoHeader={true}
                                showStatusBadge={true}
                                showSvgIcon={true}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
