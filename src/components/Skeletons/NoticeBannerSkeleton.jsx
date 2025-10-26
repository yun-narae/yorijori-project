import React from "react";
import Skel from './Skel';

/**
 * NoticeBannerSkeleton
 * - NoticeBanner가 로딩될 때 보여줄 스켈레톤
 * - 모바일: 1열, 태블릿(md)부터 2열
 * - 자동 슬라이드
 */
export default function NoticeBannerSkeleton() {
    return (
        <div className="w-full rounded-2xl overflow-hidden">
            <div className="flex gap-2">
                {/* 모바일: 1개, 태블릿부터: 2개 */}
                <div className="flex-1">
                    <NoticeItemSkel />
                </div>
                <div className="hidden tablet:block flex-1">
                    <NoticeItemSkel />
                </div>
            </div>
        </div>
    );
}

function NoticeItemSkel() {
    return (
        <div className="relative block w-full overflow-hidden">
            {/* 배경 이미지 */}
            <Skel className="w-full tablet:h-20" />
            
            {/* 오버레이 */}
            <div className="pointer-events-none absolute" />

        </div>
    );
}
