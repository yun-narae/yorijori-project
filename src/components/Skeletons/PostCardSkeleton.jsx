import React from "react";
import Skel from './Skel';

/**
 * PostCardSkeleton
 * - PostCard가 로딩될 때 보여줄 스켈레톤
 * - variant: 'compact' | 'cover' | 'simple'
 * - count: 몇 개 그릴지
 */
export default function PostCardSkeleton({
    variant = "compact",
    count = 1,
    className = "",
}) {
    const items = Array.from({ length: Math.max(1, Number(count) || 1) });

    return (
        <ul className={[
            "flex flex-col gap-3 max-w-[500px] mx-auto mt-8 mb-8 px-4 tablet:px-0 desktop:px-0", 
            className].join(" ")}>
            {items.map((_, i) => {
                if (variant === "cover") {
                    return <CardCoverSkel key={i} />;
                }
                if (variant === "simple") {
                    return <CardSimpleSkel key={i} />;
                }
                return <CardCompactSkel key={i} />; // default
            })}
        </ul>
    );
}

/* ----------------------- Variants ----------------------- */

function CardCompactSkel() {
    return (
        <li className="relative rounded-xl border border-[var(--color-gray-2)] bg-[var(--color-primary)] p-3">
            {/* 상단: 작성자/시간 */}
            <div className="flex items-center gap-2 mb-2">
                <Skel className="h-10 w-10 !rounded-full" />
                <div className="flex-1 flex flex-col">
                    <div className="flex flex-col gap-1">
                        <Skel className="h-3 w-1/3" />
                        <Skel className="h-3 w-1/4" />
                    </div>
                </div>
            </div>

            <Skel className="h-[1px] w-full mb-2" />

            <div className="flex flex-col gap-2 mb-2">
                <div className="flex gap-1">
                    <Skel className="h-[20px] w-[40px] rounded-md" />
                    <Skel className="h-[20px] w-[40px] rounded-md" />
                </div>
                <Skel className="h-4 w-3/4" />
            </div>

            {/* 본문: 좌 이미지 / 우 정보 */}
            <div className="flex items-stretch gap-2">
                {/* 좌: 이미지 */}
                <Skel className="w-[117px] aspect-square rounded-lg" />

                {/* 우: 정보 */}
                <div className="flex-1 flex flex-col">
                    <div className="flex flex-col gap-1">
                        <Skel className="h-3 w-1/3" />
                        <Skel className="h-3 w-2/4" />
                        <Skel className="h-3 w-1/3" />
                    </div>
                </div>
            </div>
        </li>
    );
}

function CardCoverSkel() {
    return (
        <li className="relative rounded-xl overflow-hidden border border-[var(--color-gray-2)] bg-[var(--color-primary)] h-[340px] flex flex-col justify-between ">
            {/* 하단 정보 */}
            <div className="flex gap-1 p-2 ml-auto">
                <Skel className="h-[22px] w-[40px] rounded-md" />
                <Skel className="h-[22px] w-[40px] rounded-md" />
            </div>
            <div className="flex flex-col justify-end p-2">
                <div className="flex gap-1 mb-2">
                    <Skel className="h-[22px] w-[56px] rounded-md" />
                    <Skel className="h-[22px] w-[64px] rounded-md" />
                </div>

                <Skel className="h-4 w-4/5 mb-2" />
                <Skel className="h-[1px] w-full mb-2" />

                <div className="flex flex-col gap-1">
                    <Skel className="h-3 w-1/2" />
                    <Skel className="h-3 w-2/3" />
                    <Skel className="h-3 w-1/3" />
                </div>
            </div>
        </li>
    );
}

function CardSimpleSkel() {
    return (
        <li className="relative rounded-xl border border-[var(--color-gray-2)] bg-[var(--color-primary)] p-3">
            {/* 상단: 작성자/시간 */}
            <div className="flex items-center gap-2 mb-2">
                <Skel className="h-10 w-10 !rounded-full" />
                <div className="flex-1 flex flex-col">
                    <div className="flex flex-col gap-1">
                        <Skel className="h-3 w-1/3" />
                        <Skel className="h-3 w-1/4" />
                    </div>
                </div>
            </div>

            <Skel className="h-[1px] w-full mb-2" />
            
            <div className="flex items-stretch gap-2">
                <Skel className="w-[96px] aspect-square rounded-lg" />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                            <Skel className="h-[20px] w-[48px] rounded-md" />
                            <Skel className="h-[20px] w-[56px] rounded-md" />
                        </div>
                        <Skel className="h-4 w-3/4" />
                        <div className="flex flex-col gap-1 min-w-0">
                            <Skel className="h-3 w-1/3" />
                            <Skel className="h-3 w-1/2" />
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
}
