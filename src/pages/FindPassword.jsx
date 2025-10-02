// src/pages/FindPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import pb from "../lib/pocketbase";
import Input from "../components/Input/Input";
import CustomButton from "../components/CustomButton/CustomButton";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";

const FindPassword = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [passwordPreview, setPasswordPreview] = useState("");
    const [result, setResult] = useState("");

    // 정규식으로 이메일 유효성 검사
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const emailValid = emailPattern.test(email);

    // 입력 상태 표시
    const emailState = email === "" ? "default" : emailValid ? "default" : "error";
    const emailSubTexts = [];
    if (email && !emailValid) {
        emailSubTexts.push({ text: "올바른 이메일 형식을 입력해 주세요.", type: "error" });
    }

    const handleFindPassword = async () => {
        if (!emailValid) {
            setResult("올바른 이메일 형식을 입력해 주세요.");
            return;
        }
        try {
            const user = await pb.collection("users").getFirstListItem(`email="${email}"`);
            if (user && user.passwordText) {
                setPasswordPreview(user.passwordText);
                setResult("비밀번호 일부를 표시했습니다.");
            } else {
                setResult("해당 이메일로 등록된 비밀번호를 찾을 수 없습니다.");
            }
        } catch (err) {
            console.error("비밀번호 찾기 실패:", err);
            setResult("해당 이메일로 등록된 비밀번호를 찾을 수 없습니다.");
        }
    };

    return (
        <>
            <PageTitleBar />

            {passwordPreview ? (
                <div className="flex flex-col max-w-[500px] mx-auto mt-8 mb-8 px-4 tablet:px-0 desktop:px-0">
                    <div className="mb-4 text-center">
                        <h2 className="text-mo-title-lg tablet:text-tab-title-lg desktop:text-pc-title-md font-bold text-[var(--color-gray-8)]">
                            {result}
                        </h2>
                    </div>
                    <Input value={passwordPreview} readOnly className="pointer-events-none" />
                    <CustomButton
                        text="로그인하러 가기"
                        variant="primary"
                        size="lg"
                        onClick={() => navigate("/login")}
                        custombuttonClass="mt-4"
                    />
                </div>
            ) : (
                // 이메일 입력 화면
                <div className="flex flex-col max-w-[500px] mx-auto mt-8 mb-8 px-4 tablet:px-0 desktop:px-0">
                    <div className="mb-6 text-center">
                        <h2 className="mb-2 text-mo-title-lg tablet:text-tab-title-lg desktop:text-pc-title-md font-bold text-[var(--color-gray-8)]">
                            이메일을 입력해 주세요.
                        </h2>
                        <p className="text-mo-text tablet:text-tab-text desktop:text-pc-text text-[var(--color-gray-6)]">
                            비밀번호를 찾기 위해 이메일 입력이 필요해요.
                        </p>
                    </div>

                    <Input
                        label="이메일"
                        placeholder="이메일을 입력해주세요."
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setResult(""); // 이전 결과 초기화
                        }}
                        state={emailState}
                        subTexts={emailSubTexts}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && emailValid) {
                                handleFindPassword();
                            }
                        }}
                    />

                    <CustomButton
                        text="비밀번호 찾기"
                        variant="primary"
                        size="lg"
                        onClick={handleFindPassword}
                        state={emailValid ? "default" : "disable"}
                        aria-disabled={!emailValid}
                        subTexts={
                            result && !passwordPreview
                                ? [{ text: result, type: "error" }]
                                : []
                        }
                        custombuttonClass="mt-4"
                    />
                </div>
            )}
        </>
    );
};

export default FindPassword;
