import React from "react";
import SvgIcon from "../SvgIcon/SvgIcon";

export default function InfoLike({ 
    count = 0, 
    className = "", 
    infoLikeColor, 
    infoLikeSize 
}) {
    return (
        <div className={["flex items-center", className].join(" ")}>
            <SvgIcon name="heart-1" frameSize="xs" frameClass="pointer-events-none" iconClass={`w-[16px] h-[16px] ${infoLikeColor}`} />
            <span className={`${infoLikeColor} ${infoLikeSize}`} >{count}</span>
        </div>
    );
}
