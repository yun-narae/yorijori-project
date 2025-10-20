import React, { useState, useCallback } from "react";
import { useConfirm } from "../components/Modal/ConfirmProvider";
import useImageOptimization from "./useImageOptimization";

export default function useProfileImages(maxCount = 3) {
    const [images, setImages] = useState([]);
    const confirm = useConfirm();
    const { optimizeMultipleImages, isProcessing } = useImageOptimization();

    // 허용 확장자/타입 (최적화된 형식도 포함)
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];

    const handleAddImage = useCallback(async (input, { replace = false } = {}) => {
        let incoming = [];

        if (input?.target?.files) incoming = Array.from(input.target.files);
        else if (Array.isArray(input)) incoming = input;
        else if (input instanceof File || input instanceof Blob) incoming = [input];
        else incoming = [];

        incoming = incoming.map(
        (f, i) =>
            f instanceof File
            ? f
            : new File([f], `image-${Date.now()}-${i}.png`, {
                type: f.type || "image/png",
                })
        );

    // 형식 제한
    incoming = incoming.filter((f) => {
        if (!ALLOWED_TYPES.includes(f.type)) {
            confirm({title:"허용되지 않는 파일 형식입니다", description:"", confirmText:"확인"});
            return false;
        }
        return true;
    });

    // 이미지 최적화 적용 (프로필 이미지는 더 작은 크기로)
    try {
        const optimizedResults = await optimizeMultipleImages(incoming, {
            maxWidth: 800, // 프로필 이미지는 더 작게
            maxHeight: 800,
            quality: 0.9, // 프로필은 품질을 높게
            format: 'auto',
            enableCompression: true,
        });

        // 최적화된 이미지로 변환
        const optimizedFiles = optimizedResults.map((result, index) => {
            const originalFile = incoming[index];
            return new File([result.blob], originalFile.name, {
                type: result.blob.type,
                lastModified: originalFile.lastModified,
            });
        });

        setImages((prev) => {
            const base = replace ? [] : prev;
            return [...base, ...optimizedFiles].slice(0, maxCount);
        });
    } catch (error) {
        console.error('프로필 이미지 최적화 실패:', error);
        // 최적화 실패 시 원본 파일 사용
        setImages((prev) => {
            const base = replace ? [] : prev;
            return [...base, ...incoming].slice(0, maxCount);
        });
    }
    }, [maxCount, optimizeMultipleImages, confirm]);

    // 확인창/알림 없이 조용히 비우기
    const clearImages = useCallback(() => setImages([]), []);

    // 사용자가 '삭제' 아이콘을 눌렀을 때만 confirm
    // 확인 모달 사용
    const handleRemoveImage = useCallback(
        async (index, removeAll = false, { silent = false } = {}) => {
        if (silent) {
            setImages(removeAll ? [] : (prev) => prev.filter((_, i) => i !== index));
            return;
        }

        const ok = await confirm({
            title: "삭제하시겠습니까?",
            description: "",
            confirmText: "삭제",
            cancelText: "취소",
            tone: "danger",
        });
        if (!ok) return;

        setImages((prev) => (removeAll ? [] : prev.filter((_, i) => i !== index)));
        // 삭제 완료 안내 모달은 UX상 생략(필요하면 추가)
        },
        [confirm]
    );

    return { 
        images, 
        setImages, 
        clearImages, 
        handleAddImage, 
        handleRemoveImage, 
        isProcessing // 최적화 진행 상태
    };
}
