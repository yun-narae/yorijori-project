// src/pages/PostLikes.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PostCardCompact from "../components/PostCard/PostCardCompact";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import pb from "../lib/pocketbase";
import { useAuth } from "../contexts/AuthContext";

export default function PostLikes() {
    const { userId } = useParams();
    const { user: authUser } = useAuth(); // 현재 로그인 유저
    const [likedPosts, setLikedPosts] = useState([]);

    const hasEditor = (p) => {
        if (!p) return false;
        if (typeof p.editor === "string") return true;
        if (p.editor && typeof p.editor === "object" && p.editor.id) return true;
        if (p.expand && p.expand.editor && p.expand.editor.id) return true;
        return false;
    };

    const enrichPostsMin = async (items = []) => {
        const missing = items.filter((p) => !hasEditor(p)).map((p) => p.id);
        if (missing.length === 0) return items;

        try {
            const ids = missing.map((id) => `"${id}"`).join(",");
            const fetched = await pb.collection("post").getFullList({
                filter: `id in (${ids})`,
                expand: "editor",
            });
            const map = new Map(fetched.map((p) => [p.id, p]));
            return items.map((p) => (map.get(p.id) ? { ...map.get(p.id) } : p));
        } catch (e) {
            console.warn("[likes] enrich failed:", e);
            return items;
        }
    };

    // 목록 주인의 '찜'을 카운트에 반영(내가 아닌 다른 사람의 /post/likes 페이지일 때만 +1)
    const applyOwnerLikeBias = (items = []) => {
        const viewingOthersLikes = authUser?.id && authUser.id !== userId;
        if (!viewingOthersLikes) return items;
        return items.map((p) => ({
            ...p,
            likesCount: (Number(p?.likesCount) || 0) + 1,
        }));
    };

    const load = async () => {
        const raw = localStorage.getItem(`likes_${userId}`);
        const base = raw ? JSON.parse(raw) : [];
        const enriched = await enrichPostsMin(base);
        setLikedPosts(applyOwnerLikeBias(enriched));
    };

    useEffect(() => {
        let alive = true;
        (async () => {
            const raw = localStorage.getItem(`likes_${userId}`);
            const base = raw ? JSON.parse(raw) : [];
            const enriched = await enrichPostsMin(base);
            if (alive) setLikedPosts(applyOwnerLikeBias(enriched));
        })();
        return () => {
            alive = false;
        };
    }, [userId, authUser?.id]);

    useEffect(() => {
        const handler = async (e) => {
            if (e?.type === "likes:changed") {
                const d = e.detail;
                if (!d || d.userId !== userId) return;
            }
            await load(); // 내부에서 보정 적용
        };
        window.addEventListener("likes:changed", handler);
        window.addEventListener("storage", handler);
        return () => {
            window.removeEventListener("likes:changed", handler);
            window.removeEventListener("storage", handler);
        };
    }, [userId, authUser?.id]);

    return (
        <>
            <PageTitleBar />

            {likedPosts.length === 0 ? (
                <div
                    className="
                        h-screen
                        flex flex-col
                        max-w-[500px] mx-auto
                        items-center justify-center
                        px-4 tablet:px-0 desktop:px-0
                    "
                >
                    <p className="font-bold text-mo-title-md tablet:text-tab-title-md desktop:text-pc-title-md text-[var(--color-gray-5)] text-center">
                        아직 좋아요한 게시물이 없어요.
                    </p>
                </div>
            ) : (
                <ul
                    className="
                        flex flex-col gap-3
                        max-w-[500px] mx-auto mt-8 mb-8
                        px-[16px] tablet:px-0 desktop:px-0
                    "
                >
                    {likedPosts.map((post) => (
                        <li key={post.id}>
                            <PostCardCompact
                                post={post}
                                user={authUser}
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
