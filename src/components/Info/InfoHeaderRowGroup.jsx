// src/components/Info/InfoHeaderRowGroup.jsx
import React, { useMemo, useState } from "react";
import InfoHeader from "./InfoHeader";
import StatusBadgeIconGroup from "../Badges/StatusBadgeIconGroup";
import { iconNameOf } from "../../lib/postOwner";

export default function InfoHeaderRowGroup({
    // InfoHeader 영역
    author,
    createdAt,
    updatedAt,
    currentUserId,
    infoClassName = "",
    showInfoHeader = true,

    // post / postId
    post,
    postId,
    collection = "post",
    onDeletePost,
    onEditPost,

    // StatusBadgeIconGroup
    iconName,
    onIconClick,
    showSvgIcon,
    showEditAndDelete,
    showStatusBadge,
    iconClass = "",
    iconFrameClass = "",

    // 표시 커스터마이즈
    className = "",
    nameClass,
    timeClass,

    fileUrl,
    onRequireLogin,

    initialLikeCount = 0,
}) {
    const [loadedItems, setLoadedItems] = useState([]);

    const sourcePost = useMemo(
        () => post ?? loadedItems?.[0] ?? null,
        [post, loadedItems]
    );

    const derived = useMemo(() => {
        if (!sourcePost) {
            return { dUser: null, dUserId: null, dCreatedAt: null, dUpdatedAt: null };
        }

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

        const dCreatedAt = sourcePost?.created || null;
        const dUpdatedAt = sourcePost?.updated || null;
        return { dUser, dUserId, dCreatedAt, dUpdatedAt };
    }, [sourcePost]);

    const finalAuthor = author ?? derived.dUser;

    // ✅ 명시 프롭 우선, 없으면 post에서 파생
    const finalCreatedAt = createdAt ?? derived.dCreatedAt;
    const finalUpdatedAt = updatedAt ?? derived.dUpdatedAt;

    const avatarUrl = useMemo(() => {
        if (!finalAuthor) return null;
        if (typeof fileUrl === "function" && "avatar" in finalAuthor && finalAuthor.avatar) {
            try { return fileUrl(finalAuthor, "avatar"); } catch { /* noop */ }
        }
        return finalAuthor?.avatarUrl ?? finalAuthor?.avatar_url ?? null;
    }, [finalAuthor, fileUrl]);

    const resolvedIconName = useMemo(() => {
        if (typeof iconName === "string") return iconName;
        return iconNameOf(sourcePost, currentUserId);
    }, [iconName, sourcePost, currentUserId]);

    return (
        <div className={["w-full flex items-center justify-between gap-3", className].join(" ")}>
            {showInfoHeader && (
                <InfoHeader
                    user={finalAuthor}
                    currentUserId={currentUserId}
                    createdAt={finalCreatedAt}
                    updatedAt={finalUpdatedAt}
                    className={infoClassName}
                    nameClass={nameClass}
                    timeClass={timeClass}
                    onRequireLogin={onRequireLogin}
                />
            )}

            <StatusBadgeIconGroup
                post={post}
                postId={post ? undefined : postId}
                collection={collection}
                onLoaded={(items) => setLoadedItems(items)}
                onIconClick={onIconClick}
                iconName={resolvedIconName}
                iconClass={iconClass}
                iconFrameClass={iconFrameClass}
                className={["shrink-0", !showInfoHeader ? "!ml-auto" : ""].join(" ")}
                showStatusBadge={showStatusBadge}
                showSvgIcon={showSvgIcon}
                showEditAndDelete={showEditAndDelete}
                onDeletePost={onDeletePost}
                onEditPost={onEditPost}
                initialLikeCount={initialLikeCount}
            />
        </div>
    );
}
