// src/components/Info/InfoImage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import pb from "../../lib/pocketbase";
import getPbImageURL from "../../lib/getPbImageURL";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

/**
 * InfoImage (Swiper 지원)
 * - images: File[] | Blob[] | string[] (파일명) 우선 사용
 * - record: PB 레코드(문자열 파일명 → URL 생성)
 * - swiper: true면 Swiper, false면 첫 장만
 * - 버튼/화살표는 없고, 페이지네이션 점만 표시(네 코드 그대로)
 */
export default function InfoImage({
    images,
    record,
    swiper = true,
    className = "",
    imgClassName = "absolute inset-0 w-full h-full object-cover object-center",
    rounded = "rounded-lg",
    showCount = swiper,
    onIndexChange,
}) {
    // ✅ 훅들은 항상 최상단에서 같은 순서로 호출
    const rawFiles = useMemo(() => {
        const src = images ?? record?.images;
        if (!src) return [];
        return Array.isArray(src) ? src : [src];
    }, [images, record]);

    const [urls, setUrls] = useState([]);
    useEffect(() => {
        const created = [];
        const toUrl = (f) => {
            if ((typeof File !== "undefined" && f instanceof File) ||
                (typeof Blob !== "undefined" && f instanceof Blob)) {
                const u = URL.createObjectURL(f);
                created.push(u);
                return u;
            }
            if (typeof f === "string") {
                try {
                    const api = pb?.files;
                    if (api?.getURL) return api.getURL(record, f);
                    if (api?.getUrl) return api.getUrl(record, f);
                } catch {}
                return record ? getPbImageURL(record, "images") : null;
            }
            return null;
        };
        const list = rawFiles.map(toUrl).filter(Boolean);
        setUrls(list);
        return () => { created.forEach((u) => URL.revokeObjectURL(u)); };
    }, [rawFiles, record]);

    const [currentIndex, setCurrentIndex] = useState(0);
    useEffect(() => {
        if (currentIndex >= urls.length) setCurrentIndex(0);
    }, [urls.length, currentIndex]);

    useEffect(() => { onIndexChange?.(currentIndex); }, [currentIndex, onIndexChange]);

    // ✅ 항상 선언(조건부 훅 금지)
    const swiperRef = useRef(null);

    // 공통 핸들러 (네 로직 그대로)
    const handleInitOrChange = (swiper) => {
        setCurrentIndex(swiper.activeIndex);

        if (urls.length === 1) {
            swiper.allowSlidePrev = false;
            swiper.allowSlideNext = false;
            return;
        }
        swiper.allowSlidePrev = swiper.activeIndex !== 0;
        swiper.allowSlideNext = swiper.activeIndex !== (urls.length - 1);
    };

    // --- 렌더 분기 (훅 호출 이후에만 return) ---
    if (!urls.length) {
        return (
            <div className={["bg-[var(--color-gray-2)]", rounded, className].join(" ")} />
        );
    }

    if (!swiper) {
        return (
            <div className={["relative overflow-hidden", rounded, className].join(" ")}>
                <img
                    src={urls[0]}
                    alt="요리모임 이미지 1"
                    className={imgClassName}
                    loading="lazy"
                />
                {showCount && (
                    <p className="absolute right-2 bottom-2 px-2 py-1 bg-stone-700/[70%] text-white text-sm rounded-md z-10">
                        1/{urls.length}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className={["relative overflow-hidden", rounded, className].join(" ")}>
            <Swiper
                className="h-full"
                slidesPerView={1}
                onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                    handleInitOrChange(swiper); // 초기 상태 반영
                }}
                onSlideChange={handleInitOrChange}
            >
                {urls.map((u, index) => (
                    <SwiperSlide key={index}>
                        <img
                            src={u}
                            alt={`요리모임 이미지 ${index + 1}`}
                            className={imgClassName}
                            loading="lazy"
                        />
                    </SwiperSlide>
                ))}
            </Swiper>

            {showCount && urls.length > 0 ? (
                <p className="absolute right-2 bottom-2 px-2 py-1 bg-stone-700/[70%] text-white text-sm rounded-md z-10">
                    {currentIndex + 1}/{urls.length}
                </p>
            ) : null}
        </div>
    );
}
