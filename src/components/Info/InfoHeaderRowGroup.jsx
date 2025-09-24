import React, { useMemo, useState } from "react";
import InfoHeader from "./InfoHeader";
import StatusBadgeIconGroup from "../Badges/StatusBadgeIconGroup";
import { iconNameOf } from "../../lib/postOwner";

/**
 * 좌측: InfoHeader(아바타/이름/업데이트시간)
 * 우측: StatusBadgeIconGroup(상태배지 + 아이콘)
 *
 * ⚠️ 작성자 표시와 권한 판단을 분리:
 * - author: 작성자 객체(보통 post.expand.editor)
 * - currentUserId: 현재 로그인한 유저 id (권한/아이콘 판단용)
 *
 * 💡 아바타 파일 URL은 프로젝트 util을 넘겨서(fileUrl) 계산하도록 했습니다.
 */
export default function InfoHeaderRowGroup({
    // InfoHeader 영역
    author,                 // 작성자 레코드 객체 (expand.editor)
    createdAt,
    currentUserId,
    infoClassName = "",
    showInfoHeader = true,

    // post / postId
    post,
    postId,
    collection = "post",
    onDeletePost,
    onEditPost,

    // StatusBadgeIconGroup 영역
    iconName,               // 주어지면 그대로 사용, 없으면 postOwner 기반 계산
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

    // (선택) 파일 URL 계산 유틸: (record, fieldName) => string
    fileUrl,

    onRequireLogin,      // 로그아웃 시 호출할 가드

    /** ✅ 추가: 좋아요 초깃값(숫자) */
    initialLikeCount = 0,
}) {
    const [loadedItems, setLoadedItems] = useState([]);

    // StatusBadgeIconGroup가 내부 fetch를 할 때를 대비한 post 보강
    const sourcePost = useMemo(
        () => post ?? loadedItems?.[0] ?? null,
        [post, loadedItems]
    );

    // post에서 editor / created 파생(확장 없을 때 대비)
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

    // 최종 표시용 작성자/시간
    const finalAuthor = author ?? derived.dUser;
    const finalCreatedAt = createdAt ?? derived.dCreatedAt;

    // 아바타 URL 계산(있으면 fileUrl 사용)
    const avatarUrl = useMemo(() => {
        if (!finalAuthor) return null;

        // 1) 외부에서 fileUrl 제공 시: avatar 필드가 존재하면 사용
        if (typeof fileUrl === "function" && "avatar" in finalAuthor && finalAuthor.avatar) {
        try {
            return fileUrl(finalAuthor, "avatar");
        } catch {
            // noop
        }
        }
        // 2) 혹시 레코드에 avatarUrl 형태로 이미 들어있다면 사용
        return finalAuthor?.avatarUrl ?? finalAuthor?.avatar_url ?? null;
    }, [finalAuthor, fileUrl]);

    // 작성자 이름
    const displayName =
        finalAuthor?.nickname ||
        finalAuthor?.name ||
        finalAuthor?.username ||
        "알 수 없음";

    // 아이콘 이름 결정: 명시 prop 우선 → 없으면 postOwner 기반
    const resolvedIconName = useMemo(() => {
        if (typeof iconName === "string") return iconName;
        return iconNameOf(sourcePost, currentUserId);
    }, [iconName, sourcePost, currentUserId]);

    return (
        <div className={["w-full flex items-center justify-between gap-3", className].join(" ")}>
            {showInfoHeader && (
                <InfoHeader
                    user={finalAuthor}                 // 작성자 레코드 그대로 전달
                    currentUserId={currentUserId}
                    createdAt={finalCreatedAt}
                    className={infoClassName}
                    nameClass={nameClass}
                    timeClass={timeClass}
                    onRequireLogin={onRequireLogin}   // 로그아웃 시 호출할 가드
                />
            )}

            <StatusBadgeIconGroup
                post={post}
                postId={post ? undefined : postId}        // post 없을 때만 내부 fetch
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
