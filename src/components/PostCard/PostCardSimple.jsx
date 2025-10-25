// src/components/PostCard/PostCardSimple.jsx
import React from "react";
import { Link } from "react-router-dom";
import CategoryBadgeList from "../Badges/CategoryBadgeList";
import InfoHeaderRowGroup from "../Info/InfoHeaderRowGroup";
import InfoImage from "../Info/InfoImage";
import InfoPeople from "../Info/InfoPeople";
import InfoLocation from "../Info/InfoLocation";
import InfoTitle from "../Info/InfoTitle";
import InfoDate from "../Info/InfoDate";
import InfoTime from "../Info/InfoTime";

export default function PostCardSimple({
    post,
    user,
    author,
    className = "",
    onIconClick,
    showInfoHeader,
    showStatusBadge,
    onDeletePost,
    onEditPost,
    onRequireLogin,
}) {
    const editorIdOf = (p) => {
        if (!p) return null;
        const ed = p.editor;
        if (typeof ed === "string") return ed;
        if (ed && typeof ed === "object" && ed.id) return ed.id;
        if (Array.isArray(ed)) {
        const found = ed.find((e) => typeof e === "string" || (e && typeof e === "object" && e.id));
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

    const infoSize = "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm";
    const infoColor = "text-[var(--color-gray-5)]";
    const titleoColor = "text-[var(--color-gray-8)]";

    return (
        <article
            className={[
                "group relative rounded-2xl border border-[var(--color-gray-2)] bg-[var(--color-primary)] p-2 cursor-pointer transition hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]",
                className,
            ].join(" ")}
            aria-labelledby={`post-${post?.id}-title`}
        >
            <InfoHeaderRowGroup
                post={post}
                user={user}
                currentUserId={user?.id}
                author={author ?? post?.expand?.editor ?? null}
                onIconClick={onIconClick}
                className="mb-2"
                iconName={iconNameOf(post, user?.id)}
                showInfoHeader={showInfoHeader}
                showStatusBadge={showStatusBadge}
                showSvgIcon={false}
                onDeletePost={onDeletePost}
                onEditPost={onEditPost}
                onRequireLogin={onRequireLogin}
            />

            <div className="absolute left-0 right-0 h-[1px] w-full bg-[var(--color-gray-2)]" />

            <div className="flex flex-col gap-2 mt-4">
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
                    <div className="flex items-center gap-2">
                        {/* 좌 이미지 */}
                        <InfoImage 
                            record={post} 
                            swiper={false} 
                            className="w-[128px] aspect-[1/1] overflow-hidden rounded-lg"
                            imgClassName="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />

                        {/* 우 정보 */}
                        <div className="w-0 flex-1 min-w-0 overflow-hidden flex flex-col gap-1">
                            <div className="flex flex-col gap-1">
                                <CategoryBadgeList categories={post?.category ?? []} className="flex-wrap" />
                                <InfoTitle
                                title={post?.title}
                                titleoColor={titleoColor}
                                className="!line-clamp-1 !break-normal"
                                id={`post-${post?.id}-title`}
                                />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <InfoPeople
                                    post={post}
                                    showReserved={false}  // 정원만
                                    unit="명"
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
                        </div>
                    </div>
                </Link>
            </div>
        </article>
    );
}
