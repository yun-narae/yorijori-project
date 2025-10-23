// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import RecentPosts from "../components/HomeSections/RecentPosts";
import PopularPosts from "../components/HomeSections/PopularPosts";
import ParticipationPosts from '../components/HomeSections/ParticipationPosts';
import MainBanner from '../components/Banner/MainBanner';
import NoticeBanner from '../components/Banner/NoticeBanner';

export default function Home() {
    const navigate = useNavigate();

    const handleBannerClick = (banner) => {
        if (banner.category) {
            navigate(`/category?category=${encodeURIComponent(banner.category)}`);
        }
    };

    return (
        <main>
            {/* 메인 배너 */}
            <MainBanner onBannerClick={handleBannerClick} />
            
            <div className="
                flex flex-col gap-10
                max-w-[1060px] mx-auto mt-6 desktop:mt-8 mb-8
                px-3
            ">
                {/* 공지 배너 */}
                <NoticeBanner />
                {/* 인기 Top3 */}
                <PopularPosts />
                {/* 최근 등록된 모임 */}
                <RecentPosts />
                {/* 예약한 모임 */}
                <ParticipationPosts />
            </div>
        </main>
    );
}
