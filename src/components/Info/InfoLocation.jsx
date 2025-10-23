import React from "react";
import SvgIcon from "../SvgIcon/SvgIcon";

export default function InfoLocation({ 
    post, 
    className = "", 
    iconShow = true,
    infoColor, 
    infoSize 
}) {
    return (
        <div className={["w-full flex items-center", className].join(" ")}>
            {iconShow ? (
                <SvgIcon tabIndex={-1} name="mapPin" frameSize="xs" frameClass="pointer-events-none" iconClass={`w-[16px] h-[16px] ${infoColor}`} />) 
            : null} 
            
            <span className={`${infoColor} ${infoSize} truncate whitespace-normal line-clamp-1`}>{post?.location ?? "모임할 장소"}</span>
        </div>
    );
}
