import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

// 3rd-party (Swiper)
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// Hooks
import useFetchFiles from "../hooks/useFetchFiles";

// Context / Lib
import { useAuth } from "../contexts/AuthContext";
import pb from "../lib/pocketbase";
import getPbImageURL from "../lib/getPbImageURL";
import { isOwnerOf } from "../lib/postOwner";

// Components
import CategoryBadgeList from "../components/Badges/CategoryBadgeList";
import StatusBadgeIconGroup from "../components/Badges/StatusBadgeIconGroup";
import InfoHeaderRowGroup from "../components/Info/InfoHeaderRowGroup";
import InfoTitle from "../components/Info/InfoTitle";
import InfoImage from "../components/Info/InfoImage";
import InfoPeople from "../components/Info/InfoPeople";
import InfoLocation from "../components/Info/InfoLocation";
import InfoDate from "../components/Info/InfoDate";
import InfoTime from "../components/Info/InfoTime";
import InfoFee from "../components/Info/InfoFee";
import InfoLike from "../components/Info/InfoLike";
import InfoDescription from "../components/Info/InfoDescription";
import InfoComment from "../components/Info/InfoComment";
import ProfileAvatar from "../components/User/ProfileAvatar";
import CustomButton from "../components/CustomButton/CustomButton";
import SvgIcon from "../components/SvgIcon/SvgIcon";
import Input from "../components/Input/Input";
import PostDetailSkeleton from "../components/Skeletons/PostDetailSkeleton";

export default function PostDetail() {
    // Refs
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    // State
    const [swiperInst, setSwiperInst] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [post, setPost] = useState(null);
    const [err, setErr] = useState(null);
    const [comment, setComment] = useState("");
    const { dataLoading } = useFetchFiles("files", 1, 50);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const showSkeleton = dataLoading || isSubmitting;

    // Auth / Router
    const { user } = useAuth();
    const { postId } = useParams();

    // Derived
    const isOwner = React.useMemo(
    () => isOwnerOf(post, user?.id),
    [post, user?.id]
    );

    // Typography / color tokens
    const infoSize = "text-mo-text-md tablet:text-tab-text desktop:text-pc-text";
    const infoColor = "text-[var(--color-gray-7)]";

    const infoTitleSize = "text-mo-title-lg tablet:text-tab-title-md desktop:text-pc-title-md";
    const infoTitleColor = "text-[var(--color-gray-6)]";

    const titleSize = "font-bold text-mo-title-xl tablet:text-tab-title-xl desktop:text-pc-title-lg";
    const titleoColor = "text-[var(--color-gray-8)]";

    const infoCommentSize = "font-bold text-mo-text tablet:text-tab-text desktop:text-pc-text";
    const infoCommentColor = "text-[var(--color-gray-5)]";

    const infoLikeSize = "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm";
    const infoLikeColor = "text-[var(--color-gray-5)]";

    // Fetch post
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const rec = await pb.collection("post").getOne(postId, {
                    expand: "editor",
                    fields: [
                        "id",
                        "title",
                        "description",
                        "category",
                        "images",
                        "capacity",
                        "location",
                        "date",
                        "timeStart",
                        "timeEnd",
                        "fee",
                        "likeCount",
                        "commentCount",
                        "editor",
                        "updated",
                        "created",
                        "collectionId",
                        "collectionName",
                    ].join(","),
                });
                if (!mounted) return;
                setPost(rec);
            } catch (e) {
                setErr(e?.message ?? String(e));
            }
        })();
        return () => { mounted = false; };
    }, [postId]);

    // ✅ 네비게이션 바인딩/갱신
    useEffect(() => {
        if (!swiperInst) return;
    
        const rebindNav = () => {
        const s = swiperInst;
    
        // 네비 모듈이 아직 없으면 건너뜀
        const navParams = s.params?.navigation;
        if (!navParams) return;
    
        navParams.prevEl = prevRef.current;
        navParams.nextEl = nextRef.current;
        navParams.enabled = window.matchMedia("(min-width: 780px)").matches;
    
        // 모듈이 살아 있으면 재초기화
        if (s.navigation && typeof s.navigation.init === "function") {
            s.navigation.destroy();
            s.navigation.init();
            s.navigation.update();
        } else {
            // 아직 navigation 객체가 없다면 전체 업데이트만
            s.update();
        }
        };
    
        rebindNav();
        window.addEventListener("resize", rebindNav);
        return () => window.removeEventListener("resize", rebindNav);
    }, [swiperInst]);

    // Images urls (memo)
    const imgUrls = React.useMemo(() => {
        const files = Array.isArray(post?.images)
            ? post.images
            : post?.images
            ? [post.images]
            : [];
        return files.map((fn) => pb.files.getURL(post, fn));
    }, [post]);

    // Reset index when images count changes
    React.useEffect(() => {
        setCurrentIndex(0);
    }, [imgUrls.length]);

    return (
        <>

            {showSkeleton ? (
                <PostDetailSkeleton />
            ) : (
                <div className="mx-auto mt-[60px] mb-8 tablet:mt-8 desktop:mt-8">
                    <article className="flex flex-col tablet:px-[16px]">
                        {/* 이미지 & 스와이퍼 */}
                        {(() => {
                            const files = Array.isArray(post?.images)
                                ? post.images
                                : post?.images
                                ? [post.images]
                                : [];
                            const count = files.length;

                            if (count <= 1) {
                                // 1장: 스와이퍼 OFF + (desktop) 블러 배경
                                return (
                                    <div className="w-full mx-auto overflow-hidden 
                                    tablet:relative tablet:max-w-[1060px] tablet:rounded-lgdesktop:relative desktop:max-w-[1060px] desktop:rounded-lg">
                                        {/* desktop 전용 블러 배경 */}
                                        {post?.images && (
                                            <div className="hidden absolute inset-0 -z-10 tablet:block desktop:block">
                                                <div
                                                    aria-hidden="true"
                                                    className="w-[1060px] mx-auto h-full bg-center bg-cover blur-[40px]"
                                                    style={{ backgroundImage: `url(${getPbImageURL(post, "images")})` }}
                                                />
                                            </div>
                                        )}

                                        <InfoImage
                                            record={post}
                                            swiper={false}
                                            className="relative z-10
                                            w-full mx-auto
                                            tablet:max-w-[500px] desktop:max-w-[500px]
                                            aspect-[6/4]
                                            rounded-none
                                            overflow-hidden"
                                        />
                                    </div>
                                );
                            }
                            // ✅ 2장 이상 공통: 스와이퍼 사용
                            // - 모바일: 1장씩
                            // - 태블릿/데스크톱: 2장 나란히 (슬라이드로 3번째 이후 넘김)
                            return (
                                    <div className="relative w-full mx-auto desktop:px-0 desktop:max-w-[1060px]">
                                        <Swiper
                                            className="tablet:rounded-lg desktop:rounded-lg overflow-hidden"
                                            modules={[Navigation]}
                                            slidesPerView={1}
                                            spaceBetween={12}
                                            allowTouchMove={true}
                                            simulateTouch={true}
                                            // 기본(모바일/태블릿)은 화살표 숨김
                                            navigation={false}
                                            pagination={false}
                                            // 브레이크포인트에서 2장 보이며 화살표 표시
                                            breakpoints={{
                                                780:  { slidesPerView: 2, navigation: { enabled: true } },
                                                1060: { slidesPerView: 2, navigation: { enabled: true } },
                                            }}
                                            // 초기 마운트 시 현재 화면 크기에 맞춰 navigation 적용
                                            onBeforeInit={(swiper) => {
                                                const w = window.innerWidth;
                                                const enable = w >= 780; // 780 이상이면 화살표 켬
                                                swiper.params.navigation.enabled = enable;
                                                swiper.params.navigation.prevEl = prevRef.current;
                                                swiper.params.navigation.nextEl = nextRef.current;
                                            }}
                                            // 브레이크포인트 변화 시 navigation 재적용
                                            onBreakpoint={(swiper, params) => {
                                                const enable = !!params?.navigation?.enabled;
                                                swiper.params.navigation.enabled = enable;
                                                swiper.navigation?.init();
                                                swiper.navigation?.update();
                                            }}
                                            // 슬라이드 변경 시 인덱스 갱신
                                            onSlideChange={(swiper) => {
                                                // loop 사용 안 할 때도 realIndex가 안전
                                                setCurrentIndex(swiper.realIndex ?? swiper.activeIndex ?? 0);
                                                // 2장뿐이면 끝/처음에서 이동 제한(선택)
                                                if (swiper.slides && swiper.slides.length && swiper.params.slidesPerView === 2) {
                                                    swiper.allowSlidePrev = swiper.activeIndex !== 0;
                                                    swiper.allowSlideNext = swiper.activeIndex !== (swiper.slides.length - 1);
                                                }
                                            }}
                                            // ✅ ref가 준비된 다음에 네비게이션 연결
                                            onInit={(s) => setSwiperInst(s)} // ✅ 인스턴스 저장
                                        >
                                            {imgUrls.map((url, i) => (
                                                <SwiperSlide key={i}>
                                                    <div className="relative aspect-[4/3] overflow-hidden">
                                                        <img
                                                            src={url}
                                                            alt={`${post?.title ?? "post image"} ${i + 1}`}
                                                            className="absolute inset-0 w-full h-full object-cover object-center"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                            <button
                                                ref={prevRef}
                                                type="button"
                                                aria-label="이전 이미지"
                                                className="
                                                    hidden tablet:flex
                                                    absolute left-2 top-1/2 -translate-y-1/2 z-20
                                                    h-10 w-10 rounded-full
                                                    items-center justify-center
                                                    bg-stone-400/[70%] hover:bg-stone-400/[50%] backdrop-blur-md
                                                    border border-[var(--color-gray-6)]
                                                    shadow-sm hover:shadow
                                                    transition
                                                    /* Swiper가 비활성화시 붙이는 클래스 대응 */
                                                    [&.swiper-button-disabled]:opacity-40
                                                    [&.swiper-button-disabled]:pointer-events-none
                                                "
                                            >
                                                <SvgIcon
                                                    name="arrow-left"
                                                    iconClass="w-5 h-5 text-stone-800"
                                                    frameClass="pointer-events-none"
                                                />
                                            </button>

                                            {/* ▶ Next */}
                                            <button
                                                ref={nextRef}
                                                type="button"
                                                aria-label="다음 이미지"
                                                className="
                                                    hidden tablet:flex
                                                    absolute right-2 top-1/2 -translate-y-1/2 z-20
                                                    h-10 w-10 rounded-full
                                                    items-center justify-center
                                                    bg-stone-400/[70%] hover:bg-stone-400/[50%] backdrop-blur-md
                                                    border border-[var(--color-gray-6)]
                                                    shadow-sm hover:shadow
                                                    transition
                                                    [&.swiper-button-disabled]:opacity-40
                                                    [&.swiper-button-disabled]:pointer-events-none
                                                "
                                            >
                                                <SvgIcon
                                                    name="arrow-right"
                                                    iconClass="w-5 h-5 text-stone-800"
                                                    frameClass="pointer-events-none"
                                                />
                                            </button>
                                        </Swiper>
                                        {imgUrls.length > 0 && (
                                            <p
                                                className="
                                                    tablet:hidden
                                                    desktop:hidden
                                                    absolute right-2 bottom-2
                                                    px-2 py-1 bg-stone-700/[70%] text-white text-sm rounded-md z-10
                                                "
                                            >
                                                {currentIndex + 1}/{imgUrls.length}
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}

                        {/* contentWrapper */}
                        <div className="
                            mt-4 mb-4 desktop:mt-6
                            px-[16px] tablet:px-0 desktop:px-0
                            w-full mx-auto
                            desktop:max-w-[1060px] desktop:flex desktop:justify-between desktop:gap-4
                        ">
                            {/* desktop:heart */}
                            <div className="
                                hidden desktop:block
                                z-10
                                fixed
                                bottom-0 left-0 right-0
                                bg-[var(--color-primary)]
                                border-t border-[var(--color-gray-2)]
                                desktop:sticky desktop:top-20 desktop:h-full desktop:max-w-[348px] desktop:bg-transparent desktop:border-none
                            ">
                                <div className="
                                    flex gap-2 w-full mx-auto
                                    px-[16px] py-2
                                    tablet:px-0
                                    desktop:px-0 desktop:py-0
                                    max-w-[500px]
                                ">
                                    <InfoLike className="
                                        hidden desktop:flex w-[50px] h-[50px] aspect-square
                                        flex-col items-center justify-center bg-[var(--color-gray-2)] border border-[var(--color-gray-4)] rounded-full" infoLikeSize={`${infoLikeSize}`} infoLikeColor={`${infoLikeColor}`}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-10">
                                <div className="
                                    flex flex-col gap-3
                                    w-full mx-auto
                                ">
                                    <InfoHeaderRowGroup
                                        post={post}
                                        user={user}
                                        className="desktop:hidden"
                                    />
                                
                                    {/* 타이틀 */}
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex flex-col gap-1">
                                            <StatusBadgeIconGroup
                                                post={post}
                                                className="hidden desktop:flex"
                                                iconFrameClass="hidden"
                                            />
                                            <InfoTitle
                                                title={post?.title}
                                                className={`line-clamp-none ${titleSize}`}
                                                fontSize={titleSize}
                                                titleoColor={titleoColor}
                                            />
                                        </div>
                                    </div>
                                    <ul className="flex flex-col gap-4">
                                        {/* 카테고리 */}
                                        <li className="flex flex-col gap-2">
                                            <b className={`${infoTitleSize} ${infoTitleColor}`}>모임할 테마</b>
                                            <CategoryBadgeList
                                                categories={post?.category ?? []}
                                                itemClassName={`font-normal`}
                                                fontSize={infoSize}
                                            />
                                        </li>
                                        {/* 날짜 + 시간 */}
                                        <li className="flex flex-col gap-2">
                                            <b className={`${infoTitleSize} ${infoTitleColor}`}>모임할 일정</b>
                                            <InfoDate post={post} infoColor={infoColor} infoSize={infoSize} className="!w-auto" />
                                            <div className="flex items-center gap-1">
                                                <InfoTime
                                                    post={post}
                                                    infoColor={infoColor}
                                                    infoSize={infoSize}
                                                    className="!w-auto gap-1 "
                                                    starClassName="px-[8px] py-[2px] text-[var(--color-gray-8)] ap bg-[var(--color-gray-2)] rounded-md whitespace-nowrap"
                                                    endClassName="px-[8px] py-[2px] text-[var(--color-gray-8)] ap bg-[var(--color-gray-2)] rounded-md whitespace-nowrap"
                                                    separator="부터"
                                                />
                                                <span className={`${infoColor} ${infoSize}`}>까지</span>
                                            </div>
                                        </li>
                                        {/* 위치 */}
                                        <li className="flex flex-col gap-2">
                                            <b className={`${infoTitleSize} ${infoTitleColor}`}>모임할 장소</b>
                                            <InfoLocation post={post} infoColor={infoColor} infoSize={infoSize} />
                                        </li>
                                        {/* 참가비 */}
                                        <li className="flex flex-col gap-2">
                                            <b className={`${infoTitleSize} ${infoTitleColor}`}>참가비</b>
                                            <InfoFee post={post} infoColor={infoColor} infoSize={infoSize} />
                                        </li>
                                        <li className="flex flex-col gap-2">
                                            <b className={`${infoTitleSize} ${infoTitleColor}`}>모임할 장소</b>
                                            <InfoDescription post={post} infoColor={infoColor} infoSize={infoSize} className="max-w-[620px]"/>
                                        </li>
                                        {/* 예약자 */}
                                        <li className="flex flex-col items-start gap-2">
                                            <div className="flex gap-1">
                                                <b className={`whitespace-nowrap ${infoTitleSize} ${infoTitleColor}`}>참여인원</b>
                                                <InfoPeople post={post} infoColor={`text-[var(--color-gray-5)]`} infoSize={infoSize} iconShow={false} />
                                            </div>
                                            <div className="flex -space-x-1">
                                                {/* 참여자의 프로필 표시 예정*/}
                                                <ProfileAvatar user={user} click={null} />
                                                <ProfileAvatar user={user} click={null} />
                                                <ProfileAvatar user={user} click={null} />
                                                <ProfileAvatar user={user} click={null} />
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                {/* 구분선 */}
                                <span className="h-[1px] w-full bg-[var(--color-gray-2)]" />

                                {/* 댓글 */}
                                <div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex flex-col gap-2">
                                            <InfoComment variant="v2" count={post?.commentCount ?? 0} infoCommentColor={infoCommentColor} infoCommentSize={infoCommentSize} />
                                            <Input
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                placeholder="최대 300자까지 가능해요."
                                                name="요리모임에 대한 소개"
                                                textarea
                                            />
                                        </div>
                                        <CustomButton
                                            text="댓글 작성"
                                            size="sm"
                                            custombuttonClass="self-end w-[70px]"
                                        />
                                    </div>
                                </div>
                                {/* 댓글 받아오는 곳 */}
                                <ul className="flex flex-col gap-3">
                                    <li className="flex flex-col gap-2">
                                        <InfoHeaderRowGroup
                                            post={post}
                                            user={user}
                                            showSvgIcon={false}
                                            showStatusBadge={false}
                                            showEditAndDelete={isOwner ? true : false}
                                        />
                                        <p className={`whitespace-nowrap ${infoColor} ${infoSize}`}>사용자가 단 댓글</p>
                                        {/* 구분선 */}
                                        <span className="h-[1px] w-full bg-[var(--color-gray-2)]" />
                                    </li>
                                    <li className="flex flex-col gap-2">
                                        <InfoHeaderRowGroup
                                            post={post}
                                            user={user}
                                            showSvgIcon={false}
                                            showStatusBadge={false}
                                            showEditAndDelete={isOwner ? true : false}
                                        />
                                        <p className={`whitespace-nowrap ${infoColor} ${infoSize}`}>사용자가 단 댓글</p>
                                        {/* 구분선 */}
                                        <span className="h-[1px] w-full bg-[var(--color-gray-2)]" />
                                    </li>
                                </ul>
                            </div>
                            {!isOwner ? (
                                <div className="
                                    fixed 
                                    w-full 
                                    bottom-0 left-0 right-0 
                                    bg-[var(--color-primary)] 
                                    border-t border-[var(--color-gray-2)]
                                    z-10
                                    desktop:sticky desktop:top-20 desktop:h-full desktop:max-w-[348px] desktop:bg-transparent desktop:border-none
                                ">
                                    <div className="
                                        flex gap-2 w-full mx-auto flex-col
                                        px-[16px] py-2 desktop:px-0 desktop:py-0
                                    ">
                                        <InfoHeaderRowGroup 
                                            post={post} 
                                            user={user}
                                            className="hidden desktop:flex"
                                            showStatusBadge={false}
                                        />
                                        <CustomButton 
                                            text="예약하기" 
                                            size="lg" 
                                            custombuttonClass="w-full" 
                                            subIconName="heart-1"
                                            subIconframeClass="desktop:hidden"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="
                                    hidden desktop:block
                                    fixed 
                                    w-full 
                                    bottom-0 left-0 right-0 
                                    bg-[var(--color-primary)] 
                                    border-t border-[var(--color-gray-2)]
                                    z-10
                                    desktop:sticky desktop:top-20 desktop:h-full desktop:max-w-[348px] desktop:bg-transparent desktop:border-none
                                ">
                                    <div className="
                                        flex gap-2 w-full mx-auto flex-col
                                        px-[16px] py-2 desktop:px-0 desktop:py-0
                                    ">
                                        <InfoHeaderRowGroup 
                                            post={post} 
                                            user={user}
                                            className="hidden desktop:flex"
                                            showStatusBadge={false}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </article>
                </div>
            )}
        </>
    );
}
