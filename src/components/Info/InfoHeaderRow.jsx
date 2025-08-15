import React, { useMemo, useState } from "react";
import InfoGroup from "./InfoGroup";
import StatusBadgeIconGroup from "../Badges/StatusBadgeIconGroup";

/**
 * - 좌측: InfoGroup (아바타/이름/시간)
 * - 우측: StatusBadgeIconGroup (상태 배지 + 아이콘)
 */
export default function InfoHeaderRow({
    // InfoGroup 명시 props(있으면 우선)
    user,
    userId,
    createdAt,
    currentUserId,
    infoClassName = "",

    // post / postId
    post,
    postId,
    collection = "post",

    // 우측 아이콘 영역
    onIconClick,
    iconButtonClassName = "",

    className = "",
}) {
    // StatusBadgeIconGroup가 postId로 내부 fetch했을 때 결과를 받기 위한 state
    const [loadedItems, setLoadedItems] = useState([]);

    // 최종 사용할 post (명시 post > 로드된 post > null)
    const sourcePost = useMemo(() => {
        if (post) return post;
        return loadedItems?.[0] ?? null;
    }, [post, loadedItems]);

    // post에서 user / userId / createdAt 파생
    const derived = useMemo(() => {
        if (!sourcePost) return { dUser: null, dUserId: null, dCreatedAt: null };

        const pick = (ed) => {
            if (!ed) return { dUser: null, dUserId: null };
            if (typeof ed === "string") return { dUser: null, dUserId: ed };
            if (typeof ed === "object" && ed.id) return { dUser: ed, dUserId: ed.id };
            return { dUser: null, dUserId: null };
        };

        let { dUser, dUserId } = pick(sourcePost.editor);

        const ex = sourcePost?.expand?.editor;
        if (ex) {
            const u = Array.isArray(ex) ? ex[0] : ex;
            if (u) {
                dUser = u;
                dUserId = u.id ?? dUserId;
            }
        }

        const dCreatedAt = sourcePost?.updated || sourcePost?.created || null;

        return { dUser, dUserId, dCreatedAt };
    }, [sourcePost]);

    // 최종 값: 명시 props 우선
    const finalUser = user ?? derived.dUser;
    const finalUserId = userId ?? derived.dUserId;
    const finalCreatedAt = createdAt ?? derived.dCreatedAt;

    return (
        <div className={["w-full flex items-center justify-between gap-3", className].join(" ")}>
            <InfoGroup
                user={finalUser}
                userId={finalUserId}
                currentUserId={currentUserId}
                createdAt={finalCreatedAt}   // ✅ TimeBadge가 받을 값 (post.updated 우선)
                className={infoClassName}
            />

            <StatusBadgeIconGroup
                post={post}
                postId={post ? undefined : postId}  // post가 없을 때만 내부 fetch
                collection={collection}
                onLoaded={(items) => setLoadedItems(items)} // ✅ fetch 결과 수신
                onIconClick={onIconClick}
                iconButtonClassName={iconButtonClassName}
                className="shrink-0"
            />
        </div>
    );
}
