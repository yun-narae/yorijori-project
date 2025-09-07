import React from "react";
import { Link } from "react-router-dom";
import CategoryBadgeList from "../Badges/CategoryBadgeList";
import InfoImage from "../Info/InfoImage";
import InfoPeople from "../Info/InfoPeople";
import InfoLike from "../Info/InfoLike";
import InfoComment from "../Info/InfoComment";
import InfoTitle from "../Info/InfoTitle";
import InfoHeaderRowGroup from "../Info/InfoHeaderRowGroup";
import InfoLocation from "../Info/InfoLocation";
import InfoDate from "../Info/InfoDate";
import InfoTime from "../Info/InfoTime";

/**
 * 큰 커버 이미지 위에 정보 오버레이되는 카드
 */
export default function PostCardCover({
    post,
    user,
    author,                // 표시용 작성자 (없으면 expand.editor로 폴백)
    className = "",
    swiper,
    onIconClick,
    showInfoHeader,
    showStatusBadge,
    showSvgIcon,
    onDeletePost,
    onEditPost,
}) {
    // 작성자 id 추출
    const editorIdOf = (p) => {
        if (!p) return null;

        const ed = p.editor;
        if (typeof ed === "string") return ed;
        if (ed && typeof ed === "object" && ed.id) return ed.id;
        if (Array.isArray(ed)) {
            const found = ed.find((e) =>
                typeof e === "string" || (e && typeof e === "object" && e.id)
            );
            return typeof found === "string" ? found : found?.id ?? null;
        }

        const ex = p?.expand?.editor;
        if (typeof ex === "string") return ex;
        if (ex && typeof ex === "object" && ex.id) return ex.id;
        if (Array.isArray(ex)) {
            const u = ex.find((e) => e && e.id);
            return u?.id ?? null;
        }

        return null;
    };
    const iconNameOf = (p, uid) =>
        String(uid ?? "") === String(editorIdOf(p) ?? "") ? "kebabMenu" : "heart-1";

    // author가 없으면 post.expand.editor로 보강
    const finalAuthor = author ?? post?.expand?.editor ?? null;

    const infoSize = "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm";
    const infoColor = "text-white text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm";
    const titleoColor = "text-white";
    const infoCommentSize = "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm";
    const infoCommentColor = "text-white text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm";
    const infoLikeSize = "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm";
    const infoLikeColor = "text-white text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm";

    return (
        <li className={["relative rounded-2xl overflow-hidden", className].join(" ")}>
            {/* 헤더 제외: 카드 전체를 덮는 오버레이 링크 (헤더보다 낮은 z-index) */}
            <Link
                to={`/post/detail/${post.id}`}
                aria-label={`${post?.title ?? "모임"} 상세 보기`}
                className="absolute inset-0 z-10"
            />

            {/* 커버 이미지 (클릭을 오버레이 링크로 통과시키기 위해 포인터 비활성) */}
            <InfoImage
                record={post}
                swiper={swiper}
                className="w-full h-[340px] pointer-events-none"
                imgClassName="absolute inset-0 w-full h-full object-cover"
                rounded="rounded-none"
            />

            {/* 상단 우측 배지(헤더) - 클릭 가능 영역 (오버레이 링크 위) */}
            <div className="absolute top-0 flex justify-between w-full p-2 z-20">
                <InfoHeaderRowGroup
                    post={post}
                    user={user}
                    author={finalAuthor}
                    onIconClick={onIconClick}
                    iconName={iconNameOf(post, user?.id)}
                    showInfoHeader={showInfoHeader}
                    showStatusBadge={showStatusBadge}
                    showSvgIcon={showSvgIcon}
                    onDeletePost={onDeletePost}
                    onEditPost={onEditPost}
                />
            </div>

            {/* 하단 오버레이 본문 배경 (시각만) */}
            <div className="absolute inset-0 bg-black/40" />

            {/* 본문(텍스트/메타) — 내용 자체는 클릭 불필요, 오버레이 링크가 잡아줌 */}
            <div className="absolute inset-x-0 bottom-0 p-2 text-white z-10 pointer-events-none">
                <CategoryBadgeList
                    categories={post?.category ?? []}
                    className="flex-wrap mb-1"
                />

                <InfoTitle
                    title={post?.title}
                    titleoColor={titleoColor}
                    className="!line-clamp-1 mb-2 !break-normal"
                />

                {/* 구분선 */}
                <div className="h-[1px] w-full bg-white mb-2" />

                <div>
                    <div className="flex flex-wrap gap-x-1 text-[var(--color-gray-5)]">
                        <InfoPeople
                            post={post}
                            infoColor={infoColor}
                            infoSize={infoSize}
                            className="!w-auto"
                        />
                        <InfoLocation
                            post={post}
                            infoColor={infoColor}
                            infoSize={infoSize}
                            className="!w-auto"
                        />
                    </div>

                    <div className="flex items-center flex-wrap justify-between mt-1">
                        <div className="flex items-center">
                            <InfoDate post={post} infoColor={infoColor} infoSize={infoSize} />
                            <span className={`${infoColor} ${infoSize} px-[2px]`}>/</span>
                            <InfoTime post={post} infoColor={infoColor} infoSize={infoSize} />
                        </div>
                        <div className="flex items-center gap-2">
                            <InfoLike
                                count={post?.likeCount ?? 0}
                                infoLikeColor={infoLikeColor}
                                infoLikeSize={infoLikeSize}
                            />
                            <InfoComment
                                count={post?.commentCount ?? 0}
                                infoCommentColor={infoCommentColor}
                                infoCommentSize={infoCommentSize}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
}
