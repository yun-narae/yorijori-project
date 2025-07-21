import { useLocation, useNavigate } from "react-router-dom";
import CustomButton from "../components/CustomButton/CustomButton";
import { SvgIcon } from "../components/SvgIcon/SvgIcon";

export default function RegisterSuccess() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const nickname = state?.nickname ?? "회원님";

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

            <p className="mt-2 text-[var(--color-redorange-1)] text-mo-title-lg">가입완료</p>

            <p className="text-[var(--color-gray-8)] text-[20px] font-bold mt-1">
                {nickname}님, 환영해요 <span className="inline-block translate-y-[-1px]">:)</span>
            </p>

            <CustomButton
                text="로그인하러 가기"
                size="lg"
                variant="primary"
                custombuttonClass="mt-8"
                onClick={() => navigate("/login")}
            />
        </div>
    );
}
