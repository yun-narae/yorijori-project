import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BaseButton from '../components/BaseButton/BaseButton';
import CustomButton from '../components/CustomButton/CustomButton';
import SvgIcon from '../components/SvgIcon/SvgIcon';
import SelectImageGroup from '../components/SelectImageGroup/SelectImageGroup';

const Test = () => {
    const navigate = useNavigate();
    const [selected, setSelected] = useState("option1");
    const [image, setImage] = useState("");
    const [selectedValue, setSelectedValue] = useState("default"); // ✅ 기본값

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-[var(--color-primary)] transition-colors duration-300">
            <h1 className="mb-6 text-2xl font-bold text-[var(--color-gray-8)]">
                🌙 다크모드 유지 테스트 페이지입니다.
            </h1>
            <SvgIcon
                name="arrow-up"
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
                imageUrl={image}
                onSelectImage={() => {
                    alert("이미지 업로드!");
                }}
                state="default" // "default", "hover", "disable"
            />
        </div>
    );
};

export default Test;
