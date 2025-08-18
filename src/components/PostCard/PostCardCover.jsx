import React from "react";
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
    className = "",
    swiper,
    onIconClick,
    showInfoHeader, // InfoHeader 영역
    showStatusBadge, // StatusBadgeIconGroup 영역
    showSvgIcon, // StatusBadgeIconGroup 영역
}) {

    // 작성자 id 추출: string | object | array | expand.* 모두 대응
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
    // user와 editor 비교하여 icon 결정
    const iconNameOf = (p, uid) =>
        String(uid ?? "") === String(editorIdOf(p) ?? "") ? "kebabMenu" : "heart-1";

    const infoSize = "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm"
    const infoColor = "text-white text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm"
    
    const titleoColor = "text-white"

    const infoCommentSize = "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm"
    const infoCommentColor = "text-white text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm"

    const infoLikeSize = "text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm"
    const infoLikeColor = "text-white text-mo-text-sm tablet:text-tab-text desktop:text-pc-text-sm"

    return (
        <li className={["relative rounded-2xl overflow-hidden bg-[var(--color-gray-1)]", className].join(" ")}>
            {/* 커버 이미지 */}
            <InfoImage
                record={post}
                swiper={swiper}
                className="w-full h-[240px]"
                imgClassName="absolute inset-0 w-full h-full object-cover"
                rounded="rounded-none"
            />

            {/* 상단 우측 배지 */}
            <div className="absolute top-0 flex justify-between w-full p-2 z-10">
                <InfoHeaderRowGroup 
                    post={post} 
                    user={user} 
                    onIconClick={onIconClick} 
                    iconName={iconNameOf(post, user?.id)}
                    showInfoHeader={showInfoHeader}
                    showStatusBadge={showStatusBadge}
                    showSvgIcon={showSvgIcon}
                />
            </div>

            {/* 하단 오버레이 본문 */}
            <div className="absolute inset-0 bg-black/40" />

            <div className="absolute inset-x-0 bottom-0 p-2 text-white ">
                <CategoryBadgeList
                    categories={post?.category ?? []}
                    className="flex-wrap mb-1"
                />

                <InfoTitle 
                    title={post?.title} 
                    className={`mb-2`} 
                    titleoColor={titleoColor}
                />

                {/* 구분선 */}
                <div className="h-[1px] w-full bg-white mb-2" />

                <div className="">
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

                    <div className="flex items-center flex-wrap justify-between">
                        <div className="flex items-center">
                            <InfoDate 
                                post={post} 
                                infoColor={infoColor} 
                                infoSize={infoSize} 
                            />
                            <span className={`${infoColor} ${infoSize} px-[2px]`}>/</span>
                            <InfoTime 
                                post={post} 
                                infoColor={infoColor} 
                                infoSize={infoSize} 
                            />
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
