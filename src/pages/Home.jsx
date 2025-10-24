// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import RecentPosts from "../components/HomeSections/RecentPosts";
import PopularPosts from "../components/HomeSections/PopularPosts";
import ParticipationPosts from '../components/HomeSections/ParticipationPosts';
import MainBanner from '../components/Banner/MainBanner';
import NoticeBanner from '../components/Banner/NoticeBanner';
import MainBannerSkeleton from '../components/Skeletons/MainBannerSkeleton';
import NoticeBannerSkeleton from '../components/Skeletons/NoticeBannerSkeleton';

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 로딩 시뮬레이션 (실제로는 데이터 로딩 시간에 따라 조정)
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <main>
            {/* 메인 배너 */}
            {isLoading ? <MainBannerSkeleton /> : <MainBanner />}
            
            <div className="
                flex flex-col gap-10
                max-w-[1060px] mx-auto mt-4 desktop:mt-6 mb-8
                px-3
            ">
                {/* 공지 배너 */}
                {isLoading ? <NoticeBannerSkeleton /> : <NoticeBanner />}
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
