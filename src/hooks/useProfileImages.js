import { useState, useCallback } from "react";

export default function useProfileImages(maxCount = 3) {
    const [images, setImages] = useState([]);
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
            alert(`허용되지 않는 파일 형식입니다: ${f.name}`);
            return false;
        }
        return true;
    });

    setImages((prev) => {
        const base = replace ? [] : prev;
        return [...base, ...incoming].slice(0, maxCount);
    });
    }, [maxCount]);

    // ✅ 확인창/알림 없이 조용히 비우기
    const clearImages = useCallback(() => setImages([]), []);

    // ✅ 사용자가 '삭제' 아이콘을 눌렀을 때만 confirm
    const handleRemoveImage = useCallback((index, removeAll = false) => {
        if (removeAll) {
        if (window.confirm("삭제하시겠습니까?")) {
            setImages([]);
            alert("삭제되었습니다.");
        }
        return;
        }
        if (window.confirm("삭제하시겠습니까?")) {
        setImages((prev) => prev.filter((_, i) => i !== index));
        alert("삭제되었습니다.");
        }
    }, []);

    return { images, setImages, clearImages, handleAddImage, handleRemoveImage };
}
