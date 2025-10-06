import React from "react";
import Skel from './Skel';

export default function PostDetailSkeleton({
    className = "",
}) {
    return (
        <div className={["mx-auto mb-8 tablet:mt-2 desktop:mt-8", className].join(" ")}>
            <article className="flex flex-col tablet:px-[16px]">
                {/* 상단 이미지 & (desktop) 블러 배경 */}
                <div className="
                    w-full mx-auto overflow-hidden
                    tablet:relative tablet:max-w-[1060px] tablet:rounded-lg tablet:max-h-[320px] desktop:max-h-[390px]
                    desktop:relative desktop:max-w-[1060px] desktop:rounded-lg
                ">

                    {/* 대표 이미지 스켈레톤 */}
                    <div className="
                        w-full mx-auto 
                        desktop:max-w-[1060px] aspect-[6/4]
                        tablet:rounded-lg desktop:rounded-lg overflow-hidden
                    ">
                        <Skel className="inset-0 w-full h-full rounded-none" />
                    </div>
                </div>

                {/* 본문 컨테이너 */}
                <div className="
                    mt-4 mb-4 desktop:mt-6
                    px-[16px] tablet:px-0 desktop:px-0
                    w-full mx-auto
                    desktop:max-w-[1060px] desktop:flex  desktop:justify-between desktop:gap-4
                ">
                    {/* 메인 본문 */}
                    <div className="flex flex-col justify-between w-full">
                        <div className="flex flex-col gap-3 w-full mx-auto">
                            {/* 헤더(모바일/태블릿) */}
                            <div className="flex items-center gap-2 desktop:hidden">
                                <div className="w-full flex justify-between gap-2">
                                    <Skel className="h-10 w-10 !rounded-full" />
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex flex-col gap-1">
                                            <Skel className="h-3 w-1/3" />
                                            <Skel className="h-3 w-1/4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 mb-2">
                                <div className="hidden desktop:flex gap-1">
                                    <Skel className="h-4 w-[40px]" />
                                    <Skel className="h-4 w-[40px]" />
                                </div>
                                <Skel className="h-5 w-3/4" />
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    );
}
