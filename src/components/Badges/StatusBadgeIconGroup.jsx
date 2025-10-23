import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import SvgIcon from "../SvgIcon/SvgIcon";
import StatusBadgeList from "./StatusBadgeList";
import EditAndDelete from "../Actions/EditAndDelete";
import InfoLike from "../Info/InfoLike";
import { isOwnerOf } from "../../lib/postOwner";

export default function StatusBadgeIconGroup({
    post,
    postId,
    currentUserId,
    collection = "post",
    className = "",
    showStatusBadge = true,
    showSvgIcon = true,
    showEditAndDelete = false,
    onIconClick,
    iconClass,
    iconFrameClass,
    iconName, // 외부에서 강제 아이콘 지정 시 우선
    onDeletePost, // 게시물 삭제
    onEditPost, // 게시물 수정
    /** ✅ 추가: 좋아요 초깃값(숫자) */
    initialLikeCount = 0,
    likeReadOnly = false,
}) {
    const [fetched, setFetched] = useState(null);
    const record = post ?? fetched;

    // StatusBadgeList fetch 결과 수신
    const handleLoaded = useCallback((items) => {
        setFetched(Array.isArray(items) ? items[0] ?? null : items ?? null);
    }, []);

    // 최종 아이콘 결정: prop > 소유자 여부
    const finalIconName = useMemo(() => {
        if (typeof iconName === "string") return iconName;
        const me = currentUserId ?? null;
        return isOwnerOf(record, me) ? "kebabMenu" : "heart-1";
    }, [iconName, record, currentUserId]);

    // kebab 메뉴 제어
    const [menuOpen, setMenuOpen] = useState(false);
    const iconWrapRef = useRef(null);

    const handleIconPress = useCallback(
        (e) => {
            if (finalIconName === "kebabMenu") {
                e?.stopPropagation?.();
                setMenuOpen((v) => !v);
                return;
            }
            onIconClick?.(e);
        },
        [finalIconName, onIconClick]
    );

    // 게시물 삭제
    const handleDelete = React.useCallback(() => {
        onDeletePost?.();
    }, [onDeletePost]);

    // 게시물 삭제
    const handleEdit = React.useCallback(() => {
        onEditPost?.();
    }, [onEditPost]);

    // ⬇️ Esc 키로 메뉴 닫기
    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                setMenuOpen(false);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    // 바깥 클릭 시 메뉴 닫기
    useEffect(() => {
        if (!menuOpen) return;
        const onDocClick = (ev) => {
            if (!iconWrapRef.current) return setMenuOpen(false);
            if (!iconWrapRef.current.contains(ev.target)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [menuOpen]);

    return (
        <div className={["relative flex items-center justify-between gap-1", className].join(" ")}>
            {showStatusBadge && (
                <StatusBadgeList
                    posts={post ? [post] : undefined}
                    postId={post ? undefined : postId}
                    collection={collection}
                    onLoaded={handleLoaded}
                />
            )}

            {showSvgIcon && (
                <div ref={iconWrapRef} className="relative">
                    {finalIconName === "kebabMenu" ? (
                        <SvgIcon
                            type="button"
                            aria-label="수정 및 삭제 메뉴 열기"
                            aria-haspopup="menu"
                            aria-expanded={menuOpen ? "true" : "false"}
                            onClick={handleIconPress}
                            name={finalIconName}
                            iconClass={iconClass}
                            frameClass={iconFrameClass}
                            fill
                            hoverEffect
                        />
                    ) : (
                        <>
                            {/* 플레이스홀더/스켈레톤이면 하트 자체 제거 */}
                            {post?.id && (
                                <InfoLike
                                    readOnly={likeReadOnly}                       // 읽기전용 적용
                                    postId={likeReadOnly ? undefined : post?.id}  // 읽기전용이면 서버콜 필요 X
                                    post={post}
                                    initialCount={Number(initialLikeCount) || 0}
                                    count={false}
                                    iconClass={iconClass}
                                />
                            )}
                        </>
                    )}

                    {menuOpen && finalIconName === "kebabMenu" && (
                        <div className="absolute right-0 top-[calc(100%+4px)]">
                            <EditAndDelete
                                variant="menu"
                                onClose={() => setMenuOpen(false)}
                                onDeletePost={handleDelete}
                                onEditPost={handleEdit}
                            />
                        </div>
                    )}
                </div>
            )}

            {showEditAndDelete && 
                <EditAndDelete 
                    variant="inline" 
                    onDeletePost={handleDelete} 
                    onEditPost={handleEdit}
                />
            }
        </div>
    );
}
