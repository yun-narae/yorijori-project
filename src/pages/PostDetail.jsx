import React from "react";
import { useParams } from "react-router-dom";
import pb from "../lib/pocketbase";
import CategoryBadgeList from "../components/Badges/CategoryBadgeList";
import InfoTitle from "../components/Info/InfoTitle";
import InfoImage from "../components/Info/InfoImage";
import InfoPeople from "../components/Info/InfoPeople";
import InfoLocation from "../components/Info/InfoLocation";
import InfoDate from "../components/Info/InfoDate";
import InfoTime from "../components/Info/InfoTime";
import InfoFee from "../components/Info/InfoFee";
import InfoDescription from "../components/Info/InfoDescription";

export default function PostDetail() {
    const { postId } = useParams();
    const [post, setPost] = React.useState(null);
    const [err, setErr] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
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
            } finally {
                setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, [postId]);

    return (
        <>
            <div className="
              flex flex-col gap-3
              max-w-[500px] mx-auto mt-8 mb-8
              px-4
              tablet:px-0
              desktop:px-0
            ">
                {loading ? (
                    <div className="text-[var(--color-gray-6)]">불러오는 중…</div>
                ) : err ? (
                    <div className="text-[var(--color-red-1)]">오류: {err}</div>
                ) : !post ? (
                    <div className="text-[var(--color-gray-6)]">게시글을 찾을 수 없습니다.</div>
                ) : (
                    <article className="flex flex-col gap-4">
                        {/* 카테고리 + 타이틀 */}
                        <div className="flex flex-col gap-2">
                            <CategoryBadgeList
                                categories={post?.category ?? []}
                                className="flex-wrap"
                            />
                            <InfoTitle title={post?.title} />
                        </div>

                        {/* 대표 이미지(슬라이더 off) */}
                        <InfoImage record={post} swiper={false} className="w-full aspect-[4/3] rounded-xl overflow-hidden" />

                        {/* 주요 정보 */}
                        <div className="flex flex-col gap-2 text-[var(--color-gray-7)]">
                            <InfoPeople post={post} infoColor="text-[var(--color-gray-7)]" infoSize="text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm" />
                            <InfoLocation post={post} infoColor="text-[var(--color-gray-7)]" infoSize="text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm" />
                            <div className="flex flex-wrap items-center gap-2">
                                <InfoDate post={post} infoColor="text-[var(--color-gray-7)]" infoSize="text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm" className="!w-auto" />
                                <span className="text-[var(--color-gray-5)]">/</span>
                                <InfoTime post={post} infoColor="text-[var(--color-gray-7)]" infoSize="text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm" className="!w-auto" />
                            </div>
                            <InfoFee post={post} infoColor="text-[var(--color-gray-8)]" infoSize="text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm" />
                        </div>

                        {/* 설명 */}
                        <InfoDescription
                            post={post}
                            infoColor="text-[var(--color-gray-8)]"
                            infoSize="text-mo-title-sm tablet:text-tab-title-sm desktop:text-pc-title-sm"
                            clamp={0}
                        />
                    </article>
                )}
            </div>
        </>
    );
}
