import React, { useMemo, useState } from "react";
import InfoHeader from "./InfoHeader";
import StatusBadgeIconGroup from "../Badges/StatusBadgeIconGroup";
import { iconNameOf } from "../../lib/postOwner";

/**
 * - 좌측: InfoHeader (아바타/이름/시간)
 * - 우측: StatusBadgeIconGroup (상태 배지 + 아이콘)
 */
export default function InfoHeaderRowGroup({
    // InfoHeader 영역
    user,
    userId,
    createdAt,
    currentUserId,
    infoClassName = "",
    showInfoHeader = true,

    // post / postId
    post,
    postId,
    collection = "post",
    onDeletePost,

    // StatusBadgeIconGroup 영역
    iconName,
    onIconClick,
    showSvgIcon,
    showEditAndDelete,
    showStatusBadge,
    iconClass = "",
    iconFrameClass = "",

    className = "",
    nameClass,
    timeClass
}) {
    const [loadedItems, setLoadedItems] = useState([]);
    const sourcePost = useMemo(() => post ?? loadedItems?.[0] ?? null, [post, loadedItems]);
  
    const meId = currentUserId ?? user?.id ?? null;
  
    // ✅ prop(iconName)이 오면 그것을 ‘무조건’ 사용
    const resolvedIconName = useMemo(() => {
      if (typeof iconName === "string") return iconName;
      return iconNameOf(sourcePost, meId);
    }, [iconName, sourcePost, meId]);

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
            {showInfoHeader && (
                <InfoHeader
                    user={finalUser}
                    userId={finalUserId}
                    currentUserId={currentUserId}
                    createdAt={finalCreatedAt}  // TimeBadge가 받을 값 (post.updated 우선)
                    className={infoClassName}
                    nameClass={nameClass}
                    timeClass={timeClass}
                />
            )}
            
            <StatusBadgeIconGroup
                post={post}
                postId={post ? undefined : postId}  // post가 없을 때만 내부 fetch
                collection={collection}
                onLoaded={(items) => setLoadedItems(items)} // fetch 결과 수신
                onIconClick={onIconClick}
                iconName={resolvedIconName}
                iconClass={iconClass}
                iconFrameClass={iconFrameClass}
                className={[
                    "shrink-0",
                    !showInfoHeader ? "!ml-auto" : ""   // ← 헤더 없을 때 오른쪽 정렬
                ].join(" ")}
                showStatusBadge={showStatusBadge}
                showSvgIcon={showSvgIcon}
                showEditAndDelete={showEditAndDelete}
                onDeletePost={onDeletePost}
            />
        </div>
    );
}
