// src/components/HomeSections/PopularPosts.jsx
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import pb from "../../lib/pocketbase";
import PostCardCover from "../PostCard/PostCardCover";
import PostCardSkeleton from "../Skeletons/PostCardSkeleton";

const SKELETON_MIN_MS = Number(import.meta.env.VITE_SUBMIT_SKELETON_MIN_MS || 800);

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
const stampOf = (p) => toEpoch(p?.updated) || toEpoch(p?.created) || 0;

export default function PopularPosts() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const showSkeleton = loading || submitting;
    const swiperRef = useRef(null);

    const clampLast = (sw) => {
        const lastSnap = sw.snapGrid.length - 1;
        const pos = sw.snapGrid[lastSnap];
        const idx = sw.slidesGrid.indexOf(pos);
        return idx >= 0 ? idx : sw.slides.length - 1;
    };

    useEffect(() => {
        let off = false;

        (async () => {
            setLoading(true);
            setSubmitting(true);
            const t0 = Date.now();

            try {
                // 1) 최근 포스트 소량만 (RecentPosts와 동일한 안전 옵션: expand만)
                const SEED = 12;
                const seedRes = await pb.collection("post").getList(1, SEED, {
                    expand: "editor",
                    requestKey: "popular:seed",
                });
                let seed = Array.isArray(seedRes?.items) ? seedRes.items.slice() : [];
                // 최신순으로 한 번 정렬
                seed.sort((a, b) => stampOf(b) - stampOf(a));

                // 2) 각 포스트의 좋아요 "개수"만 필터로 조회 (리스트 전체 호출 없음)
                const scored = [];
                for (const p of seed) {
                    let cnt = 0;
                    try {
                        const r = await pb.collection("post_likes").getList(1, 1, {
                            filter: `post = "${p.id}"`,
                            requestKey: `popular:cnt:${p.id}`,
                        });
                        cnt = Number(r?.totalItems || 0);
                    } catch {
                        cnt = 0; // 카운트 실패해도 계속 진행
                    }
                    scored.push({ post: p, cnt });
                }

                // 3) 좋아요 수 내림차순 → 동일하면 최신순
                scored.sort((a, b) => (b.cnt - a.cnt) || (stampOf(b.post) - stampOf(a.post)));
                const top = scored.slice(0, 5).map((v) => v.post);

                if (!off) setItems(top);
            } catch (e) {
                if (!off) setItems([]);
                // eslint-disable-next-line no-console
                console.warn("인기 Top5 로드 실패:", e);
            } finally {
                const wait = Math.max(0, SKELETON_MIN_MS - (Date.now() - t0));
                setTimeout(() => {
                    if (!off) {
                        setSubmitting(false);
                        setLoading(false);
                    }
                }, wait);
            }
        })();

        return () => { off = true; };
    }, []);

    return (
        <>
            {showSkeleton ? (
                <div className="flex flex-col gap-2">
                    <h2 className="font-bold text-mo-title-xl tablet:text-tab-title-lg desktop:text-pc-title-lg text-[var(--color-gray-8)] mb-2">
                        인기 Top 5
                    </h2>
                    <PostCardSkeleton
                        variant="cover"
                        className="!max-w-none !w-[clamp(302px,calc(100vw-32px),420px)] !mx-0 !mt-auto !mb-auto !px-0"
                    />
                </div>
            ) : (
                <section>
                    <h2 className="font-bold text-mo-title-xl tablet:text-tab-title-lg desktop:text-pc-title-lg text-[var(--color-gray-8)] mb-2">
                        인기 Top 5
                    </h2>

                    {items.length === 0 ? (
                        <p className="text-[var(--color-gray-5)] text-mo-title tablet:text-tab-title desktop:text-pc-title">
                            아직 인기 모임이 없어요.
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
                            onBeforeInit={(sw) => { swiperRef.current = sw; }}
                            onTouchEnd={(sw) => {
                                if (sw.isEnd && sw.touches.diff < 0) sw.slideTo(clampLast(sw), 0);
                            }}
                        >
                            {items.map((post, idx) => (
                                <SwiperSlide key={post.id} className="!w-auto flex-shrink-0">
                                    <div className="relative w-[clamp(302px,calc(100vw-32px),420px)]">
                                        <span className="absolute left-2 top-2 z-10 px-2 py-1 rounded-md bg-[var(--color-gray-9)]/80 text-white text-sm">
                                            {idx + 1}위
                                        </span>
                                        <PostCardCover
                                            post={post}
                                            user={null}
                                            swiper
                                            showInfoHeader
                                            showStatusBadge
                                            showSvgIcon
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
