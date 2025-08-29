import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import pb from '../lib/pocketbase';
import CustomButton from "../components/CustomButton/CustomButton";
import { SvgIcon } from "../components/SvgIcon/SvgIcon";

export default function RegisterSuccess() {
    const navigate = useNavigate();
    const location = useLocation();
    const nickname = location.state?.nickname ?? "회원님";

    return (
        <div className="
                h-screen
                flex flex-col
                max-w-[500px] mx-auto
                items-center justify-center
                px-4
                tablet:px-0
                desktop:px-0
            ">
            <SvgIcon 
                name="check" 
                frameSize="lg" 
                iconSize="sm" 
                fill
                hoverEffect={false}
                frameClass="
                    flex items-center justify-center
                    bg-[var(--color-redorange-1)] rounded-full
                    pointer-events-none
                " 
                iconClass="text-[var(--white)] translate-x-[-3px] translate-y-[-2px]"
            />

            <div className="flex flex-col gap-4 items-center justify-center">
                <div className="flex flex-col gap-1 items-center justify-center">
                    <p className="mt-2 text-[var(--color-redorange-1)] text-mo-title-lg tablet:text-tab-title-lg desktop:text-pc-title-md">가입완료</p>
                    <p className="text-[var(--color-gray-8)] font-bold text-mo-title-lg tablet:text-tab-title-lg desktop:text-pc-title-md">
                        {nickname}님, 환영해요 <span className="inline-block translate-y-[-1px]">:)</span>
                    </p>
                </div>
                <CustomButton
                    text="로그인하러 가기"
                    size="lg"
                    variant="primary"
                    onClick={() =>
                        navigate(`/login`, { replace: true })
                    }
                />
            </div>
        </div>
    );
}
