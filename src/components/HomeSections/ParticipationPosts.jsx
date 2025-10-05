// src/components/HomeSections/ParticipationPosts.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import pb from "../../lib/pocketbase";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useConfirm } from "../Modal/ConfirmProvider";
import PostCardSimple from "../PostCard/PostCardSimple";
import PostCardSkeleton from "../Skeletons/PostCardSkeleton";

const SUBMIT_SKELETON_MIN_MS = Number(import.meta.env.VITE_SUBMIT_SKELETON_MIN_MS || 1000);

export default function ParticipationPosts() {
    const { user: authUser } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const showSkeleton = loading || isSubmitting;
    const hasPosts = !!authUser?.id && posts.length > 0;

    const navigate = useNavigate();
    const location = useLocation();
    const confirm = useConfirm();
    const swiperRef = useRef(null);

    const goLogin = useCallback(async () => {
        const ok = await confirm({
            title: "로그인이 필요합니다.",
            confirmText: "로그인하기",
            cancelText: "취소",
        });
        if (ok) navigate("/login", { state: { from: location.pathname } });
    }, [confirm, navigate, location.pathname]);

    const lastSnapSlideIndex = (sw) => {
        const lastSnap = sw.snapGrid.length - 1;
        const lastSnapPos = sw.snapGrid[lastSnap];
        const idx = sw.slidesGrid.indexOf(lastSnapPos);
        return idx >= 0 ? idx : sw.slides.length - 1;
    };

    useEffect(() => {
        if (!authUser?.id) {
            setPosts([]);
            setLoading(false);
            return;
        }

        let cancelled = false;

        const run = async () => {
            setLoading(true);
            setIsSubmitting(true);
            const start = Date.now();

            try {
                // 내가 예약한 post 목록을 관계 컬렉션에서 가져오기
                const PER_PAGE = 10;
                const res = await pb.collection("post_participation").getList(1, PER_PAGE, {
                    filter: `user = "${authUser.id}"`,
                    sort: "-created",
                    expand: "post,post.editor",
                    requestKey: `home:reserved:${authUser.id}`,
                });

                // expand된 post만 뽑고, 중복 방지
                const uniq = new Map();
                (res?.items || []).forEach((it) => {
                    const p = it?.expand?.post;
                    if (p?.id && !uniq.has(p.id)) uniq.set(p.id, p);
                });

                const items = Array.from(uniq.values()).slice(0, 5);
                if (!cancelled) setPosts(items);
            } catch (err) {
                if (!cancelled) setPosts([]);
                console.warn("예약한 모임 로드 실패:", err);
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
    }, [authUser?.id]);

    return (
        <>
            {showSkeleton ? (
                <div className="flex flex-col gap-2">
                    <h2 className="font-bold text-mo-title-xl tablet:text-tab-title-lg desktop:text-pc-title-lg text-[var(--color-gray-8)] mb-2">
                        예약한 모임
                    </h2>
                    <PostCardSkeleton
                        variant="simple"
                        className="!max-w-none !w-[clamp(302px,calc(100vw-32px),420px)] !mx-0 !mt-auto !mb-auto !px-0"
                    />
                </div>
            ) : (
                <section>
                    <div className="flex justify-between items-center">
                        <h2 className="font-bold text-mo-title-xl tablet:text-tab-title-lg desktop:text-pc-title-lg text-[var(--color-gray-8)] mb-2">
                            예약한 모임
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
                                aria-label="내가 예약한 모임 전체 보기"
                            >
                                더보기
                            </Link>
                        ) : (
                            <span className="invisible select-none">더보기</span> // 레이아웃 유지용
                        )}
                    </div>

                    {!authUser?.id ? (
                        <div className="flex flex-col gap-1">
                            <p className="text-[var(--color-gray-5)] text-mo-title tablet:text-tab-title desktop:text-pc-title">
                                로그인하고 내가 예약한 모임을 확인해보세요.
                            </p>
                            <button
                                type="button"
                                onClick={goLogin}
                                className="px-3 py-2 rounded-lg bg-[var(--color-primary)] text-white w-fit"
                            >
                                로그인하기
                            </button>
                        </div>
                    ) : posts.length === 0 ? (
                        <p className="text-[var(--color-gray-5)] text-mo-title tablet:text-tab-title desktop:text-pc-title">
                            예약한 모임이 아직 없어요.
                        </p>
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
                        >
                            {posts.map((post) => (
                                <SwiperSlide key={post.id} className="!w-auto flex-shrink-0">
                                    {/* min 302px ~ max 420px (RecentPosts와 동일 계열) */}
                                    <div className="w-[clamp(302px,calc(100vw-32px),420px)]">
                                        <PostCardSimple
                                            post={post}
                                            currentUserId={authUser?.id ?? null}
                                            user={authUser ?? null}
                                            author={post?.expand?.editor ?? null}
                                            swiper
                                            showInfoHeader
                                            showStatusBadge
                                            showSvgIcon
                                            // 예약 목록이므로 기본적으로 수정/삭제 버튼은 제외
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
