import React, { useState, useCallback } from "react";
import { useConfirm } from "../components/Modal/ConfirmProvider";

export default function useProfileImages(maxCount = 3) {
    const [images, setImages] = useState([]);
    const confirm = useConfirm();

    // 허용 확장자/타입
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

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

    setImages((prev) => {
        const base = replace ? [] : prev;
        return [...base, ...incoming].slice(0, maxCount);
    });
    }, [maxCount]);

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

    return { images, setImages, clearImages, handleAddImage, handleRemoveImage };
}
