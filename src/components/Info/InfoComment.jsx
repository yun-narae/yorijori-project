import React from "react";

export default function InfoComment({ 
    count = 0, 
    className = "", 
    infoCommentColor, 
    infoCommentSize 
}) {
    return (
        <div className={["flex items-center gap-[3px]", className].join(" ")}>
            <span className={`${infoCommentColor} ${infoCommentSize} whitespace-nowrap`}>댓글</span>
            <span className={`${infoCommentColor} ${infoCommentSize}`}>{count}</span>
        </div>
    );
}