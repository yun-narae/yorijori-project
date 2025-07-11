import React, { useState } from "react";
import Input from "../components/Input/Input";
import SelectImageGroup from "../components/SelectImageGroup/SelectImageGroup";
import useProfileImages from "../hooks/useProfileImages";
import pb from "../lib/pocketbase";
import CustomButton from '../components/CustomButton/CustomButton';

export default function SignupPage() {
    const [selectedValue, setSelectedValue] = useState("default");
    const { images, handleAddImage, handleRemoveImage } = useProfileImages(3);

    const [formData, setFormData] = useState({
        nickname: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [nicknameAvailable, setNicknameAvailable] = useState(null);
    const [emailAvailable, setEmailAvailable] = useState(null);

    // 닉네임
    const nicknameValid = /^[a-zA-Z0-9가-힣]{1,5}$/.test(formData.nickname);
    const nicknameButtonState = formData.nickname.trim() ? "activation" : "disable";
    const nicknameInputState =
        formData.nickname === ""
            ? "default"
            : !nicknameValid
                ? "error"
                : nicknameAvailable === false
                    ? "error"
                    : nicknameAvailable === true
                        ? "default"
                        : "default";

    const nicknameSubTexts = [];
    if (!nicknameValid && formData.nickname) {
        nicknameSubTexts.push({ text: "올바른 닉네임을 입력해 주세요.", type: "error" });
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

    // 이메일
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const emailValid = emailPattern.test(formData.email);
    const emailButtonState = emailValid ? "activation" : "disable";
    const emailInputState =
        formData.email === ""
            ? "default"
            : !emailValid
                ? "error"
                : emailAvailable === false
                    ? "error"
                    : emailAvailable === true
                        ? "default"
                        : "default";

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

    // 비밀번호
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,16}$/;
    const passwordValid = passwordPattern.test(formData.password);
    const passwordInputState =
        formData.password === ""
            ? "default"
            : !passwordValid
                ? "error"
                : "default";

    const confirmPasswordValid =
        formData.password === formData.confirmPassword && passwordValid;
    const confirmPasswordState =
        formData.confirmPassword === ""
            ? "default"
            : confirmPasswordValid
                ? "default"
                : "error";

    const confirmPasswordSubTexts = [];
    if (confirmPasswordValid) {
        confirmPasswordSubTexts.push({
            text: "사용 가능한 비밀번호 입니다.",
            type: "finish",
        });
    } else if (formData.confirmPassword) {
        confirmPasswordSubTexts.push({
            text: "비밀번호가 서로 일치하지 않습니다.",
            type: "error",
        });
    } else {
        confirmPasswordSubTexts.push({
            text: "영문 대소문자, 숫자, 특수문자를 3가지 이상으로 조합해 8자 이상 16자 이하로 입력해주세요.",
            type: "info",
        });
    }

    const handleSubmit = async () => {
        if (!nicknameValid || nicknameAvailable !== true) {
            alert("닉네임을 다시 확인해주세요.");
            return;
        }
        if (!emailValid || emailAvailable !== true) {
            alert("이메일을 다시 확인해주세요.");
            return;
        }
        if (!passwordValid || !confirmPasswordValid) {
            alert("비밀번호 조건을 다시 확인해주세요.");
            return;
        }
        alert("회원가입 성공 (예시)");
        // TODO: pb.collection("users").create(...) 호출
    };

    return (
        <div className="flex flex-col gap-4 px-4 max-w-[500px] mx-auto">
            <Input
                label="닉네임"
                type="text"
                placeholder="닉네임을 입력해주세요."
                state={nicknameInputState}
                buttontext="중복확인"
                buttonState={nicknameButtonState}
                subTexts={nicknameSubTexts}
                value={formData.nickname}
                onChange={(e) =>
                    setFormData({ ...formData, nickname: e.target.value })
                }
                onButtonClick={handleNicknameCheck}
            />

            <Input
                label="이메일"
                type="email"
                placeholder="이메일을 입력해주세요."
                state={emailInputState}
                buttontext="중복확인"
                buttonState={emailButtonState}
                subTexts={emailSubTexts}
                value={formData.email}
                onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                }
                onButtonClick={handleEmailCheck}
            />

            <div className="flex flex-col gap-2">
                <Input
                    label="비밀번호"
                    type="password"
                    placeholder="비밀번호를 입력해주세요."
                    state={passwordInputState}
                    subTexts={
                        !passwordValid && formData.password
                            ? [{ text: "올바르지 않은 비밀번호 입니다.", type: "error" }]
                            : []
                    }
                    value={formData.password}
                    onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                    }
                />
                <Input
                    type="password"
                    placeholder="비밀번호를 다시 입력해주세요."
                    state={confirmPasswordState}
                    subTexts={confirmPasswordSubTexts}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                        setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                />
            </div>

            <SelectImageGroup
                label="프로필 이미지 선택"
                selectedValue={selectedValue}
                onChangeValue={setSelectedValue}
                images={images}
                onAddImage={handleAddImage}
                onRemoveImage={handleRemoveImage}
                radioOptions={[
                    { value: "default", label: "기본 이미지" },
                    { value: "checked", label: "선택 이미지" },
                ]}
                state="default"
                className="mb-6"
            />

            <CustomButton 
                text="가입하기"
                variant="primary"
                size="lg"
                state="disable" // 모든 폼이 true이면 default
                onClick={handleSubmit}
                basebuttonClass=""
                custombuttonClass=""
            />
        </div>
    );
}
