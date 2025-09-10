// src/components/HomeSections/RecentPosts.jsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import pb from "../../lib/pocketbase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import useFetchFiles from "../../hooks/useFetchFiles";
import { useConfirm } from "../Modal/ConfirmProvider";
import PostCardSimple from "../PostCard/PostCardSimple";
import { deletePostWithConfirm } from "../../lib/deletePostWithConfirm";

const SUBMIT_SKELETON_MIN_MS = Number(import.meta.env.VITE_SUBMIT_SKELETON_MIN_MS || 1000);

export default function RecentPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const { user: authUser } = useAuth();
    const { dataLoading } = useFetchFiles("files", 1, 20);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const showSkeleton = dataLoading || isSubmitting;

    const confirm = useConfirm();
    const swiperRef = useRef(null);

    // 마지막 스냅 인덱스 계산(데스크탑에서 끝 넘어가는 현상 방지)
    const lastSnapSlideIndex = (sw) => {
        const lastSnap = sw.snapGrid.length - 1;
        const lastSnapPos = sw.snapGrid[lastSnap];
        const idx = sw.slidesGrid.indexOf(lastSnapPos);
        return idx >= 0 ? idx : sw.slides.length - 1;
    };

    // 삭제
    const handleDeleteInList = useCallback(
        (postId) => {
            deletePostWithConfirm(postId, {
                confirm,
                before: () => setIsSubmitting(true),
                after: () => setIsSubmitting(false),
                onSuccess: () => {
                    setPosts((prev) => prev.filter((p) => p.id !== postId));
                    navigate(`/`, { replace: true });
                },
            });
        },
        [confirm, navigate]
    );

    // 수정
    const handleEditInList = useCallback(
        (postId) => {
            navigate(`/post/edit/${postId}`);
        },
        [navigate]
    );

    // 안전한 날짜 파서 (PocketBase "YYYY-MM-DD HH:mm:ss UTC" 대응)
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

    // 정렬 기준: updated 최신순 → 없으면 created
    const stampOf = (p) => {
        const u = toEpoch(p?.updated);
        const c = toEpoch(p?.created || p?.createdAt);
        return u || c || 0;
    };

    // 실시간 갱신 시에도 정렬 유지
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

    // 모집 마감 판단
    const isRecruitClosed = (p) => {
        const norm = (v) => (v ?? "").toString().trim().toLowerCase();

        // 불리언 플래그
        if (p?.closed === true || p?.isClosed === true) return true;

        // 상태 텍스트
        const status = norm(p?.status || p?.recruitStatus || p?.recruiting || p?.state);
        if (["모집마감", "closed", "완료", "end", "ended"].includes(status)) return true;

        // 날짜가 지난 경우(가능할 때만)
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

    // 작성자 하이드레이션 (expand.editor 보장)
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
                    const author = await pb.collection("users").getOne(editorId);
                    return { ...p, expand: { ...(p.expand || {}), editor: author } };
                } catch {
                    return p;
                }
            })
        );
    };

    // 목록 로드: 서버 정렬 없이 넉넉히 가져와서 클라이언트 정렬
    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setLoading(true);
            try {
                const PER_PAGE = 50;
                const res = await pb.collection("post").getList(1, PER_PAGE);

                let items = Array.isArray(res?.items) ? res.items.slice() : [];

                // 1) 마감 제외
                items = items.filter((p) => !isRecruitClosed(p));

                // 2) 업데이트 최신순(폴백: created) 정렬
                items.sort((a, b) => stampOf(b) - stampOf(a));

                // 3) 상위 5개만
                items = items.slice(0, 5);

                // 4) 작성자 보강
                const hydrated = await hydrateAuthors(items);

                // 혹시 하이드레이션 사이 순서 변동 방지
                hydrated.sort((a, b) => stampOf(b) - stampOf(a));

                if (!cancelled) setPosts(hydrated);
            } catch (err) {
                console.error("최근 게시물 실패:", err?.status, err?.message, err?.data);
                if (!cancelled) setPosts([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section>
            <h2 className="font-bold text-mo-title-xl tablet:text-tab-title-lg desktop:text-pc-title-lg text-[var(--color-gray-8)] mb-2">최근 등록된 모임</h2>

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
                    // 끝에서 더 넘기면 마지막 스냅으로 즉시 고정
                    if (sw.isEnd && sw.touches.diff < 0) {
                        sw.slideTo(lastSnapSlideIndex(sw), 0);
                    }
                }}
            >
                {posts.map((post) => (
                    <SwiperSlide key={post.id} className="!w-auto flex-shrink-0">
                        <div className="w-[clamp(302px,calc(100vw-96px),420px)] tablet:w-[clamp(302px,calc(100vw-112px),420px)] desktop:w-[420px]">
                            <PostCardSimple
                                post={post}
                                // 권한 판단용(내 글이면 케밥, 남 글이면 하트)
                                currentUserId={authUser?.id ?? null}
                                // 구버전 카드 호환
                                user={authUser ?? null}
                                // 헤더 표시용 작성자
                                author={post?.expand?.editor ?? null}
                                // 내부 이미지 슬라이더 비활성(중첩 방지)
                                swiper={false}
                                showInfoHeader
                                showStatusBadge
                                showSvgIcon
                                onDeletePost={authUser ? () => handleDeleteInList(post.id) : undefined}
                                onEditPost={authUser ? () => handleEditInList(post.id) : undefined}
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}
