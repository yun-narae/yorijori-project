import React, { useEffect, useState } from "react";

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    // 전역 동기화
    root.setAttribute("data-theme", isDark ? "dark" : "light");
    window.dispatchEvent(new Event("themechange"));
  }, [isDark]);

  return (
    <button
      className={`w-[36px] h-[20px] rounded-full transition-colors duration-300 
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
