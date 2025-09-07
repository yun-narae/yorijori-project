// src/components/Skeletons/MyPageSkeleton.jsx
import React from "react";
import Skel from "./Skel";

export default function MyPageSkeleton() {
    return (
        <div
            className="
                flex flex-col 
                max-w-[500px] mx-auto mt-8 mb-8
                px-4
                tablet:px-0
                desktop:px-0
            "
        >
            <div className="mb-4 flex flex-col gap-2 items-center">
                {/* 아바타 */}
                <Skel className="!rounded-full w-[132px] h-[132px]" />
                {/* 이름 */}
                <Skel className="h-4 w-24 mt-1" />
            </div>

            {/* 활동 모아보기 카드 형태 */}
            <div className="bg-[var(--color-gray-1)] p-3 rounded-lg">
                <Skel className="h-4 w-28 mb-3" />
                <div className="flex flex-col gap-2">
                    <Skel className="h-4 w-[72%]" />
                    <Skel className="h-4 w-[64%]" />
                </div>
            </div>
        </div>
    );
}
