import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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
import { deletePostWithConfirm } from "../lib/deletePostWithConfirm";

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
import { useConfirm } from "../components/Modal/ConfirmProvider";

export default function PostDetail() {
    // Refs
    const prevRef = useRef(null);
    const nextRef = useRef(null);

    // State
    const [swiperInst, setSwiperInst] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [post, setPost] = useState(null);
    const [err, setErr] = useState(null);
    const [likedOnDetail, setLikedOnDetail] = useState(false);
    const [comment, setComment] = useState("");
    const { dataLoading } = useFetchFiles("files", 1, 50);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const showSkeleton = dataLoading || isSubmitting;
    const confirm = useConfirm();

    // Auth / Router
    const { user: authUser } = useAuth();
    const { postId } = useParams();
    const navigate = useNavigate();

    // Derived
    const isOwner = React.useMemo(
        () => isOwnerOf(post, authUser?.id),
        [post, authUser?.id]
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
                const rec = await pb.collection("post").getOne(postId, { expand: "editor", fields: "*" });
                if (!mounted) return;
                setPost(rec);
            } catch (e) {
                setErr(e?.message ?? String(e));
            }
        })();
        return () => { mounted = false; };
    }, [postId]);

    // 네비게이션 바인딩/갱신
    useEffect(() => {
        if (!swiperInst) return;

        const rebindNav = () => {
            const s = swiperInst;
            const navParams = s.params?.navigation;
            if (!navParams) return;

            navParams.prevEl = prevRef.current;
            navParams.nextEl = nextRef.current;
            navParams.enabled = window.matchMedia("(min-width: 780px)").matches;

            if (s.navigation && typeof s.navigation.init === "function") {
                s.navigation.destroy();
                s.navigation.init();
                s.navigation.update();
            } else {
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
    useEffect(() => {
        setCurrentIndex(0);
    }, [imgUrls.length]);

    // 게시물 삭제
    const handleDeleteHere = useCallback(() => {
        if (!post?.id) return;
        deletePostWithConfirm(post.id, {
            confirm,
            before: () => setIsSubmitting(true),
            after: () => setIsSubmitting(false),
            onSuccess: () => {
                navigate(`/post/mypost/${authUser?.id ?? ":userId"}`, { replace: true });
            },
        });
    }, [post?.id, navigate, authUser?.id]);

    // 게시물 수정
    const handleEditHere = useCallback(() => {
        if (!post?.id) return;
        location.assign(`/post/edit/${post.id}`);
    }, [post?.id]);

    // 좋아요
    useEffect(() => {
        const userId = authUser?.id;
        if (!userId || !postId) return;
      
        const key = `likes_${userId}`;
        const readLiked = () => {
          try {
            const raw = localStorage.getItem(key);
            const arr = raw ? JSON.parse(raw) : [];
            return arr.some((it) => it?.id === postId);
          } catch {
            return false;
          }
        };
      
        // 초기 상태 동기화
        setLikedOnDetail(readLiked());
      
        // 실시간 동기화
        const onStorage = (e) => {
          if (e.key === key) setLikedOnDetail(readLiked());
        };
        const onCustom = (e) => {
          const d = e.detail;
          if (d && d.userId === userId && d.postId === postId) setLikedOnDetail(d.liked);
        };
      
        window.addEventListener("storage", onStorage);
        window.addEventListener("likes:changed", onCustom);
        return () => {
          window.removeEventListener("storage", onStorage);
          window.removeEventListener("likes:changed", onCustom);
        };
      }, [authUser?.id, postId]);

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
                                return (
                                    <div className="w-full mx-auto overflow-hidden 
                                    tablet:relative tablet:max-w-[1060px] tablet:rounded-lg desktop:relative desktop:max-w-[1060px] desktop:rounded-lg">
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
                            return (
                                <div className="relative w-full mx-auto desktop:px-0 desktop:max-w-[1060px]">
                                    <Swiper
                                        className="tablet:rounded-lg desktop:rounded-lg overflow-hidden"
                                        modules={[Navigation]}
                                        slidesPerView={1}
                                        spaceBetween={12}
                                        allowTouchMove={true}
                                        simulateTouch={true}
                                        navigation={false}
                                        pagination={false}
                                        breakpoints={{
                                            780:  { slidesPerView: 2, navigation: { enabled: true } },
                                            1060: { slidesPerView: 2, navigation: { enabled: true } },
                                        }}
                                        onBeforeInit={(swiper) => {
                                            const w = window.innerWidth;
                                            const enable = w >= 780;
                                            swiper.params.navigation.enabled = enable;
                                            swiper.params.navigation.prevEl = prevRef.current;
                                            swiper.params.navigation.nextEl = nextRef.current;
                                        }}
                                        onBreakpoint={(swiper, params) => {
                                            const enable = !!params?.navigation?.enabled;
                                            swiper.params.navigation.enabled = enable;
                                            swiper.navigation?.init();
                                            swiper.navigation?.update();
                                        }}
                                        onSlideChange={(swiper) => {
                                            setCurrentIndex(swiper.realIndex ?? swiper.activeIndex ?? 0);
                                            if (swiper.slides && swiper.slides.length && swiper.params.slidesPerView === 2) {
                                                swiper.allowSlidePrev = swiper.activeIndex !== 0;
                                                swiper.allowSlideNext = swiper.activeIndex !== (swiper.slides.length - 1);
                                            }
                                        }}
                                        onInit={(s) => setSwiperInst(s)}
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
                                    <InfoLike
                                        postId={post?.id}
                                        post={post}
                                        initialCount={Number(post?.likesCount) || 0}
                                        count={true}
                                        className="
                                            hidden desktop:flex w-[50px] h-[50px] aspect-square
                                            flex-col items-center justify-center bg-[var(--color-gray-2)] border border-[var(--color-gray-4)] rounded-full
                                        " 
                                        infoLikeSize={`${infoLikeSize}`} 
                                        infoLikeColor={`${infoLikeColor}`}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-10 w-full">
                                <div className="
                                    flex flex-col gap-3
                                    w-full mx-auto
                                ">
                                    <InfoHeaderRowGroup
                                        post={post}
                                        user={authUser}                                  
                                        currentUserId={authUser?.id}                     
                                        author={post?.expand?.editor ?? null}            
                                        className="desktop:hidden"
                                        onDeletePost={handleDeleteHere}
                                        onEditPost={handleEditHere}
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
                                        {/* mo/tab:heart */}
                                        <div className="desktop:hidden">
                                            <InfoLike 
                                                postId={post?.id}
                                                post={post}
                                                initialCount={Number(post?.likesCount) || 0}
                                                count={true}
                                                className="
                                                    w-[60px] pl-[6px] pr-[12px]
                                                    items-center justify-center bg-[var(--color-gray-2)] border border-[var(--color-gray-4)] rounded-full gap-1 hover:bg-[var(--color-gray-3)]
                                                " 
                                                infoLikeSize={`${infoLikeSize}`} 
                                                infoLikeColor={`${infoLikeColor}`}
                                                infoCountClass="tablet:translate-y-[1px]"
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
                                                <ProfileAvatar user={authUser} click={null} />
                                                <ProfileAvatar user={authUser} click={null} />
                                                <ProfileAvatar user={authUser} click={null} />
                                                <ProfileAvatar user={authUser} click={null} />
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
                                            custombuttonClass="self-end !w-[70px]"
                                        />
                                    </div>
                                </div>
                                {/* 댓글 받아오는 곳 */}
                                <ul className="flex flex-col gap-3">
                                    <li className="flex flex-col gap-2">
                                        <InfoHeaderRowGroup
                                            post={post}
                                            user={authUser}                              
                                            currentUserId={authUser?.id}                 
                                            author={post?.expand?.editor ?? null}        
                                            showSvgIcon={false}
                                            showStatusBadge={false}
                                            showEditAndDelete={isOwner ? true : false}
                                        />
                                        <p className={`whitespace-nowrap ${infoColor} ${infoSize}`}>사용자가 단 댓글</p>
                                        <span className="h-[1px] w-full bg-[var(--color-gray-2)]" />
                                    </li>
                                    <li className="flex flex-col gap-2">
                                        <InfoHeaderRowGroup
                                            post={post}
                                            user={authUser}                              
                                            currentUserId={authUser?.id}                 
                                            author={post?.expand?.editor ?? null}        
                                            showSvgIcon={false}
                                            showStatusBadge={false}
                                            showEditAndDelete={isOwner ? true : false}
                                        />
                                        <p className={`whitespace-nowrap ${infoColor} ${infoSize}`}>사용자가 단 댓글</p>
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
                                            user={authUser}                              
                                            currentUserId={authUser?.id}                 
                                            author={post?.expand?.editor ?? null}        
                                            className="hidden desktop:flex"
                                            showStatusBadge={false}
                                            showSvgIcon={true}
                                        />
                                        <CustomButton
                                            text="예약하기"
                                            size="lg"
                                            custombuttonClass="w-full"
                                            infoLike
                                            infoLikeProps={{
                                                postId: post?.id,
                                                post,
                                                initialCount: Number(post?.likesCount) || 0,
                                                count: false,
                                                infoLikeSize: "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm",
                                                className: "desktop:hidden rounded-full hover:bg-[var(--color-gray-2)] transition w-[2.5rem] h-[2.5rem] shrink-0 flex items-center justify-center",
                                            }}
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
                                            user={authUser}                              
                                            currentUserId={authUser?.id}                 
                                            author={post?.expand?.editor ?? null}        
                                            className="hidden desktop:flex"
                                            showStatusBadge={false}
                                            showEditAndDelete={isOwner}
                                            showSvgIcon={false}
                                            onDeletePost={handleDeleteHere}
                                            onEditPost={handleEditHere}
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
