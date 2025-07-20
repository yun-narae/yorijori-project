import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../lib/pocketbase';
import getPbImageURL from '../lib/getPbImageURL';
import BaseButton from '../components/BaseButton/BaseButton';
import CustomButton from '../components/CustomButton/CustomButton';
import SvgIcon from '../components/SvgIcon/SvgIcon';
import SelectImageGroup from '../components/SelectImageGroup/SelectImageGroup';
import useProfileImages from "@/hooks/useProfileImages";
import Input from '../components/Input/Input';


const MyPage = () => {
    const navigate = useNavigate();
    const [selectedValue, setSelectedValue] = useState("default"); // ✅ 기본값
    const { images, handleAddImage, handleRemoveImage } = useProfileImages(3);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [testUser, setTestUser] = useState(null);

    // ✅ 마운트 시 해당 사용자 가져오기
    useEffect(() => {
        const fetchUser = async () => {
          try {
            const user = await pb.collection("users").getFirstListItem(`email="skfo0827123@naver.com"`);
            console.log("✅ 불러온 사용자:", user);
            setTestUser(user);
          } catch (err) {
            console.error("❌ 사용자 불러오기 실패:", err);
          }
        };
        fetchUser();
    }, []);

     // ✅ 이미지 URL 생성
    const imageUrl = testUser?.images
    ? getPbImageURL(testUser, 'images')
    : "https://placehold.co/150x150?text=No+Image";

    // ✅ 이메일 유효성 조건 검사
        const isValidEmail = formData.email.includes("@") && formData.email.includes(".");
        const hasInput = formData.email.trim().length > 0;

        const emailInputState = !hasInput
        ? "default"
        : isValidEmail
            ? "default"
            : "error";

        const emailSubTexts = [];

        // ✅ 입력이 있고 형식이 틀리면 error 먼저 push
        if (hasInput && !isValidEmail) {
            emailSubTexts.push({ text: "올바른 이메일을 입력해주세요.", type: "error" });
        }
        
        // ✅ 항상 info는 기본적으로 있음 (error보다 뒤에 push)
        if (!isValidEmail) {
            emailSubTexts.push({ text: "이메일을 입력해 주세요", type: "info" });
        }
        
        // ✅ 형식이 맞으면 finish만 표시 (info, error는 안나옴)
        if (isValidEmail) {
            emailSubTexts.length = 0; // 배열 초기화
            emailSubTexts.push({ text: "가입이 가능한 이메일입니다.", type: "finish" });
        }

        const emailButtonState = isValidEmail ? "activation" : "disable";


    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="mb-6 text-2xl font-bold text-[var(--color-gray-8)]">
                🌙 다크모드 유지 테스트 페이지입니다.
            </h1>
            {/* ✅ 가져온 사용자 이미지 미리보기 */}
            <div className="mb-4 text-center">
                <p>불러온 사용자 이메일: {testUser?.email}</p>
                <img
                src={imageUrl}
                alt="불러온 사용자 프로필"
                className="w-32 h-32 rounded-full object-cover"
                />
            </div>
            <SvgIcon
                name="sns-facebook"
                frameSize="lg"
                iconSize="sm"
                state="default"
                fill
                // hoverEffect={false}
                onClick={() => console.log("아이콘 클릭됨")}
                frameClass="absolute left-2 top-8"
                iconClass="absolute left-2 top-2"
            />
            <BaseButton
                text="뒤로가기"
                iconName="arrow-left"
                size="md"
                state="disable"
                onClick={() => navigate(-1)}
                className="tablet:w-[320px]"
            />
            <CustomButton
                text="제출하기"
                // iconName="arrow-right"
                subIconName="bell"
                variant="primary"
                size="md"
                state="default"
                subTexts={[
                    { text: "안내 문구입니다", type: "info" },
                    { text: "에러가 발생했습니다", type: "error" },
                    { text: "제출 완료!", type: "finish" }
                ]}
                onClick={() => console.log("✅ BaseButton 클릭")}
                onSubIconClick={() => console.log("🔔 SvgIcon 클릭")}
                // svgIconClass="bg-black"
                // basebuttonClass="bg-black"
                custombuttonClass="tablet:w-[320px]"
            />

            <SelectImageGroup
                title="프로필 이미지 선택"
                SelectImageGroupclassName="py-4"
                RadioListItemclassName="py-2"
                SelectImageclassName=""
                selectedValue={selectedValue}
                onChangeValue={setSelectedValue}
                radioOptions={[
                    { value: "default", label: "기본 이미지" },
                    { value: "checked", label: "선택 이미지" },
                ]}
                images={images}           // ✅ 배열!
                onAddImage={handleAddImage}   // ✅ 파일 선택
                onRemoveImage={handleRemoveImage} // ✅ 개별 삭제
                state="default" // "default", "hover", "disable", "checked"
                className = "mb-6"
            />

            <Input
                label="이메일"
                type="email"
                placeholder="이메일 입력"
                state={emailInputState}
                buttontext="중복확인"
                buttonState={emailButtonState}
                subTexts={emailSubTexts}
                value={formData.email}
                onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                }
                onButtonClick={() => console.log("이메일 버튼 클릭")}
                className="mb-6"
                inputClass=""
            />
        </div>
    );
};

export default MyPage;
