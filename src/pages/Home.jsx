// src/pages/Home.jsx
import React from "react";
import RecentPosts from "../components/HomeSections/RecentPosts";
import PopularPosts from "../components/HomeSections/PopularPosts";
import ParticipationPosts from '../components/HomeSections/ParticipationPosts';

export default function Home() {
    return (
        <main
            className="
                flex flex-col gap-10
                max-w-[1060px] mx-auto mt-8 mb-8
                px-[16px] desktop:px-0
            "
        >
            {/* 인기 Top5 */}
            <PopularPosts />
            {/* 최근 등록된 모임 */}
            <RecentPosts />
            {/* 예약한 모임 */}
            <ParticipationPosts />
        </main>
    );
}
