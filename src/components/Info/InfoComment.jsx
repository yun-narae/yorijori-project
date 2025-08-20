import React from "react";

export default function InfoComment({
    count = 0,
    className = "",
    infoCommentColor,
    infoCommentSize,
    variant = "v1", // "v1" | "v2"
}) {
    const baseClass = ["flex items-center gap-[3px]", className].join(" ");
    const textClass = `${infoCommentColor} ${infoCommentSize}`;

    if (variant === "v2") {
        // 예: "12개의 댓글"
        return (
            <div className={baseClass}>
                <span className={textClass}>{count}</span>
                <span className={textClass}>개의</span>
                <span className={`${textClass} whitespace-nowrap`}>댓글</span>
            </div>
        );
    }

    // v1 (기본): "댓글 12"
    return (
        <div className={baseClass}>
            <span className={`${textClass} whitespace-nowrap`}>댓글</span>
            <span className={textClass}>{count}</span>
        </div>
    );
}

// 편의용 별칭
export function InfoCommentV1(props) {
    return <InfoComment {...props} variant="v1" />;
}
export function InfoCommentV2(props) {
    return <InfoComment {...props} variant="v2" />;
}
