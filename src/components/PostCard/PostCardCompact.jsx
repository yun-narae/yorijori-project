import React from "react";
import { Link } from "react-router-dom";
import CategoryBadgeList from "../Badges/CategoryBadgeList";
import CustomButton from "../CustomButton/CustomButton";
import InfoHeaderRowGroup from "../Info/InfoHeaderRowGroup";
import InfoImage from "../Info/InfoImage";
import InfoPeople from "../Info/InfoPeople";
import InfoLocation from "../Info/InfoLocation";
import InfoLike from "../Info/InfoLike";
import InfoComment from "../Info/InfoComment";
import InfoTitle from "../Info/InfoTitle";
import InfoDate from "../Info/InfoDate";
import InfoTime from "../Info/InfoTime";

/**
 * 좌: 정사각형 썸네일 / 우: 정보 스택 (컴팩트)
 */
export default function PostCardCompact({
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
    onRequireLogin,        // ✅ 비로그인 가드
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
    const isOwnerOf = (p, uid) =>
        String(uid ?? "") === String(editorIdOf(p) ?? "");
    const iconNameOf = (p, uid) =>
        String(uid ?? "") === String(editorIdOf(p) ?? "") ? "kebabMenu" : "heart-1";

    // author가 없으면 post.expand.editor로 보강
    const finalAuthor = author ?? post?.expand?.editor ?? null;

    const infoSize = "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm";
    const infoColor = "text-[var(--color-gray-5)]";
    const titleoColor = "text-[var(--color-gray-8)]";

    const infoCommentSize = "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm";
    const infoCommentColor = "text-[var(--color-gray-5)]";

    const infoLikeSize = "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm";
    const infoLikeColor = "text-[var(--color-gray-5)]";

    return (
        <li className={["relative rounded-2xl border border-[var(--color-gray-2)] bg-[var(--color-primary)] p-2", className].join(" ")}>

            {/* 헤더(프로필/케밥/하트) - 클릭 제외 영역 */}
            <InfoHeaderRowGroup
                post={post}
                user={user}
                currentUserId={user?.id}
                author={finalAuthor}
                onIconClick={onIconClick}
                className="mb-2"
                iconName={iconNameOf(post, user?.id)}
                showInfoHeader={showInfoHeader}
                showStatusBadge={showStatusBadge}
                showSvgIcon={showSvgIcon}
                onDeletePost={onDeletePost}
                onEditPost={onEditPost}
                onRequireLogin={onRequireLogin}   // ✅ 전달
            />

            {/* 구분선 */}
            <div className="absolute left-0 right-0 h-[1px] w-full bg-[var(--color-gray-2)]" />

            <div className="flex flex-col gap-2 mt-4">
                {/* 헤더 제외: 제목/이미지/정보만 상세로 이동 */}
                <Link
                    to={`/post/detail/${post.id}`}
                    aria-label={`${post?.title ?? "모임"} 상세 보기`}
                    className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gray-3)]"
                    onClick={(e) => {
                        if (typeof onRequireLogin === "function") {
                            e.preventDefault();
                            e.stopPropagation();
                            onRequireLogin();
                        }
                    }}
                >
                    {/* 카테고리 + 타이틀 */}
                    <div className="flex flex-col gap-1">
                        <CategoryBadgeList
                            categories={post?.category ?? []}
                            className="flex-wrap"
                        />
                        <InfoTitle
                            title={post?.title}
                            titleoColor={titleoColor}
                            className="!line-clamp-1 !break-normal"
                        />
                    </div>

                    {/* 본문: 좌 이미지 / 우 정보 */}
                    <div className="flex items-stretch gap-2 mt-2">
                        {/* 좌 이미지 */}
                        <InfoImage
                            record={post}
                            swiper={swiper}
                            className="w-[117px] aspect-square"
                        />

                        {/* 우 정보 */}
                        <div className="flex-1 flex flex-col justify-between min-h-0">
                            <div className="w-full flex flex-wrap">
                                <InfoPeople post={post} infoColor={infoColor} infoSize={infoSize} />
                                <InfoLocation post={post} infoColor={infoColor} infoSize={infoSize} />
                                <div className="w-full flex items-center">
                                    <InfoDate post={post} infoColor={infoColor} infoSize={infoSize} className="!w-auto" />
                                    <span className={`${infoColor} ${infoSize} px-[2px]`}>/</span>
                                    <InfoTime post={post} infoColor={infoColor} infoSize={infoSize} className="!w-auto" />
                                </div>
                            </div>

                            {/* 하단 좋아요/댓글 + 예약 (상세 이동과 분리) */}
                            <div
                                className="w-full flex items-center justify-between text-[var(--color-gray-7)] text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm"
                                onClick={(e) => {
                                    // 부모 Link 네비게이션 막기
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <div className="flex gap-2">
                                    <InfoLike count={post?.likeCount ?? 0} infoLikeColor={infoLikeColor} infoLikeSize={infoLikeSize} />
                                    <InfoComment count={post?.commentCount ?? 0} infoCommentColor={infoCommentColor} infoCommentSize={infoCommentSize} />
                                </div>

                                {/* 예약 버튼(내 글이 아닐 때만) */}
                                {!isOwnerOf(post, user?.id) ? (
                                    <CustomButton text="예약하기" size="sm" custombuttonClass="!w-[78px]" />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </li>
    );
}
