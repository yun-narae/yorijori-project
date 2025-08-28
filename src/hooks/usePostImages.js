// src/hooks/usePostImages.js
import { useState, useCallback } from "react";

export default function usePostImages(maxCount = 3) {
    const [images, setImages] = useState([]);

    // 허용 확장자/타입
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

    const handleAddImage = useCallback(
        async (input, { replace = false } = {}) => {
        let incoming = [];

        if (input?.target?.files) {
            incoming = Array.from(input.target.files);
        } else if (Array.isArray(input)) {
            incoming = input;
        } else if (input instanceof File || input instanceof Blob) {
            incoming = [input];
        } else {
            // 지원하지 않는 타입이면 무시
            incoming = [];
        }

        // Blob → File 이름 보정
        incoming = incoming.map(
            (f, i) =>
            f instanceof File
                ? f
                : new File([f], `image-${Date.now()}-${i}.png`, {
                    type: f.type || "image/png",
                })
        );

        // ✅ 허용된 파일 타입만 필터링
        incoming = incoming.filter((f) => {
            if (!ALLOWED_TYPES.includes(f.type)) {
            alert(`허용되지 않는 파일 형식입니다: ${f.name}`);
            return false;
            }
            return true;
        });

        setImages((prev) => {
            const base = replace ? [] : prev;
            const next = [...base, ...incoming].slice(0, maxCount);
            return next;
        });
        },
        [maxCount]
    );

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

    return { images, setImages, handleAddImage, handleRemoveImage };
}
