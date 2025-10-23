// src/pages/Home.jsx
import React from "react";
import RecentPosts from "../components/HomeSections/RecentPosts";
import PopularPosts from "../components/HomeSections/PopularPosts";
import ParticipationPosts from '../components/HomeSections/ParticipationPosts';
import MainBanner from '../components/Banner/MainBanner';

export default function Home() {
    return (
        <main>
            {/* 메인 배너 */}
            <MainBanner />
            <div className="
                flex flex-col gap-10
                max-w-[1060px] mx-auto mt-6 desktop:mt-8 mb-8
                px-3
            ">
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
