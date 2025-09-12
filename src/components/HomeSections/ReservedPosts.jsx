// src/components/HomeSections/ReservedPosts.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import PostCardSimple from "../PostCard/PostCardSimple";

const dummyReserved = Array.from({ length: 3 }, (_, i) => ({
    id: `reserved-${i}`,
    title: `예약한 모임 ${i + 1}`,
    category: ["베이킹"],
    images: [],
    location: "온라인",
    date: new Date().toISOString(),
    timeStart: "14:00",
    timeEnd: "16:00",
    likeCount: 0,
    commentCount: 0,
    editor: { id: "dummy" },
}));

export default function ReservedPosts() {
    return (
        <section>
            <h2 className="font-bold text-mo-title-xl tablet:text-tab-title-lg desktop:text-pc-title-lg text-[var(--color-gray-8)] mb-2">
                예약한 모임
            </h2>
            <Swiper spaceBetween={16} slidesPerView={1.2}>
                {dummyReserved.map((post) => (
                    <SwiperSlide key={post.id} className="!w-auto flex-shrink-0">
                        {/* 여기서 카드 폭을 지정: min 302px ~ max 420px */}
                        <div className="w-[clamp(302px,calc(100vw-32px),420px)]">   
                            <PostCardSimple
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
        </section>
    );
}
