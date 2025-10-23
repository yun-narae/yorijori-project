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
    return (
        <>
            <Swiper
                modules={[Autoplay]}
                autoplay={{
                    delay: 3000,
                    disableOnInteraction: false,
                }}
                loop={true}
                slidesPerView={1}
                spaceBetween={16}
                breakpoints={{
                    780: {
                        slidesPerView: 2,
                        spaceBetween: 16,
                    }
                }}
                className="w-full !overflow-x-visible !overflow-y-visible"
            >
                {NOTICE_MESSAGES.map((message, index) => (
                    <SwiperSlide key={index}>
                        <div className="bg-[var(--color-gray-1)] rounded-lg shadow-[0_6px_20px_rgba(0,0,0,0.1)] p-2 tablet:p-3">
                            <div className="flex items-center gap-3">
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
