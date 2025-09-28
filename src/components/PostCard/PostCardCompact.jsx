// src/components/PostCard/PostCardCompact.jsx
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
import useParticipation from "../../hooks/useParticipation";
import { useConfirm } from "../Modal/ConfirmProvider";

export default function PostCardCompact({
    post,
    user,
    author,
    className = "",
    swiper,
    onIconClick,
    showInfoHeader,
    showStatusBadge,
    showSvgIcon,
    onDeletePost,
    onEditPost,
    onRequireLogin,
    /** 부모가 내려주는 좋아요 초깃값(숫자). 없으면 post.likesCount 또는 0 */
    initialLikeCount,
}) {
    const editorIdOf = (p) => {
        if (!p) return null;
        const ed = p.editor;
        if (typeof ed === "string") return ed;
        if (ed && typeof ed === "object" && ed.id) return ed.id;
        if (Array.isArray(ed)) {
            const f = ed.find((e) => typeof e === "string" || (e && e.id));
            return typeof f === "string" ? f : f?.id ?? null;
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

    const confirm = useConfirm();
    const {
        count, capacity, isClosed, isJoined,
        join, cancel, joining, canceling,
    } = useParticipation(post.id, user);

    const notify = async (opt) => {
        if (!confirm) return;
        await confirm({
            title: opt?.title || "알림",
            description: opt?.description || "",
            hideCancel: true,
            confirmText: "확인",
        });
    };

    const onClickParticipation = async () => {
        try {
            if (isJoined) {
                const ok = confirm
                    ? await confirm({ title: "참여 취소", description: "참여를 취소하시겠습니까?", confirmText: "확인", cancelText: "취소" })
                    : true;
                if (!ok) return;
                await cancel();
                await notify({ title: "취소 완료", description: "참여가 취소되었습니다." });
            } else {
                await join();
                await notify({ title: "참여 완료", description: "참여가 완료되었습니다." });
            }
        } catch (err) {
            const msg = String(err?.message || err);
            if (msg.includes("NEED_LOGIN")) {
                await notify({ title: "로그인이 필요합니다", description: "로그인 후 이용해주세요." });
            } else if (msg.includes("FULL_CAPACITY")) {
                await notify({ title: "모집마감", description: "모집이 마감되어 참여할 수 없습니다." });
            } else if (msg.includes("unique") || msg.includes("Duplicate")) {
                await notify({ title: "이미 참여 중", description: "이미 이 모임에 참여했습니다." });
            } else {
                await notify({ title: "오류", description: "요청 처리 중 문제가 발생했습니다." });
            }
        }
    };

    const isOwnerOf = (p, uid) => String(uid ?? "") === String(editorIdOf(p) ?? "");
    const iconNameOf = (p, uid) => (isOwnerOf(p, uid) ? "kebabMenu" : "heart-1");
    const finalAuthor = author ?? post?.expand?.editor ?? null;

    // 초깃값 숫자만 사용 (부모가 주면 그걸, 아니면 post.likesCount → 0)
    const likeSeed =
        typeof initialLikeCount === "number"
            ? initialLikeCount
            : Number(post?.likesCount ?? 0);

    const infoSize = "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm";
    const infoColor = "text-[var(--color-gray-5)]";
    const titleoColor = "text-[var(--color-gray-8)]";

    const infoCommentSize = "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm";
    const infoCommentColor = "text-[var(--color-gray-5)]";
    const infoLikeSize = "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm";
    const infoLikeColor = "text-[var(--color-gray-5)]";

    return (
        <div className={["relative rounded-2xl border border-[var(--color-gray-2)] bg-[var(--color-primary)] p-2", className].join(" ")}>
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
                onRequireLogin={onRequireLogin}
                /** 헤더 하트에도 같은 초깃값 숫자 전달 */
                initialLikeCount={likeSeed}
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
                    <div className="flex flex-col gap-2">
                        <CategoryBadgeList
                            categories={post?.category ?? []}
                            className="flex-wrap"
                        />
                        <InfoTitle
                            title={post?.title}
                            titleoColor={titleoColor}
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
                                <InfoPeople 
                                    post={{ ...post, reservedCount: count, capacity }}
                                    infoColor={infoColor} 
                                    infoSize={infoSize}
                                />
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
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                            >
                                <div className="flex gap-2">
                                <InfoLike
                                    /* ▼ 하단 아이콘은 항상 비어있는 하트로 고정 */
                                    readOnly={true}
                                    likedInitial={false}
                                    postId={post?.id}
                                    post={post}
                                    /** 리스트 하단 카운트도 같은 초깃값 숫자 사용 */
                                    initialCount={likeSeed}
                                    count={true}
                                    lazy={true}
                                    mode="passive"
                                    className="pointer-events-none"
                                    infoLikeColor={infoLikeColor}
                                    infoLikeSize={infoLikeSize}
                                />
                                    <InfoComment
                                        postId={post?.id}
                                        count={post?.commentCount ?? 0}
                                        infoCommentColor={infoCommentColor}
                                        infoCommentSize={infoCommentSize}
                                    />
                                </div>

                                {!isOwnerOf(post, user?.id) ? (
                                    <CustomButton 
                                        text={isJoined ? "취소하기" : (isClosed ? "모집마감" : "참여하기")}
                                        size="sm"
                                        custombuttonClass="!w-[78px]" 
                                        variant={isJoined ? "secondary" : "primary"}
                                        state={!isJoined && isClosed ? "disable" : undefined}
                                        disabled={(!isJoined && isClosed) || joining || canceling}
                                        onClick={onClickParticipation}
                                    />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
