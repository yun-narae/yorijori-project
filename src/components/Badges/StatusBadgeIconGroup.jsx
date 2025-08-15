import React, { useState, useMemo, useCallback } from "react";
import pb from "../../lib/pocketbase";
import SvgIcon from "../SvgIcon/SvgIcon";
import StatusBadgeList from "./StatusBadgeList";

export default function StatusBadgeIconGroup({
    post,
    postId,
    collection = "post",
    className = "",
}) {
    const [loadedItems, setLoadedItems] = useState(post ? [post] : []);

    // StatusBadgeList에서 로드된 데이터를 받는 콜백 (안정화)
    const handleLoaded = useCallback((items) => {
        setLoadedItems(items || []);
    }, []);

    // 최종 post (아이콘 결정에 사용)
    const item = useMemo(() => {
        if (post) return post;
        return loadedItems?.[0];
    }, [post, loadedItems]);

    // 로그인 유저와 editor 일치 여부
    const me = pb?.authStore?.model;
    const myId = me?.id;
    const editorId = item
        ? (typeof item?.editor === "string"
            ? item.editor
            : item?.editor?.id ?? item?.expand?.editor?.id)
        : null;

    const isOwner = !!myId && !!editorId && String(myId) === String(editorId);
    const iconName = isOwner ? "kebabMenu" : "heart-1";

    return (
        <div className={["w-full flex items-center justify-between", className].join(" ")}>
            <StatusBadgeList
                posts={post ? [post] : undefined}
                postId={post ? undefined : postId}
                collection={collection}
                onLoaded={handleLoaded}
            />

            <SvgIcon name={iconName} fill hoverEffect />
        </div>
    );
}
