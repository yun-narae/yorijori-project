import React from 'react';
import { useNavigate } from 'react-router-dom';

const Test = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-primary)] transition-colors duration-300 px-4">
      <h1 className="text-2xl text-[var(--color-gray-8)] font-bold mb-6">
        🌙 다크모드 유지 테스트 페이지입니다.
      </h1>
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 rounded-lg bg-[var(--color-secondary)] text-white hover:opacity-90 transition"
      >
        ← 뒤로가기
      </button>
    </div>
  );
};

export default Test;
