import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../../lib/NavItems";
import SvgIcon from "../SvgIcon/SvgIcon";

export default function PageTitleBar({ className = "" }) {
    const navigate = useNavigate();
    const location = useLocation();

    const matchedItem = NAV_ITEMS.find(item => item.to === location.pathname);
    const currentLabel = matchedItem?.label || "";

    return (
        <div className={`
                hidden
                desktop:flex
                w-full mx-auto
                items-center justify-center flex-col
                mt-8 mb-7
                desktop:max-w-[1060px]
                ${className}
            `}
        >
            {/* ← 취소하고 돌아가기 */}
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full mx-auto flex items-center gap-1 text-[var(--color-gray-6)] text-sm transition"
            >
                <SvgIcon 
                    name="arrow-left" 
                    iconClass="text-[var(--color-gray-6)]"
                    frameSize="sm" 
                    iconSize="xs" 
                />
                <span className="translate-y-[1px]">뒤로가기</span>
            </button>

            {/* 중앙 타이틀 */}
            <p className="
                desktop:text-pc-title-lg
                font-bold text-[var(--color-gray-8)]
            ">
                {currentLabel}
            </p>
        </div>
    );
}
