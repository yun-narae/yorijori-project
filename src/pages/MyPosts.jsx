import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import pb from "../lib/pocketbase";
import { useAuth } from "../contexts/AuthContext";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import PostCardCompact from "../components/PostCard/PostCardCompact";
import PostCardSkeleton from "../components/Skeletons/PostCardSkeleton";
import useFetchFiles from "../hooks/useFetchFiles";
import { deletePostWithConfirm } from "../lib/deletePostWithConfirm";
import { useConfirm } from "../components/Modal/ConfirmProvider";
import CustomButton from "../components/CustomButton/CustomButton";

// 🔧 스켈레톤 노출 시간 조절용 상수 (ms)
const SUBMIT_SKELETON_MIN_MS = Number(import.meta.env.VITE_SUBMIT_SKELETON_MIN_MS || 1000);

export default function MyPosts() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?.id;
    const [userPosts, setUserPosts] = useState([]);
    const { dataLoading } = useFetchFiles("files", 1, 50);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const showSkeleton = dataLoading || isSubmitting;
    const confirm = useConfirm();

    // 게시물 삭제 (목록에서)
    const handleDeleteInList = useCallback((postId) => {
        deletePostWithConfirm(postId, {
            confirm,
            before: () => setIsSubmitting(true),
            after: () => setIsSubmitting(false),
            onSuccess: () => {
                setUserPosts(prev => prev.filter(p => p.id !== postId));

                // ✅ 현재 목록 URL을 히스토리에서 치환해서 “삭제 전 목록 상태”가 뒤로가기에 남지 않도록
                navigate(`/post/mypost/${user?.id ?? ":userId"}`, { replace: true });
            },
        });
    }, [navigate, user?.id]);

    useEffect(() => {
        const onUpdated = (e) => {
            const rec = e.detail;
            if (!rec?.id) return;
            setUserPosts(prev => prev.map(p => p.id === rec.id ? rec : p));
        };
        window.addEventListener("post:updated", onUpdated);
        return () => window.removeEventListener("post:updated", onUpdated);
    }, []);
    
    // 게시물 수정
    const handleEditInList = useCallback((postId) => {
        navigate(`/post/edit/${postId}`);
    }, [navigate]);

    useEffect(() => {
        if (!userId) return;
    
        const AUTHOR_FIELD = "editor";
    
        const fetchUserPosts = async () => {
            if (isSubmitting) return;
            setIsSubmitting(true);
            const start = Date.now();
            try {
                const result = await pb.collection("post").getList(1, 50, {
                    filter: `${AUTHOR_FIELD}="${userId}"`,
                    expand: AUTHOR_FIELD,
                    fields: [
                        "id",
                        "title",
                        "description",
                        "category",
                        "images",
                        "capacity",
                        "collectionId",
                        "collectionName",
                        "location",
                        "date",
                        "fee",
                        "timeStart",
                        "timeEnd",
                        "likeCount",
                        "commentCount",
                        "editor",
                        "updated",
                        "created",
                    ].join(","),
                });
                setUserPosts(result.items ?? []);
            } catch (err) {
                console.error("게시물 가져오기 실패:", err?.status, err?.message, err?.data);
            } finally {
                // 🔧 제출 스켈레톤 최소 노출 시간을 조절합니다.
                const elapsed = Date.now() - start;
                const remain = Math.max(0, SUBMIT_SKELETON_MIN_MS - elapsed);
                setTimeout(() => setIsSubmitting(false), remain);
            }
        };
    
        fetchUserPosts();
    }, [userId]);

    return (
        <>
            {showSkeleton ? (
                <PostCardSkeleton />
                ) : userPosts.length === 0 ? (
                    <div className="
                        h-screen
                        flex flex-col
                        max-w-[500px] mx-auto
                        items-center justify-center
                        px-4
                        tablet:px-0
                        desktop:px-0
                    ">
                        <div className="flex flex-col gap-4 items-center justify-center">
                            <div className="flex flex-col items-center justify-center gap-1">
                                <h3 className="text-[var(--color-gray-8)] font-bold text-mo-title-xl tablet:text-tab-title-lg desktop:text-pc-title-lg">
                                    작성한 모임이 없어요.
                                </h3>
                                <p className="font-bold text-mo-title-md tablet:text-tab-title-md desktop:text-pc-title-md text-[var(--color-gray-5)]">
                                    첫 글을 작성해 보세요!
                                </p>
                            </div>
                            <CustomButton
                                text="작성하러 가기"
                                size="lg"
                                variant="primary"
                                onClick={() =>
                                    navigate(`/post/create`, { replace: true })
                                }
                            />
                        </div>
                    </div>
            ) : (
                <>
                    <PageTitleBar />
                    
                    <ul className="
                        flex flex-col gap-3
                        max-w-[500px] mx-auto mt-8 mb-8
                        px-[16px]
                        tablet:px-0
                        desktop:px-0
                    ">
                        {userPosts.map((post) => (
                            <PostCardCompact
                                post={post}
                                user={user}
                                currentUserId={user?.id}
                                key={post.id}
                                swiper={false}
                                showInfoHeader={true}
                                showStatusBadge={true}
                                showSvgIcon={true}
                                onDeletePost={() => handleDeleteInList(post.id)}
                                onEditPost={() => handleEditInList(post.id)}
                            />
                        ))}
                    </ul>
                </>
            )}
        </>
    );
}
