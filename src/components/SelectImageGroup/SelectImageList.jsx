// src/components/Common/SelectImageList.jsx
import React, { useEffect, useId, useMemo } from "react";
import PropTypes from "prop-types";
import SelectImage from "./SelectImage";
import ImagePreviewModal from "../ImagePreviewModal/ImagePreviewModal";
import useImagePreview from "@/hooks/useImagePreview";

/**
 * 기존 기능 유지 + PostEdit 전용 프리뷰(서버 이미지 URL) 지원
 * - showPostEditPreview: true일 때 postEditPreviewUrls를 앞에 렌더링
 * - staticRemovable: 기존 이미지에 X 버튼 표시
 * - onRemoveStatic: 기존 이미지 삭제 요청 콜백
 */
export default function SelectImageList({
    images = [],
    onAddImage,
    onRemoveImage,
    SelectImageclassName = "",
    state = "default",
    maxCount = 3,

    // ✅ PostEdit 전용(기존 서버 이미지)
    showPostEditPreview = false,
    postEditPreviewUrls = [],      // ['https://.../file1.jpg', ...]
    staticRemovable = false,
    onRemoveStatic,                // (idx, url) => void
}) {
    const inputId = useId();
    const { previewUrl, openPreview, closePreview } = useImagePreview();

    // ✅ 기존(정적) + 새 파일 합산으로 슬롯 계산
    const usedCount = (showPostEditPreview ? (postEditPreviewUrls?.length || 0) : 0) + (images?.length || 0);
    const showUploadButton = usedCount < maxCount;

    // File 객체 → objectURL (정리 포함)
    const filePreviewUrls = useMemo(() => {
        return images.map((file) =>
            typeof file === "string" ? file : URL.createObjectURL(file)
        );
    }, [images]);

    useEffect(() => {
        // objectURL 정리
        return () => {
            filePreviewUrls.forEach((u) => {
                if (u?.startsWith("blob:")) URL.revokeObjectURL(u);
            });
        };
    }, [filePreviewUrls]);

    return (
        <>
            <div className="flex gap-2 flex-wrap">
                {/* 업로드 버튼(빈 슬롯) */}
                {showUploadButton && (
                    <label htmlFor={inputId}>
                        <SelectImage
                            imageUrl=""
                            onSelectImage={() => {
                                const el = document.getElementById(inputId);
                                el && el.click();
                            }}
                            className={SelectImageclassName}
                            state={state}
                        />
                        <input
                            id={inputId}
                            type="file"
                            accept="image/*"
                            onChange={onAddImage}
                            className="hidden"
                        />
                    </label>
                )}

                {/* PostEdit: 기존 서버 이미지 프리뷰 */}
                {showPostEditPreview &&
                    Array.isArray(postEditPreviewUrls) &&
                    postEditPreviewUrls.map((url, idx) => (
                        <SelectImage
                            key={`static-${idx}`}
                            imageUrl={url}
                            onSelectImage={() => openPreview(url)}
                            onRemoveImage={() => {
                                if (staticRemovable && onRemoveStatic) {
                                    onRemoveStatic(idx, url);
                                }
                            }}
                            isRemovable={staticRemovable}
                            className={SelectImageclassName}
                            state={state}
                        />
                ))}

                {/* 로컬로 추가한 이미지 프리뷰(기존 기능) */}
                {filePreviewUrls.map((src, index) => (
                    <SelectImage
                        key={`local-${index}`}
                        imageUrl={src}
                        onSelectImage={() => openPreview(src)}
                        onRemoveImage={() => onRemoveImage(index)}
                        isRemovable
                        className={SelectImageclassName}
                        state={state}
                    />
                ))}
            </div>

            {/* 미리보기 모달 */}
            <ImagePreviewModal previewUrl={previewUrl} onClose={closePreview} />
        </>
    );
}

SelectImageList.propTypes = {
    images: PropTypes.array.isRequired, // File[] 또는 dataURL[] (Story에서도 string 사용 중) :contentReference[oaicite:2]{index=2}
    onAddImage: PropTypes.func.isRequired,
    onRemoveImage: PropTypes.func.isRequired,
    SelectImageclassName: PropTypes.string,
    state: PropTypes.oneOf(["default", "hover", "disable"]),
    maxCount: PropTypes.number,

    // PostEdit 전용
    showPostEditPreview: PropTypes.bool,
    postEditPreviewUrls: PropTypes.arrayOf(PropTypes.string),
    staticRemovable: PropTypes.bool,
    onRemoveStatic: PropTypes.func,
};
