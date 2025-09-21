import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import PostCardCompact from "../components/PostCard/PostCardCompact";
import { useAuth } from "../contexts/AuthContext";
import pb from "../lib/pocketbase";

// 로컬스토리지 키
const KEY = (uid) => `likes_${uid}`;

function readLikes(uid) {
    try {
        const raw = localStorage.getItem(KEY(uid));
        const arr = raw ? JSON.parse(raw) : [];
        // 중복 제거
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
    localStorage.setItem(KEY(uid), JSON.stringify(list));
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
        collectionId: rec.collectionId ?? rec["@collectionId"],
        editor: rec.editor ?? rec.expand?.editor ?? null,
        expand: rec.expand ? { editor: rec.expand.editor ?? null } : undefined,
    };
}

// id만 있는 항목들은 서버에서 상세를 받아 채워 넣습니다.
async function hydrateShallowItems(items) {
    const results = [];
    for (const it of items) {
        // 제목/이미지가 없으면 "얕은" 데이터로 간주
        const isShallow = !it || !it.title || !Array.isArray(it.images);
        if (!isShallow) {
            results.push(it);
            continue;
        }
        try {
            const rec = await pb.collection("post").getOne(it.id, {
                expand: "editor",
            });
            results.push(toCacheShape(rec));
        } catch {
            // 서버 실패 시라도 id만 유지
            results.push({ id: it.id });
        }
    }
    return results;
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

            // 3) 화면에 반영
            setLikedPosts(hydrated);

            // 4) 로컬 캐시도 최신 형태로 덮어쓰기(다음엔 서버 없이도 렌더 OK)
            writeLikes(userId, hydrated);
        } finally {
            loadingRef.current = false;
        }
    };

    useEffect(() => {
        load();

        // 같은 탭 내 하트 동기화 (InfoLike 커스텀 이벤트)
        const onChanged = (e) => {
            if (String(e?.detail?.userId) !== String(userId)) return;
            load();
        };
        // 다른 탭/창 동기화
        const onStorage = (e) => {
            if (e.key !== KEY(userId)) return;
            load();
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
