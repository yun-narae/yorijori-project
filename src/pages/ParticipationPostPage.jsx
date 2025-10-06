// src/pages/PostParticipation.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import PostCardCompact from "../components/PostCard/PostCardCompact";
import pb from "../lib/pocketbase";
import { useAuth } from "../contexts/AuthContext";
import PostCardSkeleton from "../components/Skeletons/PostCardSkeleton";

const PARTICIPATION = "post_participation";

async function fetchParticipatedPostIdsByUser(userId) {
    const ids = new Set();
    let page = 1;
    const perPage = 100;
    for (;;) {
        try {
            const res = await pb.collection(PARTICIPATION).getList(page, perPage, {
                filter: `user = "${String(userId)}"`,
                fields: "post",
            });
            for (const it of res?.items || []) {
                const pid = typeof it.post === "string" ? it.post : it?.post?.id;
                if (pid) ids.add(pid);
            }
            if (!res?.items?.length || page >= (res?.totalPages || page)) break;
            page += 1;
        } catch {
            break;
        }
    }
    return [...ids];
}

async function hydratePosts(postIds) {
    const out = [];
    for (const id of postIds) {
        try {
            const rec = await pb.collection("post").getOne(id, { expand: "editor" });
            out.push(rec);
        } catch {}
    }
    return out;
}

export default function PostParticipation() {
    const { userId } = useParams();
    const { user: me } = useAuth();

    const [posts, setPosts] = useState(null);
    const loadingRef = useRef(false);

    const load = async () => {
        if (!userId || loadingRef.current) return;
        loadingRef.current = true;
        try {
            setPosts(null);
            const postIds = await fetchParticipatedPostIdsByUser(userId);
            const hydrated = await hydratePosts(postIds);
            setPosts(hydrated);
        } finally {
            loadingRef.current = false;
        }
    };

    useEffect(() => {
        load();

        const onFocus = () => load();
        const onVis = () => document.visibilityState === "visible" && load();
        const onPostDeleted = (e) => {
            const pid = e?.detail?.postId;
            if (!pid) return;
            setPosts((prev) => (prev || []).filter((p) => p.id !== pid));
        };

        // 예약/취소 즉시 반영(좋아요 페이지와 동일 패턴)
        const onParticipationChanged = (e) => {
            const { postId, userId: who, joined } = e?.detail || {};
            if (!postId || String(who) !== String(userId)) return;
            if (joined === false) {
                setPosts((prev) => (prev || []).filter((p) => p.id !== postId));
            }
        };

        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVis);
        window.addEventListener("post:deleted", onPostDeleted);
        window.addEventListener("participation:changed", onParticipationChanged);

        // 서버에서 post 삭제되면 제거
        let unsub;
        (async () => {
            try {
                unsub = await pb.collection("post").subscribe("*", (e) => {
                    if (e.action === "delete") {
                        setPosts((prev) => (prev || []).filter((p) => p.id !== e.record?.id));
                    }
                });
            } catch {}
        })();

        return () => {
            window.removeEventListener("focus", onFocus);
            document.removeEventListener("visibilitychange", onVis);
            window.removeEventListener("post:deleted", onPostDeleted);
            window.removeEventListener("participation:changed", onParticipationChanged);
            try { pb.collection("post").unsubscribe("*"); } catch {}
            if (typeof unsub === "function") try { unsub(); } catch {}
        };
    }, [userId, me?.id]);

    return (
        <>
            <PageTitleBar title="예약한 모임" />

            {posts === null ? (
                <PostCardSkeleton />
            ) : posts.length === 0 ? (
                <div className="h-screen flex flex-col max-w=[500px] mx-auto items-center justify-center px-4 tablet:px-0 desktop:px-0">
                    <p className="font-bold text-mo-title-md tablet:text-tab-title-md desktop:text-pc-title-md text-[var(--color-gray-5)] text-center">
                        아직 예약한 모임이 없어요.
                    </p>
                </div>
            ) : (
                <ul className="flex flex-col gap-3 max-w-[500px] mx-auto mt-6 mb-8 px-[16px] tablet:px-0 desktop:px-0">
                    {posts.map((post) => {
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
                                />
                            </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
}
