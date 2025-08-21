import React from "react";
import SvgIcon from "../SvgIcon/SvgIcon";

export default function InfoPeople({ 
    post, 
    className = "", 
    iconShow = true,
    infoColor, 
    infoSize,
}) {
    const reserved =
        post?.reservedCount ??
        (Array.isArray(post?.reservations) ? post.reservations.length : post?.reservations ?? 0) ??
        0;
    const cap = post?.capacity ?? 0;

    return (
        <div className={["w-full flex items-center", className].join(" ")}>
            {iconShow ? (
                <SvgIcon name="user" frameSize="xs" frameClass="pointer-events-none" iconClass={`w-[16px] h-[16px] ${infoColor}`}/>)
             : null }
            
            <span className={`${infoSize} ${infoColor} truncate`}>
                {reserved}<span className={`${infoColor} ${infoSize} px-[2px]`}>/</span>{cap}
            </span>
        </div>
    );
}
