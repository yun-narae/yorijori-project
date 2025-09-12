// src/components/HomeSections/PopularPosts.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import PostCardCover from "../PostCard/PostCardCover";

// 임시 가라 데이터
const dummyPopular = Array.from({ length: 5 }, (_, i) => ({
    id: `popular-${i}`,
    title: `인기 모임 ${i + 1}`,
    category: ["요리"],
    images: [],
    likeCount: Math.floor(Math.random() * 100),
    commentCount: Math.floor(Math.random() * 20),
    location: "서울",
    date: new Date().toISOString(),
    timeStart: "18:00",
    timeEnd: "20:00",
    editor: { id: "dummy" },
}));

export default function PopularPosts() {
    return (
        <section>
            <h2 className="font-bold text-mo-title-xl tablet:text-tab-title-lg desktop:text-pc-title-lg text-[var(--color-gray-8)] mb-2">
                인기 Top 5
            </h2>
            <Swiper spaceBetween={16} slidesPerView={1.2}>
                {dummyPopular.map((post) => (
                <SwiperSlide key={post.id} className="!w-auto flex-shrink-0">
                    {/* 여기서 카드 폭을 지정: min 302px ~ max 420px */}
                    <div className="w-[clamp(302px,calc(100vw-32px),420px)]">   
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
        </section>
    );
}
