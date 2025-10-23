import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import pb from "../lib/pocketbase";
import { useAuth } from "../contexts/AuthContext";
import { useConfirm } from "../components/Modal/ConfirmProvider";
import PageTitleBar from "../components/PageTitleBar/PageTitleBar";
import Input from "../components/Input/Input";
import CustomButton from "../components/CustomButton/CustomButton";
import SelectImageGroup from "../components/SelectImageGroup/SelectImageGroup";
import useProfileImages from "../hooks/useProfileImages";
import getPbImageURL from "../lib/getPbImageURL";

const SUBMIT_SKELETON_MIN_MS = Number(import.meta.env.VITE_SUBMIT_SKELETON_MIN_MS || 600);

export default function MyInfoEdit() {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const { user: authUser, refresh: refreshAuth } = useAuth();

    // 가드: 비로그인 → 로그인으로
    useEffect(() => {
        if (!authUser?.id) {
            navigate("/login", { replace: true });
        }
    }, [authUser, navigate]);

    const [nickname, setNickname] = useState(authUser?.nickname ?? "");
    const [checking, setChecking] = useState({ nickname: null }); // null|true|false
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 프로필 이미지 업로드(회원가입과 동일 패턴)
    // - 최대 1장
    const { images, clearImages, handleAddImage, handleRemoveImage } = useProfileImages(1);
    // 기본 이미지/선택 이미지 라디오
    const [selectedValue, setSelectedValue] = useState(
        authUser?.images ? "checked" : "default"
    );

    // 유효성
    const nicknameValid = useMemo(() => /^[a-zA-Z0-9가-힣]{1,5}$/.test(nickname), [nickname]);
    const canSubmit = useMemo(() => {
        // 닉네임 형식 OK 이고, 중복체크 통과(또는 내 닉 그대로) 이고,
        // 이미지 정책(기본/선택)도 충족
        const imageOk = selectedValue === "default" || images.length > 0;
        const nicknameOwn = nickname === (authUser?.nickname ?? "");
        const nicknameReady = nicknameOwn || checking.nickname === true; // 내 닉이면 체크 불필요
        return nicknameValid && nicknameReady && imageOk && !!authUser?.id && !isSubmitting;
    }, [nickname, nicknameValid, checking.nickname, selectedValue, images.length, authUser?.id, authUser?.nickname, isSubmitting]);

    // 닉네임 중복확인 (본인 제외)
    const handleNicknameCheck = async () => {
        if (!nicknameValid || !authUser?.id) return;
        setChecking((p) => ({ ...p, nickname: null }));
        try {
            // 본인(id) 제외하고 같은 닉이 있으면 중복
            await pb.collection("users").getFirstListItem(`nickname="${nickname}" && id != "${authUser.id}"`);
            setChecking((p) => ({ ...p, nickname: false }));
        } catch {
            setChecking((p) => ({ ...p, nickname: true }));
        }
    };

    // 저장
    const handleSave = async () => {
        if (!canSubmit) return;

        const start = Date.now();
        setIsSubmitting(true);

        try {
            const data = new FormData();
            data.append("nickname", nickname);

            if (selectedValue === "default") {
                // 파일 필드 비우기(PB는 빈 문자열로 클리어)
                data.append("images", "");
            } else {
                // 새 파일이 있을 때만 덮어씀(없으면 기존 유지)
                images.forEach((file) => {
                    if (file instanceof File) {
                        data.append("images", file);
                    }
                });
            }

            await pb.collection("users").update(authUser.id, data);
            // 내 세션 최신화
            await refreshAuth?.();

            const elapsed = Date.now() - start;
            const remain = Math.max(0, SUBMIT_SKELETON_MIN_MS - elapsed);
            setTimeout(async () => {
                setIsSubmitting(false);
                await confirm({
                    title: "완료",
                    description: "변경사항이 저장되었습니다.",
                    confirmText: "확인",
                    cancelText: "",
                });
                navigate(`/mypage/${authUser.id}`, { replace: true });
            }, remain);
        } catch (error) {
            const details = error?.response?.data || error?.data;
            console.error("프로필 저장 실패:", error);
            console.error("PocketBase details:", details);

            const elapsed = Date.now() - start;
            const remain = Math.max(0, SUBMIT_SKELETON_MIN_MS - elapsed);
            setTimeout(async () => {
                setIsSubmitting(false);
                await confirm({
                    title: "오류",
                    description: "저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
                    confirmText: "확인",
                    cancelText: ""
                });
            }, remain);
        }
    };

    // 입력 컴포넌트 상태 텍스트(회원가입과 동일 톤)
    const nicknameSubTexts = (() => {
        const arr = [];
        if (!nickname) {
            arr.push({ text: "특수문자를 제외한 5자 이내로 작성해 주세요.", type: "info" });
            return arr;
        }
        if (!nicknameValid) {
            arr.push({ text: "특수문자를 제외한 5자 이내로 작성해 주세요.", type: "error" });
            return arr;
        }
        if (nickname === (authUser?.nickname ?? "")) {
            arr.push({ text: "현재 사용 중인 닉네임입니다.", type: "info" });
            return arr;
        }
        if (checking.nickname === true) {
            arr.push({ text: "사용 가능한 닉네임입니다.", type: "finish" });
            return arr;
        }
        if (checking.nickname === false) {
            arr.push({ text: "이미 사용 중인 닉네임입니다.", type: "error" });
            return arr;
        }
        arr.push({ text: "중복확인을 진행해 주세요.", type: "info" });
        return arr;
    })();

    const nicknameInputState =
        !nickname
            ? "default"
            : !nicknameValid
            ? "error"
            : checking.nickname === false
            ? "error"
            : "default";

    const nicknameButtonState =
        !nicknameValid || !nickname || nickname === (authUser?.nickname ?? "")
            ? "disable"
            : checking.nickname === true
            ? "disable"
            : "activation";

    // 기존 등록된 프로필 이미지 URL (있으면 미리보기로 쓰기)
    const existingImageUrl = useMemo(() => {
        if (authUser?.images) {
            try {
                return getPbImageURL(authUser, "images");
            } catch {
                return null;
            }
        }
        return null;
    }, [authUser]);

    // A) 처음 한 번만 기존 이미지를 미리보기로 채워 넣기(삭제 후 다시 채워지는 문제 방지)
    const hydratedOnceRef = useRef(false);
    useEffect(() => {
        if (hydratedOnceRef.current) return;
        if (selectedValue === "checked" && existingImageUrl && images.length === 0) {
            (async () => {
                try {
                    const res = await fetch(existingImageUrl, { cache: "no-cache" });
                    const blob = await res.blob();
                    const ext = (blob.type && blob.type.split("/")[1]) || "jpg";
                    const file = new File([blob], `current-profile.${ext}`, { type: blob.type || "image/jpeg" });
                    handleAddImage(file);
                    hydratedOnceRef.current = true;
                } catch (e) {
                    console.error("기존 프로필 이미지 로드 실패:", e);
                }
            })();
        }
    }, [selectedValue, existingImageUrl, images.length, handleAddImage]);
    
    // B) '기본 이미지'로 바꾸면 업로드 목록은 비웁니다(헷갈림 방지)
    useEffect(() => {
        if (selectedValue === "default" && images.length > 0) {
            clearImages();
        }
    }, [selectedValue, images.length, clearImages]);

    return (
        <>
            <PageTitleBar loading={isSubmitting} />

            <div className="
                max-w-[500px] mx-auto mt-6 mb-8
                px-4 tablet:px-0 desktop:px-0
            ">
                <div className="flex flex-col gap-3">
                    <Input
                        label="닉네임"
                        type="text"
                        placeholder="닉네임을 입력해주세요."
                        value={nickname}
                        onChange={(e) => {
                            setNickname(e.target.value);
                            // 닉네임 타이핑 시 중복 상태 리셋
                            setChecking((p) => ({ ...p, nickname: null }));
                        }}
                        state={nicknameInputState}
                        buttontext="중복확인"
                        buttonState={nicknameButtonState}
                        onButtonClick={handleNicknameCheck}
                        subTexts={nicknameSubTexts}
                    />

                    <SelectImageGroup
                        title="프로필 이미지"
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
                        className="mb-6"
                        maxCount={1}
                    />

                    <div className="flex gap-2">
                        <CustomButton
                            text="적용하기"
                            variant="primary"
                            size="lg"
                            state={canSubmit ? "default" : "disable"}
                            onClick={handleSave}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
