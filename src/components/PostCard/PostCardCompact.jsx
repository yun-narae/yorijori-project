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

    // 일정 종료 판단 (date + timeEnd | time_end 지원)
    const isEventEnded = (p) => {
        try {
            const d = p?.date;
            const t = p?.timeEnd ?? p?.time_end;
            if (!d) return false;
            const end = new Date(t ? `${d}T${t}` : d);
            return !Number.isNaN(end.getTime()) && end.getTime() < Date.now();
        } catch {
            return false;
        }
    };

    const confirm = useConfirm();

    const {
        count, capacity, isClosed, isJoined,
        join, cancel, joining, canceling,
    } = useParticipation(post.id, user);

    // ▶ 최종 마감 여부: 정원 마감 OR 일정 종료
    const closedByTime = isEventEnded(post);
    const isClosedFinal = isClosed || closedByTime;

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
                    ? await confirm({
                        title: "예약 취소",
                        description: "예약을 취소하시겠습니까?",
                        confirmText: "확인",
                        cancelText: "취소",
                    })
                    : true;
                if (!ok) return;

                await cancel();

                // 🔊 같은 탭의 목록(예약한 모임 등) 즉시 갱신
                try {
                    window.dispatchEvent(
                        new CustomEvent("participation:changed", {
                            detail: { postId: post.id, userId: user?.id, joined: false },
                        })
                    );
                } catch {}

                await notify({ title: "취소 완료", description: "예약이 취소되었습니다." });
            } else {
                await join();

                // 🔊 예약 완료도 방송(필요 시 목록에 추가용)
                try {
                    window.dispatchEvent(
                        new CustomEvent("participation:changed", {
                            detail: { postId: post.id, userId: user?.id, joined: true },
                        })
                    );
                } catch {}

                await notify({ title: "예약 완료", description: "예약이 완료되었습니다." });
            }
        } catch (err) {
            const msg = String(err?.message || err);
            if (msg.includes("NEED_LOGIN")) {
                await notify({ title: "로그인이 필요합니다", description: "로그인 후 이용해주세요." });
            } else if (msg.includes("FULL_CAPACITY")) {
                await notify({ title: "모집마감", description: "모집이 마감되어 예약할 수 없습니다." });
            } else if (msg.includes("unique") || msg.includes("Duplicate")) {
                await notify({ title: "이미 예약 중", description: "이미 이 모임에 예약했습니다." });
            } else {
                await notify({ title: "오류", description: "요청 처리 중 문제가 발생했습니다." });
            }
        }
    };

    const isOwnerOf = (p, uid) => String(uid ?? "") === String(editorIdOf(p) ?? "");
    const iconNameOf = (p, uid) => (isOwnerOf(p, uid) ? "kebabMenu" : "heart-1");
    const finalAuthor = author ?? post?.expand?.editor ?? null;

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
        <article className={[
            "group relative rounded-2xl border border-[var(--color-gray-2)] bg-[var(--color-primary)] p-2", 
            "cursor-pointer transition hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]",
            className,
        ].join(" ")}
        aria-labelledby={`post-${post?.id}-title`}>
            <InfoHeaderRowGroup
                post={{ ...post, reservedCount: count, capacity }}
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
                initialLikeCount={likeSeed}
            />

            <div className="absolute left-0 right-0 h-[1px] w-full bg-[var(--color-gray-2)]" />

            <div className="mt-4">
                {/* 헤더 제외: 제목/이미지/정보만 상세로 이동 */}
                <Link
                    to={`/post/detail/${post.id}`}
                    aria-label={`${post?.title ?? "모임"} 상세 보기`}
                    className="flex flex-col gap-1 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gray-3)]"
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
                            id={`post-${post?.id}-title`}
                        />
                    </div>

                    {/* 본문: 좌 이미지 / 우 정보 */}
                    <div className="flex items-stretch gap-2">
                        {/* 좌 이미지 */}
                        <InfoImage
                            record={post}
                            swiper={false}
                            className="w-[117px] aspect-square overflow-hidden rounded-lg"
                            imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
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
                                        text={isClosedFinal ? "모집마감" : (isJoined ? "취소하기" : "예약하기")}
                                        size="sm"
                                        custombuttonClass="!w-[78px]"
                                        variant={isClosedFinal ? "secondary" : (isJoined ? "secondary" : "primary")}
                                        state={isClosedFinal ? "disable" : undefined}
                                        disabled={isClosedFinal || joining || canceling}
                                        onClick={isClosedFinal ? undefined : onClickParticipation}
                                    />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </article>
    );
}
