import React from 'react';
import { useNavigate } from 'react-router-dom';
import BaseButton from '../components/BaseButton/BaseButton';

const Test = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-primary)] transition-colors duration-300 px-4">
      <h1 className="text-2xl text-[var(--color-gray-8)] font-bold mb-6">
        🌙 다크모드 유지 테스트 페이지입니다.
      </h1>
      <BaseButton text="뒤로가기" iconName="arrow-left" size="md" onClick={() => navigate(-1)}></BaseButton>
    </div>
  );
};

export default Test;
