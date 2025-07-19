import React from "react"
import Input from "../components/Input/Input";
import CustomButton from "../components/CustomButton/CustomButton";
import { SvgIcon } from "../components/SvgIcon/SvgIcon";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";

const Login = () => {
    return (
        <>
            <PageTitleBar />

            <div className="
                flex flex-col 
                max-w-[500px] mx-auto mb-8
                px-4
                tablet:px-0
                desktop:px-0
            ">
                <div className="flex flex-col gap-2">
                    <b className="text-[32px] leading-10 text-[var(--color-gray-8)]">
                        같이<br/> 
                        요리조리해요 
                        <span className="inline-block translate-y-[-1px]">:)</span>
                    </b>
                    <p className="text-mo-title-lg text-[var(--color-gray-6)]">
                        요리로 사람을 잇는 모임 플랫폼
                    </p>
                </div>

                <div className="flex flex-col gap-4 mt-6 mb-6">
                    <Input
                        label= "이메일"
                        type="email"
                        placeholder="이메일을 입력해주세요."
                    />
                    <Input
                        label= "비밀번호"
                        type="password"
                        placeholder="비밀번호를 입력해주세요."
                    />
                </div>

                <CustomButton 
                    text= "로그인하기"
                    size= "lg"
                />

                <div className="
                    flex
                    items-center
                    mx-auto
                    w-min
                    mt-2
                ">
                    <CustomButton 
                        text= "아이디 찾기"
                        variant= "tertiary"
                        basebuttonClass= "hover:bg-transparent"
                        basebuttontextClass= "text-[var(--color-gray-6)] hover:text-[var(--color-gray-6)] transition"
                    />
                    <span className="w-px h-[10px] bg-[var(--color-gray-3)]"></span>
                    <CustomButton 
                        text= "비밀번호 찾기"
                        variant= "tertiary"
                        basebuttonClass= "hover:bg-transparent"
                        basebuttontextClass= "text-[var(--color-gray-6)] hover:text-[var(--color-gray-6)] transition"
                    />
                    <span className="w-px h-[10px] bg-[var(--color-gray-3)]"></span>
                    <CustomButton 
                        text= "회원가입하기"
                        variant= "tertiary"
                        basebuttonClass= "hover:bg-transparent"
                        basebuttontextClass= "text-[var(--color-gray-6)] hover:text-[var(--color-gray-6)] transition"
                    />
                </div>
                
                <div className="
                    flex flex-col gap-4
                    items-center
                    mt-14
                ">
                    <div className="flex items-center gap-2 whitespace-nowrap w-full">
                        <span className="w-full h-[1px] bg-[var(--color-gray-3)]"></span>
                        <p className="text-[var(--color-gray-5)] text-mo-title">
                            SNS 계정으로 로그인
                        </p>
                        <span className="w-full h-[1px] bg-[var(--color-gray-3)]"></span>
                    </div>

                    <div className="flex gap-4">
                        <SvgIcon
                            name="sns-kakao"
                            frameSize="lg"
                            iconSize="sm"
                            state="default"
                            fill
                            frameClass="bg-[#F4DB06] pointer-events-none"
                        />
                        <SvgIcon
                            name="sns-naver"
                            frameSize="lg"
                            iconSize="sm"
                            state="default"
                            fill
                            frameClass="bg-[#18C103] pointer-events-none"
                        />
                        <SvgIcon
                            name="sns-google"
                            frameSize="lg"
                            iconSize="sm"
                            state="default"
                            fill
                            frameClass="border border-[var(--color-gray-2)] pointer-events-none"
                            iconClass="w-[20px]"
                        />
                        <SvgIcon
                            name="sns-apple"
                            frameSize="lg"
                            iconSize="sm"
                            state="default"
                            fill
                            frameClass="bg-black pointer-events-none"
                        />
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login;