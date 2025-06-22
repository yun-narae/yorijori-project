import { useEffect, useState } from "react";

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    // 초기값: localStorage 또는 시스템 다크모드
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <button
      className={`fixed bottom-4 right-4 w-[36px] h-[20px] rounded-full transition-colors duration-300 
        ${isDark ? "bg-[var(--color-blue-1)]" : "bg-[var(--color-gray-5)]"}`}
      onClick={() => setIsDark(!isDark)}
    >
      <div
        className={`w-[16px] h-[16px] bg-[var(--white)] rounded-full shadow-md transform transition-transform duration-300
          ${isDark ? "translate-x-[18px]" : "translate-x-[2px]"}`}
      />
    </button>
  );
};

export default DarkModeToggle;
