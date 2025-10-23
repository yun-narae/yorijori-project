// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import pb from "../lib/pocketbase";
import Input from "../components/Input/Input";
import SelectImageGroup from "../components/SelectImageGroup/SelectImageGroup";
import useProfileImages from "../hooks/useProfileImages";
import CustomButton from "../components/CustomButton/CustomButton";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import { useConfirm } from "../components/Modal/ConfirmProvider";

export default function Register() {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const [selectedValue, setSelectedValue] = useState("default");
    const { images, clearImages, handleAddImage, handleRemoveImage } = useProfileImages(1);

    const [formData, setFormData] = useState({
        nickname: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [nicknameAvailable, setNicknameAvailable] = useState(null);
    const [emailAvailable, setEmailAvailable] = useState(null);
    const [submitting, setSubmitting] = useState(false); // ✅ PageTitleBar 스켈렉톤용

    const nicknameValid = /^[a-zA-Z0-9가-힣]{1,5}$/.test(formData.nickname);
    const nicknameInputState =
        formData.nickname === "" ? "default" : !nicknameValid || nicknameAvailable === false
        ? "error" : "default";
    const nicknameButtonState =
        nicknameAvailable === true
        ? "disable"
        : nicknameInputState === "error"
        ? "disable"
        : formData.nickname.trim()
        ? "activation"
        : "disable";
    const nicknameSubTexts = [];
    if (!nicknameValid && formData.nickname) {
        nicknameSubTexts.push({ text: "특수문자를 제외한 5자 이내로 작성해 주세요.", type: "error" });
    } else if (nicknameAvailable === false) {
        nicknameSubTexts.push({ text: "이미 사용 중인 닉네임입니다.", type: "error" });
    } else if (nicknameAvailable === true) {
        nicknameSubTexts.push({ text: "가입이 가능한 닉네임입니다.", type: "finish" });
    } else {
        nicknameSubTexts.push({ text: "특수문자를 제외한 5자 이내로 작성해 주세요.", type: "info" });
    }

    const handleNicknameCheck = async () => {
        try {
            await pb.collection("users").getFirstListItem(`nickname="${formData.nickname}"`);
            setNicknameAvailable(false);
        } catch {
            setNicknameAvailable(true);
        }
    };

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const emailValid = emailPattern.test(formData.email);
    const emailInputState =
        formData.email === "" ? "default" : !emailValid || emailAvailable === false
        ? "error" : "default";
    const emailButtonState =
        emailAvailable === true
        ? "disable"
        : emailInputState === "error"
        ? "disable"
        : emailValid
        ? "activation"
        : "disable";
    const emailSubTexts = [];
    if (!emailValid && formData.email) {
        emailSubTexts.push({ text: "올바른 이메일을 입력해 주세요.", type: "error" });
    } else if (emailAvailable === false) {
        emailSubTexts.push({ text: "이미 사용 중인 이메일입니다.", type: "error" });
    } else if (emailAvailable === true) {
        emailSubTexts.push({ text: "가입이 가능한 이메일입니다.", type: "finish" });
    }

    const handleEmailCheck = async () => {
        try {
            await pb.collection("users").getFirstListItem(`email="${formData.email}"`);
            setEmailAvailable(false);
        } catch {
            setEmailAvailable(true);
        }
    };

    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,16}$/;
    const passwordValid = passwordPattern.test(formData.password);
    const passwordInputState =
        formData.password === "" ? "default" : !passwordValid ? "error" : "default";

    const confirmPasswordValid =
        formData.password === formData.confirmPassword && passwordValid;
    const confirmPasswordState =
        formData.confirmPassword === "" ? "default" : confirmPasswordValid ? "default" : "error";
    const confirmPasswordSubTexts = [];

    if (confirmPasswordValid) {
        confirmPasswordSubTexts.push({
            text: "사용 가능한 비밀번호 입니다.",
            type: "finish",
        });
    } else {
        if (formData.confirmPassword) {
            confirmPasswordSubTexts.push({
                text: "비밀번호가 서로 일치하지 않습니다.",
                type: "error",
            });
        }
        confirmPasswordSubTexts.push({
            text: "영문 대소문자, 숫자, 특수문자를 조합해 8~16자로 입력해 주세요.",
            type: "info",
        });
    }

    const handleSubmit = async (e) => {
        e?.preventDefault?.();
        if (!isFormValid) return;

        try {
            setSubmitting(true);
            const data = new FormData();
            const maskedPassword =
                formData.password.slice(0, 4) + "*".repeat(formData.password.length - 4);
            data.append("email", formData.email);
            data.append("emailVisibility", "true");
            data.append("password", formData.password);
            data.append("passwordConfirm", formData.password);
            data.append("nickname", formData.nickname);
            data.append("passwordText", maskedPassword);

            if (selectedValue === "checked" && images.length > 0) {
                images.forEach(file => {
                    if (file instanceof File) {
                        data.append("images", file);
                    }
                });
            }

            await pb.collection("users").create(data);

            setFormData({ nickname: "", email: "", password: "", confirmPassword: "" });
            setNicknameAvailable(null);
            setEmailAvailable(null);
            setSelectedValue("default");
            clearImages();

            navigate("/register/success", { state: { nickname: formData.nickname } });
        } catch (err) {
            console.error("❌ 회원가입 실패:", err?.response?.data || err?.data || err);
            await confirm({
                title: "오류",
                description: "회원가입 중 오류가 발생했습니다.",
                confirmText: "확인",
                cancelText: "",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const hasValidImage =
        selectedValue === "default" || (selectedValue === "checked" && images.length > 0);

    const isFormValid =
        nicknameAvailable === true &&
        emailAvailable === true &&
        passwordValid &&
        confirmPasswordValid &&
        hasValidImage;

    return (
        <>
            <PageTitleBar title="회원가입" loading={submitting} />

            <div className=" 
                max-w-[500px] mx-auto mt-6 mb-8
                px-4
                tablet:px-0
                desktop:px-0
                ">
                <form className="flex flex-col gap-3">
                    <Input
                        label="닉네임"
                        type="text"
                        autoComplete="username"
                        placeholder="닉네임을 입력해주세요."
                        state={nicknameInputState}
                        buttontext="중복확인"
                        buttonState={nicknameButtonState}
                        subTexts={nicknameSubTexts}
                        value={formData.nickname}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFormData({ ...formData, nickname: value });
                            if (
                                value.trim() === "" ||
                                nicknameAvailable === true ||
                                nicknameAvailable === false
                            ) {
                                setNicknameAvailable(null);
                            }
                        }}
                        onButtonClick={handleNicknameCheck}
                    />
                    <Input
                        label="이메일"
                        type="email"
                        autoComplete="username"
                        placeholder="이메일을 입력해주세요."
                        state={emailInputState}
                        buttontext="중복확인"
                        buttonState={emailButtonState}
                        subTexts={emailSubTexts}
                        value={formData.email}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFormData({ ...formData, email: value });
                            if (
                                value.trim() === "" ||
                                emailAvailable === true ||
                                emailAvailable === false
                            ) {
                                setEmailAvailable(null);
                            }
                        }}
                        onButtonClick={handleEmailCheck}
                    />
                    <div className="flex flex-col gap-1">
                        <Input
                            label="비밀번호"
                            type="password"
                            autoComplete="new-password"
                            placeholder="비밀번호를 입력해주세요."
                            state={passwordInputState}
                            subTexts={
                                !passwordValid && formData.password
                                ? [{ text: "올바르지 않은 비밀번호 입니다.", type: "error" }]
                                : []
                            }
                            value={formData.password}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFormData({ ...formData, password: value });
                            }}
                        />
                        <Input
                            type="password"
                            autoComplete="new-password"
                            placeholder="비밀번호를 다시 입력해주세요."
                            state={confirmPasswordState}
                            subTexts={confirmPasswordSubTexts}
                            value={formData.confirmPassword}
                            onChange={(e) => {
                                const value = e.target.value;
                                setFormData({ ...formData, confirmPassword: value });
                            }}
                        />
                    </div>
                </form>
                <SelectImageGroup
                    label="프로필 이미지 선택"
                    selectedValue={selectedValue}
                    onChangeValue={(value) => {
                        clearImages();
                        setSelectedValue(value);
                    }}
                    images={images}
                    onAddImage={handleAddImage}
                    onRemoveImage={handleRemoveImage}
                    radioOptions={[
                        { value: "default", label: "기본 이미지" },
                        { value: "checked", label: "선택 이미지" },
                    ]}
                    state="default"
                    className="mt-3 mb-6"
                    maxCount={1}
                />
                <CustomButton
                    text="가입하기"
                    variant="primary"
                    size="lg"
                    state={isFormValid ? "default" : "disable"}
                    onClick={handleSubmit}
                />
            </div>
        </>
    );
}
