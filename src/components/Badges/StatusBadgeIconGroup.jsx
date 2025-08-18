import React, { useState, useCallback } from "react";
import SvgIcon from "../SvgIcon/SvgIcon";
import StatusBadgeList from "./StatusBadgeList";

export default function StatusBadgeIconGroup({
    post,
    postId,
    collection = "post",
    className = "",
    showStatusBadge = true,
    showSvgIcon = true,
    onIconClick,
    iconClass,
    iconFrameClass,
    iconName
}) {
    const [loadedItems, setLoadedItems] = useState(post ? [post] : []);

    // StatusBadgeList에서 로드된 데이터를 받는 콜백 (안정화)
    const handleLoaded = useCallback((items) => {
        setLoadedItems(items || []);
    }, []);

    return (
        <div className={["flex items-center justify-between gap-1", className].join(" ")}>
            {showStatusBadge && (
                <StatusBadgeList
                    posts={post ? [post] : undefined}
                    postId={post ? undefined : postId}
                    collection={collection}
                    onLoaded={handleLoaded}
                />
            )}
            
            {showSvgIcon && (
                <SvgIcon 
                    name={iconName} 
                    iconClass={iconClass} 
                    onClick={onIconClick} 
                    fill 
                    hoverEffect 
                    frameClass={iconFrameClass} 
                />
            )}

        </div>
    );
}
