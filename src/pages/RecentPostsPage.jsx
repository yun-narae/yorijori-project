// src/pages/RecentPostsPage.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import pb from "../lib/pocketbase";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import PostCardSimple from "../components/PostCard/PostCardSimple";
import PostCardSkeleton from "../components/Skeletons/PostCardSkeleton";
import { useAuth } from "../contexts/AuthContext";
import useFetchFiles from "../hooks/useFetchFiles";
import CustomButton from "../components/CustomButton/CustomButton";
import { useConfirm } from "../components/Modal/ConfirmProvider";

const PER_PAGE = 20;

export default function RecentPostsPage() {
    const { user: me } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const confirm = useConfirm();
    // 로그인 여부
    const isLoggedIn = !!(
        pb?.authStore?.model?.id ||
        pb?.authStore?.record?.id ||
        me?.id
    );

    // 데이터
    const [items, setItems] = useState(null); // null=로딩, []=없음, [...]=있음
    const loadingRef = useRef(false);

    // 외부 훅 상태(파일 프리로드 등)
    const { dataLoading } = useFetchFiles("files", 1, 20);
    const [isSubmitting] = useState(false);

    const loading = items === null;
    const showSkeleton = loading || dataLoading || isSubmitting;

    // post → 실패 시 posts로 재시도
    const fetchPage1 = useCallback(async () => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        try {
            setItems(null);
            let res;
            try {
                res = await pb.collection("post").getList(1, PER_PAGE, {
                    // 필요하면 서버에서 같이 가져오도록(추가 호출 줄이기)
                    expand: "editor",
                    requestKey: "home:recent", // ★ 같은 키 요청 자동취소
                });
            } catch (e) {
                // 400/404 등 컬렉션 네임 문제 가능성 → posts로 재시도
                res = await pb.collection("posts").getList(1, PER_PAGE, { sort: "-created" });
            }
            setItems(res.items ?? []);
        } catch {
            setItems([]); // 콘솔 에러 대신 빈 상태
        } finally {
            loadingRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchPage1();
    }, [fetchPage1]);

    const goLogin = useCallback(async () => {
        const ok = await confirm({
            title: "로그인이 필요합니다.",
            confirmText: "로그인하기",
            cancelText: "취소",
        });
        if (ok) {
            navigate("/login", { state: { from: location.pathname } });
        }
    }, [confirm, navigate, location.pathname]);

    const handleCreateClick = useCallback(() => {
        if (isLoggedIn) {
            navigate("/post/create", { replace: true });
        } else {
            goLogin();
        }
    }, [isLoggedIn, navigate, goLogin]);

    return (
        <>
            <PageTitleBar title="최근 등록된 모임" />

            {showSkeleton ? (
                <div className="flex flex-col gap-2 max-w-[500px] mx-auto mt-6 mb-8 px-[16px] tablet:px-0 desktop:px-0">
                    {/* <PostCardSkeleton
                        variant="simple"
                        className="!max-w-none !w-[clamp(302px,calc(100vw-96px),420px)] tablet:w-[clamp(302px,calc(100vw-112px),420px)] desktop:w-[420px] !mx-0 !mt-auto !mb-auto !px-0"
                    /> */}
                </div>
            ) : items.length === 0 ? (
                <div className="flex flex-col gap-2 max-w-[500px] mx-auto mt-6 mb-8 items-center px-[16px] tablet:px-0 desktop:px-0">
                    <h3 className="text-[var(--color-gray-8)] text-mo-title tablet:text-tab-title desktop:text-pc-title">
                        아직 모임이 없어요.
                    </h3>
                    <p className="text-[var(--color-gray-5)]">첫 모임을 작성해 보세요!</p>
                    <CustomButton
                        text="작성하러 가기"
                        size="sm"
                        variant="primary"
                        onClick={handleCreateClick}
                        custombuttonClass="!w-fit mt-2"
                    />
                </div>
            ) : (
                <ul className="flex flex-col gap-3 max-w-[500px] mx-auto mt-6 mb-8 px-[16px] tablet:px-0 desktop:px-0">
                    {items.map((post) => (
                        <li key={post.id}>
                            <PostCardSimple
                                post={post}
                                user={me}
                                enableParticipation={false}
                                showInfoHeader
                                showStatusBadge
                                showSvgIcon
                            />
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
