import React, { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import pb from "../../lib/pocketbase";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import useFetchFiles from "../../hooks/useFetchFiles";
import { useConfirm } from "../Modal/ConfirmProvider";
import PostCardSimple from "../PostCard/PostCardSimple";
import { deletePostWithConfirm } from "../../lib/deletePostWithConfirm";
import PostCardSkeleton from "../Skeletons/PostCardSkeleton";
import CustomButton from "../CustomButton/CustomButton";

const SUBMIT_SKELETON_MIN_MS = Number(import.meta.env.VITE_SUBMIT_SKELETON_MIN_MS || 1000);

export default function RecentPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();
    const { user: authUser } = useAuth();
    const { dataLoading } = useFetchFiles("files", 1, 20);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const showSkeleton = loading || dataLoading || isSubmitting;
    const hasPosts = !!authUser?.id && posts.length > 0;

    const confirm = useConfirm();
    const swiperRef = useRef(null);

    // 로그인 유도 모달 + 이동
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

    const lastSnapSlideIndex = (sw) => {
        const lastSnap = sw.snapGrid.length - 1;
        const lastSnapPos = sw.snapGrid[lastSnap];
        const idx = sw.slidesGrid.indexOf(lastSnapPos);
        return idx >= 0 ? idx : sw.slides.length - 1;
    };

    // Delete post
    const handleDeleteInList = useCallback(
        async (postId) => {
            if (!postId) return;

            await deletePostWithConfirm(postId, {
                confirm,
                userId: authUser?.id,
                before: () => setIsSubmitting(true),
                after: () => setIsSubmitting(false),
                onSuccess: () => {
                    // 리스트에서 제거
                    setPosts((prev) => prev.filter((p) => p.id !== postId));
                    // 필요 시 이동
                    navigate(`/post/mypost/${authUser?.id ?? ":userId"}`, { replace: true });
                },
            });
        },
        [authUser?.id, confirm, navigate]
    );

    const handleEditInList = useCallback(
        (postId) => {
            navigate(`/post/edit/${postId}`);
        },
        [navigate]
    );

    const toEpoch = (v) => {
        if (!v) return 0;
        if (v instanceof Date) return v.getTime();
        if (typeof v === "number") return v;
        let s = String(v).trim();
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\sUTC)?$/.test(s)) {
            s = s.replace(" ", "T").replace(" UTC", "Z");
        }
        const t = Date.parse(s);
        return Number.isNaN(t) ? 0 : t;
    };

    const stampOf = (p) => {
        const u = toEpoch(p?.updated);
        const c = toEpoch(p?.created || p?.createdAt);
        return u || c || 0;
    };

    useEffect(() => {
        const onUpdated = (e) => {
            const rec = e.detail;
            if (!rec?.id) return;
            setPosts((prev) => {
                const next = prev.map((p) => (p.id === rec.id ? rec : p));
                next.sort((a, b) => stampOf(b) - stampOf(a));
                return next;
            });
        };
        window.addEventListener("post:updated", onUpdated);
        return () => window.removeEventListener("post:updated", onUpdated);
    }, []);

    const isRecruitClosed = (p) => {
        const norm = (v) => (v ?? "").toString().trim().toLowerCase();

        if (p?.closed === true || p?.isClosed === true) return true;

        const status = norm(p?.status || p?.recruitStatus || p?.recruiting || p?.state);
        if (["모집마감", "closed", "완료", "end", "ended"].includes(status)) return true;

        try {
            const d = p?.date;
            const t = p?.timeEnd || p?.time_end;
            if (d) {
                const end = new Date(t ? `${d}T${t}` : d);
                if (!Number.isNaN(end.getTime()) && end.getTime() < Date.now()) return true;
            }
        } catch {
            /* noop */
        }
        return false;
    };

    // 작성자 expand가 없을 때만 보강 호출
    const hydrateAuthors = async (items) => {
        return Promise.all(
            (items ?? []).map(async (p) => {
                if (p?.expand?.editor) return p;

                const editorId =
                    typeof p?.editor === "string"
                        ? p.editor
                        : (p?.editor && p.editor.id) || null;

                if (!editorId) return p;

                try {
                    const author = await pb.collection("users").getOne(editorId, {
                        requestKey: `home:author:${editorId}`, // ★ 자동취소 정리
                    });
                    return { ...p, expand: { ...(p.expand || {}), editor: author } };
                } catch (error) {
                    if (error?.isAbort || error?.status === 0) {
                        // 자동취소는 소음만 줄이고 무시
                        return p;
                    }
                    const details = error?.response?.data || error?.data;
                    console.warn("작성자 보강 실패:", error);
                    console.warn("PocketBase details:", details);
                    return p;
                }
            })
        );
    };

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setLoading(true);
            setIsSubmitting(true);
            const start = Date.now();

            try {
                const PER_PAGE = 5;
                const res = await pb.collection("post").getList(1, PER_PAGE, {
                    // 필요하면 서버에서 같이 가져오도록(추가 호출 줄이기)
                    expand: "editor",
                    requestKey: "home:recent", // ★ 같은 키 요청 자동취소
                });

                let items = Array.isArray(res?.items) ? res.items.slice() : [];
                items = items.filter((p) => !isRecruitClosed(p));
                items.sort((a, b) => stampOf(b) - stampOf(a));
                items = items.slice(0, 3);

                const hydrated = await hydrateAuthors(items);
                hydrated.sort((a, b) => stampOf(b) - stampOf(a));

                if (!cancelled) setPosts(hydrated);
            } catch (error) {
                if (error?.isAbort || error?.status === 0) {
                    // 자동취소는 조용히 무시(React StrictMode로 인해 두 번 부를 수 있음)
                    if (!cancelled) setPosts([]);
                } else {
                    const details = error?.response?.data || error?.data;
                    console.warn("최근 게시물 실패:", error);
                    console.warn("PocketBase details:", details);
                    if (!cancelled) setPosts([]);
                }
            } finally {
                const elapsed = Date.now() - start;
                const remain = Math.max(0, SUBMIT_SKELETON_MIN_MS - elapsed);
                setTimeout(() => {
                    if (!cancelled) {
                        setIsSubmitting(false);
                        setLoading(false);
                    }
                }, remain);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <>
            {showSkeleton ? (
                <div className="flex flex-col gap-2">
                    <h2 className="font-bold text-mo-title-xl tablet:text-tab-title-lg desktop:text-pc-title-lg text-[var(--color-gray-8)] mb-2">
                        최근 등록된 모임
                    </h2>
                    <PostCardSkeleton
                        variant="simple"
                        className="!max-w-none !w-[clamp(302px,calc(100vw-96px),420px)] tablet:w-[clamp(302px,calc(100vw-112px),420px)] desktop:w-[420px] !mx-0 !mt-auto !mb-auto !px-0"
                    />
                </div>
            ) : (
                <section>
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-mo-title-xl tablet:text-tab-title-lg desktop:text-pc-title-lg text-[var(--color-gray-8)] mb-2">
                            최근 등록된 모임
                        </h2>
                        {hasPosts ? (
                            <Link
                                to={`/post/participation/${authUser.id}`}
                                onClick={(e) => {
                                    if (!authUser?.id) {
                                        e.preventDefault();
                                        goLogin();
                                    }
                                }}
                                className="text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-5)] hover:text-[var(--color-gray-8)] cursor-pointer"
                                aria-label="최근 등록된 모임 전체 보기"
                            >
                                더보기
                            </Link>
                        ) : (
                            <span className="invisible select-none">더보기</span> // 레이아웃 유지용
                        )}
                    </div>

                    {posts.length === 0 ? (
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-col gap-1">
                                <h3 className="text-[var(--color-gray-8)] text-mo-title tablet:text-tab-title desktop:text-pc-title">
                                    아직 모임이 없어요.
                                </h3>
                                <p className="text-mo-title tablet:text-tab-title desktop:text-pc-title text-[var(--color-gray-5)]">
                                    첫 모임을 작성해 보세요!
                                </p>
                            </div>
                            <CustomButton
                                text="작성하러 가기"
                                size="sm"
                                variant="primary"
                                onClick={() => (authUser ? navigate("/post/create", { replace: true }) : goLogin())}
                                custombuttonClass="!w-fit"
                            />
                        </div>
                    ) : (
                        <Swiper
                            slidesPerView="auto"
                            spaceBetween={16}
                            loop={false}
                            freeMode={false}
                            resistanceRatio={0}
                            watchOverflow
                            observeParents
                            observer
                            threshold={8}
                            onBeforeInit={(sw) => {
                                swiperRef.current = sw;
                            }}
                            onTouchEnd={(sw) => {
                                if (sw.isEnd && sw.touches.diff < 0) {
                                    sw.slideTo(lastSnapSlideIndex(sw), 0);
                                }
                            }}
                            className="!overflow-x-clip !overflow-y-visible"
                        >
                            {posts.map((post) => (
                                <SwiperSlide key={post.id} className="!w-auto flex-shrink-0">
                                    <div className="w-[clamp(302px,calc(100vw-96px),420px)] tablet:w-[clamp(302px,calc(100vw-112px),420px)] desktop:w-[420px]">
                                        <PostCardSimple
                                            post={post}
                                            currentUserId={authUser?.id ?? null}
                                            user={authUser ?? null}
                                            author={post?.expand?.editor ?? null}
                                            swiper={false}
                                            showInfoHeader
                                            showStatusBadge
                                            showSvgIcon
                                            onDeletePost={authUser ? () => handleDeleteInList(post.id) : undefined}
                                            onEditPost={authUser ? () => handleEditInList(post.id) : undefined}
                                            onRequireLogin={!authUser ? goLogin : undefined}
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    )}
                </section>
            )}
        </>
    );
}
