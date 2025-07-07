import React from "react";
import PropTypes from "prop-types";
import { SvgIcon } from "../SvgIcon/SvgIcon";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";

export default function ImagePreviewModal({ previewUrl, onClose }) {
  if (!previewUrl) return null;

  useLockBodyScroll(previewUrl);

  const isDark = document.documentElement.classList.contains("dark");
  // 또는 const isDark = useDarkMode(); 

  return (
    <div className={[
            "fixed inset-0 z-50",
            "bg-black bg-opacity-80",
            "flex items-center justify-center",
        ].join(" ")}
    >
      <div className="relative p-7">
        <img
          src={previewUrl}
          alt="확대 이미지"
          className={[
            "w-full tablet:w-[600px] desktop:w-[700px]",
            "rounded shadow-lg",
          ].join(" ")}
        />
        <SvgIcon
          name="delete"
          frameClass={isDark ? "absolute top-4 right-4 bg text-2xl" : "absolute top-4 right-4 bg text-2xl text-white rounded-full hover:bg-[var(--color-gray-4)] transition cursor-pointer"}
          onClick={onClose}
          fill
        />
      </div>
    </div>
  );
}

ImagePreviewModal.propTypes = {
  previewUrl: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
