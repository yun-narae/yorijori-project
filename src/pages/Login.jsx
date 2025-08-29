import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import Input from "../components/Input/Input";
import CustomButton from "../components/CustomButton/CustomButton";
import { SvgIcon } from "../components/SvgIcon/SvgIcon";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import { useConfirm } from "../components/Modal/ConfirmProvider";

const Login = () => {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const { login, isLoggedIn } = useAuth();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    // ✅ 이미 로그인 상태면 /login 접근 불가 (뒤로가기에도 남지 않도록 replace)
    useEffect(() => {
        if (isLoggedIn) {
            const uid = localStorage.getItem("userId");
            navigate(uid ? `/mypage/${uid}` : "/", { replace: true });
        }
    }, [isLoggedIn, navigate]);

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const emailValid = emailPattern.test(formData.email);
    const passwordValid = formData.password.length >= 1;

    const emailInputState = formData.email === "" ? "default" : emailValid ? "default" : "error";
    const passwordInputState = formData.password === "" ? "default" : passwordValid ? "default" : "error";

    const isFormValid = emailValid && passwordValid;

    const handleSubmit = async () => {
        if (!isFormValid) return;

        try {
            // ✅ 성공 시 userRecord 반환
            const userRecord = await login(formData.email, formData.password);

            // ✅ 성공 알럿 금지, 바로 치환 이동(뒤로가기 시 /login 안 뜨게)
            navigate(`/mypage/${userRecord.id}`, { replace: true });
        } catch (err) {
            console.error("❌ 로그인 실패", err);
            await confirm({
                title: "로그인 실패",
                description: "이메일 또는 비밀번호를 확인해주세요.",
                confirmText: "확인",
                cancelText: "",
            });
        }
    };

    return (
        <>
            <PageTitleBar />
            <div className="
                flex flex-col 
                max-w-[500px] mx-auto mt-8 mb-8
                px-4
                tablet:px-0
                desktop:px-0
            ">
                <div className="flex flex-col gap-2">
                    <b className="text-[32px] leading-10 text-[var(--color-gray-8)]">
                        같이<br /> 
                        요리조리해요 
                        <span className="inline-block translate-y-[-1px]">:)</span>
                    </b>
                    <p className="text-mo-title-lg text-[var(--color-gray-6)]">
                        요리로 사람을 잇는 모임 플랫폼
                    </p>
                </div>

                <form 
                    onSubmit={(e) => {
                        e.preventDefault();   // 기본 제출 방지
                        handleSubmit();       // 로그인 로직 실행
                    }}
                >
                    <div className="flex flex-col gap-4 mt-6 mb-6">
                        <Input
                            label="이메일"
                            type="email"
                            autoComplete="username"
                            placeholder="이메일을 입력해주세요."
                            state={emailInputState}
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            subTexts={
                                !emailValid && formData.email
                                    ? [{ text: "올바른 이메일을 입력해 주세요.", type: "error" }]
                                    : []
                            }
                        />
                        <Input
                            label="비밀번호"
                            type="password"
                            autoComplete="current-password"
                            placeholder="비밀번호를 입력해주세요."
                            state={passwordInputState}
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                        />
                    </div>
                    <CustomButton
                        type="submit"
                        text="로그인하기"
                        size="lg"
                        variant="primary"
                        state={isFormValid ? "default" : "disable"}
                    />
                </form>

                <div className="flex items-center mx-auto w-min mt-2">
                    <CustomButton 
                        text="비밀번호 찾기"
                        variant="tertiary"
                        basebuttonClass="hover:bg-transparent"
                        basebuttontextClass="text-[var(--color-gray-6)] hover:text-[var(--color-gray-6)] transition"
                        onClick={() => navigate("/login/find-password")}
                    />
                    <span className="w-px h-[10px] bg-[var(--color-gray-3)]"></span>
                    <CustomButton 
                        text="회원가입하기"
                        variant="tertiary"
                        basebuttonClass="hover:bg-transparent"
                        basebuttontextClass="text-[var(--color-gray-6)] hover:text-[var(--color-gray-6)] transition"
                        onClick={() => navigate("/register")}
                    />
                </div>

                <div className="flex flex-col gap-4 items-center mt-14">
                    <div className="flex items-center gap-2 whitespace-nowrap w-full">
                        <span className="w-full h-[1px] bg-[var(--color-gray-3)]"></span>
                        <p className="text-[var(--color-gray-5)] text-mo-title">
                            SNS 계정으로 로그인
                        </p>
                        <span className="w-full h-[1px] bg-[var(--color-gray-3)]"></span>
                    </div>

                    <div className="flex gap-4">
                        <SvgIcon name="sns-kakao" frameSize="lg" iconSize="sm" fill state="default" frameClass="bg-[#F4DB06] pointer-events-none" />
                        <SvgIcon name="sns-naver" frameSize="lg" iconSize="sm" fill state="default" frameClass="bg-[#18C103] pointer-events-none" />
                        <SvgIcon name="sns-google" frameSize="lg" iconSize="sm" fill state="default" iconClass="w-[20px]" frameClass="border border-[var(--color-gray-2)] pointer-events-none" />
                        <SvgIcon name="sns-apple" frameSize="lg" iconSize="sm" fill state="default" frameClass="bg-black pointer-events-none" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
