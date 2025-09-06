// src/pages/MyPosts.jsx
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import pb from "../lib/pocketbase";
import { useAuth } from "../contexts/AuthContext";
import useFetchFiles from "../hooks/useFetchFiles";
import { useConfirm } from "../components/Modal/ConfirmProvider";
import { deletePostWithConfirm } from "../lib/deletePostWithConfirm";

import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import PostCardSkeleton from "../components/Skeletons/PostCardSkeleton";
import PostCardSimple from "../components/PostCard/PostCardSimple";
import CustomButton from "../components/CustomButton/CustomButton";

const SUBMIT_SKELETON_MIN_MS = Number(import.meta.env.VITE_SUBMIT_SKELETON_MIN_MS || 1000);

export default function MyPosts() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { userId: paramUserId } = useParams();

    // 보고 있는 대상 유저 id: 파라미터 우선, 없으면 로그인 유저
    const viewedUserId = paramUserId ?? user?.id ?? null;

    const [viewedUser, setViewedUser] = useState(null);   // ✅ 작성자 레코드(모든 카드에 공통 주입)
    const [userPosts, setUserPosts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { dataLoading } = useFetchFiles("files", 1, 50);
    const showSkeleton = dataLoading || isSubmitting;
    const confirm = useConfirm();

    // 대상 유저의 프로필 1회 조회 (author로 사용)
    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (!viewedUserId) return;
            try {
                const u = await pb.collection("users").getOne(viewedUserId);
                if (!cancelled) setViewedUser(u);
            } catch (e) {
                console.error("사용자 조회 실패:", e?.status, e?.message, e?.data);
                if (!cancelled) setViewedUser(null);
            }
        };
        run();
        return () => { cancelled = true; };
    }, [viewedUserId]);

    // 게시물 삭제 (목록에서)
    const handleDeleteInList = useCallback((postId) => {
        deletePostWithConfirm(postId, {
            confirm,
            before: () => setIsSubmitting(true),
            after: () => setIsSubmitting(false),
            onSuccess: () => {
                setUserPosts(prev => prev.filter(p => p.id !== postId));
                navigate(`/post/mypost/${viewedUserId ?? ":userId"}`, { replace: true });
            },
        });
    }, [navigate, viewedUserId, confirm]);

    // 게시물 수정 (목록에서)
    const handleEditInList = useCallback((postId) => {
        navigate(`/post/edit/${postId}`);
    }, [navigate]);

    // post:updated 이벤트 수신 → 리스트 항목 갱신
    useEffect(() => {
        const onUpdated = (e) => {
            const rec = e.detail;
            if (!rec?.id) return;
            setUserPosts(prev => prev.map(p => (p.id === rec.id ? rec : p)));
        };
        window.addEventListener("post:updated", onUpdated);
        return () => window.removeEventListener("post:updated", onUpdated);
    }, []);

    // 대상 유저의 게시물 가져오기 (옵션 최소화 → 400 회피)
    useEffect(() => {
        if (!viewedUserId) return;
    
        let cancelled = false;
    
        const fetchUserPosts = async () => {
            setIsSubmitting(true);
            const start = Date.now();
            try {
                // 1) 초안전: 서버 필터/정렬/expand 없이 한 번만 호출
                //    (필요하면 perPage를 늘리거나 getFullList로 바꿔도 됨)
                const res = await pb.collection("post").getList(1, 200);
    
                // 2) 클라이언트에서 대상 유저 글만 필터
                let items = Array.isArray(res?.items) ? res.items : [];
                items = items.filter((p) => {
                    const ed = p?.editor;
                    if (typeof ed === "string") return ed === viewedUserId;
                    if (ed && typeof ed === "object" && ed.id) return ed.id === viewedUserId;
                    const ex = p?.expand?.editor;
                    if (ex && typeof ex === "object" && ex.id) return ex.id === viewedUserId;
                    return false;
                });
    
                // 3) 최신순 정렬
                items.sort((a, b) => new Date(b?.created || 0) - new Date(a?.created || 0));
    
                if (!cancelled) setUserPosts(items);
            } catch (err) {
                // 실패해도 네트워크 스팸 없이 한 번만 찍힘
                console.error("게시물 가져오기 실패:", err?.status, err?.message, err?.data);
                if (!cancelled) setUserPosts([]);
            } finally {
                const elapsed = Date.now() - start;
                const remain = Math.max(0, SUBMIT_SKELETON_MIN_MS - elapsed);
                if (!cancelled) setTimeout(() => setIsSubmitting(false), remain);
            }
        };
    
        fetchUserPosts();
        return () => { cancelled = true; };
    }, [viewedUserId]);

    return (
        <>
            {showSkeleton ? (
                <PostCardSkeleton />
            ) : userPosts.length === 0 ? (
                <div
                    className="
                        h-screen
                        flex flex-col
                        max-w-[500px] mx-auto
                        items-center justify-center
                        px-4 tablet:px-0 desktop:px-0
                    "
                >
                    <div className="flex flex-col gap-4 items-center justify-center">
                        <div className="flex flex-col items-center justify-center gap-1">
                            <h3 className="text-[var(--color-gray-8)] font-bold text-mo-title-xl tablet:text-tab-title-lg desktop:text-pc-title-lg">
                                아직 게시물이 없어요.
                            </h3>
                            <p className="font-bold text-mo-title-md tablet:text-tab-title-md desktop:text-pc-title-md text-[var(--color-gray-5)]">
                                첫 글을 작성해 보세요!
                            </p>
                        </div>
                        {user && (!paramUserId || paramUserId === user.id) && (
                            <CustomButton
                                text="작성하러 가기"
                                size="lg"
                                variant="primary"
                                onClick={() => navigate(`/post/create`, { replace: true })}
                            />
                        )}
                    </div>
                </div>
            ) : (
                <>
                    <PageTitleBar />
                    <ul
                        className="
                            flex flex-col gap-3
                            max-w-[500px] mx-auto mt-8 mb-8
                            px-[16px] tablet:px-0 desktop:px-0
                        "
                    >
                        {userPosts.map((post) => (
                            <PostCardSimple
                                key={post.id}
                                post={post}
                                // 아이콘/수정권한 판단은 “현재 로그인 유저”
                                currentUserId={user?.id}
                                // 작성자(헤더 아바타/닉네임 표시용): expand 없이도 보장
                                author={viewedUser}
                                swiper={false}
                                showInfoHeader={true}
                                showStatusBadge={true}
                                showSvgIcon={true}
                                onDeletePost={user ? () => handleDeleteInList(post.id) : undefined}
                                onEditPost={user ? () => handleEditInList(post.id) : undefined}
                            />
                        ))}
                    </ul>
                </>
            )}
        </>
    );
}
