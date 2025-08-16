import React, { useEffect, useState } from "react";
import pb from "../lib/pocketbase";
import { useAuth } from "../contexts/AuthContext";
import InfoHeaderRow from "../components/Info/InfoHeaderRow";
import CategoryBadgeList from "../components/Badges/CategoryBadgeList";
import SvgIcon from "../components/SvgIcon/SvgIcon";
import getPbImageURL from "../lib/getPbImageURL";
import CustomButton from '../components/CustomButton/CustomButton';
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";

// 24h → am/pm h:mm
function toAmPm(t = "00:00") {
    const [hh, mm] = String(t).split(":").map(Number);
    const h12 = ((hh + 11) % 12) + 1;
    const ampm = hh < 12 ? "am" : "pm";
    return `${ampm} ${h12}:${String(mm ?? 0).padStart(2, "0")}`;
}

// 2025-07-26 → 2025.07.26
function ymdDot(dateLike) {
    if (!dateLike) return "";
    const d = new Date(dateLike);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const dd = `${d.getDate()}`.padStart(2, "0");
    return `${y}.${m}.${dd}`;
}

export default function MyPosts() {
    const { user } = useAuth();
    const userId = user?.id;
    const [userPosts, setUserPosts] = useState([]);

    const fontClasses = "text-[var(--color-gray-5)]";

    useEffect(() => {
        if (!userId) return;
    
        const AUTHOR_FIELD = "editor";
    
        const fetchUserPosts = async () => {
            try {
                const result = await pb.collection("post").getList(1, 50, {
                    filter: `${AUTHOR_FIELD}="${userId}"`,
                    expand: AUTHOR_FIELD,
                    fields: [
                        "id",
                        "title",
                        "category",
                        "images",
                        "capacity",
                        "collectionId",
                        "collectionName",
                        "location",
                        "date",
                        "timeStart",
                        "timeEnd",
                        "likeCount",
                        "commentCount",
                        "editor",
                        "updated",
                        "created",
                    ].join(","),
                });
                setUserPosts(result.items ?? []);
            } catch (err) {
                console.error("게시물 가져오기 실패:", err?.status, err?.message, err?.data);
            }
        };
    
        fetchUserPosts();
    }, [userId]);

    return (
        <>
            <PageTitleBar />
    
            <ul className="
                flex flex-col gap-3
                max-w-[500px] mx-auto mt-8 mb-8
                px-4
                tablet:px-0
                desktop:px-0
            ">
                {userPosts.map((post) => (
                    <li
                        key={post.id}
                        className="flex flex-col gap-3 rounded-lg border border-[var(--color-gray-2)] bg-white p-2 relative"
                        onClick={null}
                    >
                        {/* 상단 헤더(아바타/이름/상태/시간) */}
                        <InfoHeaderRow user={user} post={post} currentUserId={user?.id} />
    
                        <span className="absolute top-[58px] left-0 h-[1px] w-full bg-[var(--color-gray-2)]"></span>

                        <div className="flex flex-col gap-2">
                            {/* 상단 카테고리 및 타이틀 */}
                            <div className="flex flex-col gap-1">
                                <CategoryBadgeList
                                    categories={post?.category ?? []}
                                    className="flex-wrap"
                                    gap="gap-[6px]"
                                />
                                <h3 className="text-mo-title-md tablet:text-tab-title-md desktop:text-pc-title-md font-bold">
                                    {post?.title}
                                </h3>
                            </div>
                            {/* 본문: 좌 이미지 / 우 정보 */}
                            <div className="flex items-center gap-2">
                                {/* 좌: 대표 이미지 */}
                                <div className="
                                    w-[117px] aspect-[1/1] relative shrink-0 rounded-lg overflow-hidden bg-[var(--color-gray-2)]"
                                >
                                    {post?.images ? (
                                        <img
                                            src={getPbImageURL(post, "images")}
                                            alt={post?.title ?? "post image"}
                                            className="absolute inset-0 w-full h-full object-cover object-center"
                                            loading="lazy"
                                        />
                                    ) : null}
                                </div>
                                {/* 우: 정보 블록 */}
                                <div className="w-full min-w-1 flex flex-wrap gap-1">
                                    <div className="w-full flex flex-wrap gap-1">
                                        {/* 인원 */}
                                        <div className={
                                            `w-full flex items-center gap-1 text-[var(--color-gray-7)] text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm`}
                                        >
                                            <SvgIcon
                                                name="user"
                                                frameSize="xs"
                                                frameClass="pointer-events-none"
                                                iconClass={`w-[16px] h-[16px] ${fontClasses}`}
                                            />
                                            <span className={`text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm ${fontClasses}`}>
                                                {(post?.reservedCount ??
                                                    (Array.isArray(post?.reservations) ? post.reservations.length : post?.reservations ?? 0) ??
                                                    0)}
                                                /{post?.capacity ?? 0}
                                            </span>
                                        </div>
                                        {/* 장소 */}
                                        <div className={`w-full flex items-center gap-1 text-[var(--color-gray-7)] text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm`}>
                                            <SvgIcon
                                                name="mapPin"
                                                frameSize="xs"
                                                frameClass="pointer-events-none"
                                                iconClass={`w-[16px] h-[16px] ${fontClasses}`}
                                            />
                                            <span className={`truncate whitespace-normal line-clamp-1 ${fontClasses}`}>{post?.location ?? "모임할 장소"}</span>
                                        </div>
                                        {/* 날짜/시간 */}
                                        <div className={`w-full flex items-center gap-1 text-[var(--color-gray-7)] text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm`}>
                                            <SvgIcon
                                                name="calendar"
                                                frameSize="xs"
                                                frameClass="pointer-events-none"
                                                iconClass={`w-[16px] h-[16px] ${fontClasses}`}
                                            />
                                            <span className={`truncate whitespace-nowrap ${fontClasses}`}>
                                                {ymdDot(post?.date)}
                                                {post?.timeStart || post?.timeEnd
                                                    ? ` / ${toAmPm(post?.timeStart)} ~ ${toAmPm(post?.timeEnd)}`
                                                    : ""}
                                            </span>
                                        </div>
                                    </div>
                                    {/* 하단: 좋아요/댓글 */}
                                    <div className={`w-full flex items-center justify-between text-[var(--color-gray-7)] text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm`}>
                                        <div className="flex flex-wrap gap-1">
                                            <div className="flex items-center gap-[1px]">
                                                <SvgIcon
                                                    name="heart-1"
                                                    frameSize="xs"
                                                    frameClass="pointer-events-none"
                                                    iconClass={`w-[16px] h-[16px] ${fontClasses}`}
                                                />
                                                <span className={`${fontClasses}`}>{post?.likeCount ?? 0}</span>
                                            </div>
                                            <div className="flex items-center gap-[3px]">
                                                <span className={`whitespace-nowrap ${fontClasses}`}>댓글</span>
                                                <span className={`whitespace-nowrap ${fontClasses}`}>{post?.commentCount ?? 0}</span>
                                            </div>
                                        </div>
                                        { !user ? (
                                            <CustomButton
                                                text="예약하기"
                                                size="sm"
                                                custombuttonClass="w-[78px]"
                                            />
                                            ) : (null)
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}
