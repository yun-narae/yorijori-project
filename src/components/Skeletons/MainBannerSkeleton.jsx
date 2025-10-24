import React from "react";
import Skel from './Skel';

/**
 * MainBannerSkeleton
 * - MainBanner가 로딩될 때 보여줄 스켈레톤
 * - 모바일: 1열, 태블릿(md)부터 2열
 * - 자동 슬라이드 + 커스텀 페이지네이션
 */
export default function MainBannerSkeleton() {
    return (
        <section className="max-w-[1030px] desktop:mt-8 w-screen relative left-1/2 right-1/2 -translate-x-1/2">
            {/* 스와이퍼 영역 */}
            <div className="w-full rounded-2xl overflow-hidden">
                <div className="flex gap-0">
                    {/* 모바일: 1개, 태블릿부터: 2개 */}
                    <div className="flex-1">
                        <BannerItemSkel />
                    </div>
                    <div className="hidden  flex-1">
                        <BannerItemSkel />
                    </div>
                </div>
            </div>
        </section>
    );
}

function BannerItemSkel() {
    return (
        <div className="relative block w-full overflow-hidden">
            {/* 이미지 */}
            <Skel className="w-full h-56 tablet:h-80" />
            
            {/* 검정 투명 오버레이 */}
            <div className="pointer-events-none absolute inset-0" />
            
            {/* 텍스트 */}
            <div className="absolute inset-0 flex items-end">
                <div className="p-4 tablet:p-5 text-left">
                    <Skel className="h-6 w-3/4 mb-2" />
                    <Skel className="h-4 w-1/2 mt-1" />
                </div>
            </div>
        </div>
    );
}
