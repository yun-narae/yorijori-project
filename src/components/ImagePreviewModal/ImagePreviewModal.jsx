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
        <div className="aspect-[0.988095/1] max-w-[90vw] max-h-[85vh] relative">
            <img
                src={previewUrl}
                alt="확대 이미지"
                className={[
                    "w-full",
                    "rounded shadow-lg",
                    "object-contain h-full",
                ].join(" ")}
            />
        </div>
        <SvgIcon
            name="delete"
            frameClass={isDark ? "absolute top-2 right-2 bg text-2xl" : "absolute top-4 right-4 bg text-2xl text-white rounded-full hover:bg-[var(--color-gray-4)] transition cursor-pointer"}
            onClick={onClose}
            fill
        />
    </div>
  );
}

ImagePreviewModal.propTypes = {
  previewUrl: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};
