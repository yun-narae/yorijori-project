import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import PostCardCompact from "../components/PostCard/PostCardCompact";
import pb from "../lib/pocketbase";
import { useAuth } from "../contexts/AuthContext";
import { useConfirm } from "../components/Modal/ConfirmProvider";
import { deletePostWithConfirm } from "../lib/deletePostWithConfirm";

// 🔗 likes 스토리지 훅/유틸
import {
  useLikesStorage,
  readLikes,
  writeLikes,
} from "../hooks/useLikesStorage";

// 서버 레코드를 로컬 캐시 형태로 축약
function toCacheShape(rec) {
  const created = rec.created ?? rec.createdAt ?? rec["@created"] ?? "";
  const updated = rec.updated ?? rec["@updated"] ?? "";
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
    created,
    createdAt: created,
    updated,
    collectionId: rec.collectionId ?? rec["@collectionId"],
    editor: rec.editor ?? rec.expand?.editor ?? null,
    expand: rec.expand ? { editor: rec.expand.editor ?? null } : undefined,
  };
}

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

async function hydrateShallowItems(items) {
  const results = [];
  for (const it of items || []) {
    const id = it?.id;
    if (!id) continue;
    try {
      const rec = await pb.collection("post").getOne(id, { expand: "editor" });
      results.push(toCacheShape(rec));
    } catch (err) {
      if (err?.status === 404) {
        // 삭제된 게시물은 스킵
      } else {
        results.push({ id });
      }
    }
  }
  return results;
}

async function fillLikesCount(items) {
  return Promise.all(
    (items ?? []).map(async (it) => {
      if (!it?.id) return it;
      const total = await fetchLikesTotal(it.id);
      return { ...it, likesCount: total };
    })
  );
}

async function patchServerLikesCountIfOwner(post, meId) {
  try {
    const editorId =
      typeof post?.editor === "string" ? post.editor : post?.editor?.id || post?.expand?.editor?.id;
    if (!editorId || editorId !== meId) return;
    const total = await fetchLikesTotal(post.id);
    await pb.collection("post").update(post.id, { likesCount: total });
  } catch {}
}

export default function PostLikes() {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const [likedPosts, setLikedPosts] = useState(null); // null=로딩
  const loadingRef = useRef(false);

  // 바인딩된 writer(빈 배열이면 key 삭제)
  const { writeLikes: writeLikesBound } = useLikesStorage(userId);

  const handleDeleteInList = useCallback(
    async (postId) => {
      if (!postId) return;
      await deletePostWithConfirm(postId, {
        confirm,
        userId, // 이 페이지의 대상 유저
        onSuccess: () => {
          setLikedPosts((prev) => {
            const next = (prev || []).filter((p) => p.id !== postId);
            writeLikesBound(next); // ✅ 비면 key 삭제
            return next;
          });
          window.dispatchEvent(new CustomEvent("post:deleted", { detail: { postId } }));
        },
      });
    },
    [confirm, userId, writeLikesBound]
  );

  const handleEditInList = (postId) => {
    if (!postId) return;
    navigate(`/post/edit/${postId}`);
  };

  const load = async () => {
    if (!userId || loadingRef.current) return;
    loadingRef.current = true;
    try {
      setLikedPosts(null);

      // 1) 로컬 → 없다면 서버 백업 로드
      let raw = readLikes(userId);
      if (!raw.length) {
        try {
          const res = await pb.collection("post_likes").getList(1, 200, {
            filter: `user="${String(userId)}"`,
            fields: "post",
            sort: "-created",
          });
          raw = (res?.items || []).map((it) => ({ id: String(it.post) }));
        } catch {}
      }

      // 2) 수화 + 3) 합계 채우기
      const hydrated = await hydrateShallowItems(raw);
      const withCounts = await fillLikesCount(hydrated);

      // 4) 소유자라면 서버 캐시 동기화(선택)
      await Promise.all(withCounts.map((p) => (me ? patchServerLikesCountIfOwner(p, me.id) : null)));

      // 5) 화면/로컬 반영
      setLikedPosts(withCounts);
      writeLikes(userId, withCounts); // ✅ 비면 key 삭제
    } finally {
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    load();

    const onChanged = () => load(); // 같은 탭 하트 이벤트
    const onStorage = (e) => {
      if (e.key && e.key.startsWith("likes_")) load(); // 다른 탭 수정
    };
    const onFocus = () => load();
    const onVis = () => document.visibilityState === "visible" && load();
    const onPostDeleted = (e) => {
      const pid = e?.detail?.postId;
      if (!pid) return;
      setLikedPosts((prev) => {
        const next = (prev || []).filter((p) => p.id !== pid);
        writeLikesBound(next); // ✅
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
  }, [userId, me?.id, writeLikesBound]);

  // 서버에서 post 삭제 이벤트 → 로컬에서도 제거
  useEffect(() => {
    if (!userId) return;
    let unsub;
    (async () => {
      try {
        unsub = await pb.collection("post").subscribe("*", (e) => {
          if (e.action !== "delete") return;
          const cur = readLikes(userId);
          const next = cur.filter((p) => p?.id !== e.record?.id);
          if (next.length !== cur.length) {
            writeLikes(userId, next); // ✅ 비면 key 삭제
            setLikedPosts(next);
          }
        });
      } catch {}
    })();
    return () => {
      try {
        pb.collection("post").unsubscribe("*");
      } catch {}
      if (typeof unsub === "function") unsub();
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
                  showInfoHeader
                  showStatusBadge
                  showSvgIcon
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
