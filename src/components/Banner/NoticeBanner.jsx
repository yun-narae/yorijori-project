import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import SvgIcon from "../SvgIcon/SvgIcon";

const NOTICE_MESSAGES = [
    "요리로 이어지는 작은 공간, 요리조리",
    "크리스마스 준비는 요리조리에서!",
];

export default function NoticeBanner() {
    // 슬라이드가 2개뿐이므로 loop 모드에서 문제가 발생할 수 있음
    // 태블릿/데스크톱에서는 2개가 모두 보이므로 loop 비활성화
    const shouldLoop = NOTICE_MESSAGES.length > 2;

    return (
        <>
            <Swiper
                modules={[Autoplay]}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                loop={shouldLoop}
                slidesPerView={1}
                spaceBetween={16}
                breakpoints={{
                    780: {
                        slidesPerView: 2,
                        spaceBetween: 16,
                    }
                }}
                className="w-full"
            >
                {NOTICE_MESSAGES.map((message, index) => (
                    <SwiperSlide key={index}>
                        <div className="border border-[var(--color-gray-2)] rounded-lg p-2 tablet:p-3">
                            <div className="flex items-center gap-1">
                                <div className="flex-shrink-0">
                                    <SvgIcon
                                        name="forkKnife"
                                        iconClass="text-[var(--color-redorange-2)] w-6 h-6"
                                        tabIndex={-1}
                                    />
                                </div>
                                <p className="text-[var(--color-gray-8)] font-medium text-mo-title tablet:text-tab-title desktop:text-pc-title leading-relaxed">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </>
    );
}
