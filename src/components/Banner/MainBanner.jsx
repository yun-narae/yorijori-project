import { useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, A11y } from "swiper/modules";
import "swiper/css";

import { mainBanners } from "@/data/mainBanners";

/**
 * 메인 배너
 * - 모바일: 1열, 태블릿(md)부터 2열
 * - 자동 슬라이드 + 커스텀 페이지네이션
 * - 사진 위 검정 투명 오버레이 + 흰색 텍스트
 * - 클릭 시 이동
 */

// 굵게 파싱
function renderBold(text = "") {
    // '**굵게**' 토큰을 유지한 채로 분할
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (/^\*\*.+\*\*$/.test(part)) {
            const inner = part.slice(2, -2);
            return (
                <strong key={i} className="font-extrabold">
                    {inner}
                </strong>
            );
        }
        return <span key={i}>{part}</span>;
    });
}

// </br> 줄바꿈 파싱
function renderRichText(str = "") {
    const withNewline = str.replaceAll("</br>", "\n");
    const lines = withNewline.split("\n");
    return lines.map((line, li) => (
        <span key={li}>
            {renderBold(line)}
            {li < lines.length - 1 && <br />}
        </span>
    ));
}

export default function MainBanner() {
    const items = useMemo(() => mainBanners, []);
    const [active, setActive] = useState(0);
    const swiperRef = useRef(null);

    return (
        <section className="max-w-[1030px] desktop:mt-8 w-screen relative left-1/2 right-1/2 -translate-x-1/2">
            <Swiper
                modules={[Autoplay, A11y]}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                onSlideChange={(swiper) => setActive(swiper.realIndex)}
                autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
                loop
                speed={650}
                spaceBetween={0}
                slidesPerView={1}
                breakpoints={{ 780: { slidesPerView: 2, spaceBetween: 0 } }}
                className="w-full desktop:rounded-2xl"
            >
                {items.map((item) => (
                    <SwiperSlide key={item.id}>
                        <div
                            className="relative block w-full overflow-hidden"
                            aria-label={`${item.title} 배너: ${item.sub}`}
                        >
                            {/* 이미지 */}
                            <img
                                src={item.image}
                                alt={`${item.category} 대표 이미지`}
                                loading="lazy"
                                className="w-full h-56 tablet:h-80 object-cover"
                            />
                            {/* 검정 투명 오버레이 */}
                            <div className="pointer-events-none absolute inset-0 bg-black/40" />
                            {/* 텍스트 */}
                            <div className="absolute inset-0 flex items-end">
                                <div className="p-4 tablet:p-5 text-left">
                                    <b 
                                        className="text-white text-mo-title-lg tablet:text-tab-title-lg desktop:text-pc-title-md font-normal drop-shadow"
                                    >
                                        {renderRichText(item.title)}
                                    </b>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Tailwind 커스텀 페이지네이션 */}
            <div className="mt-3 flex items-center justify-center gap-1.5">
                {items.map((_, i) => {
                    const isActive = i === active;
                    return (
                        <button
                            key={i}
                            type="button"
                            aria-label={`${i + 1}번째 배너로 이동`}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                                isActive
                                    ? "bg-[var(--color-gray-6)]"
                                    : "bg-[var(--color-gray-3)]"
                            }`}
                            onClick={() => {
                                if (!swiperRef.current) return;
                                swiperRef.current.slideToLoop(i);
                                setActive(i);
                            }}
                        />
                    );
                })}
            </div>
        </section>
    );
}
