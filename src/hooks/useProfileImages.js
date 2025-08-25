// src/hooks/useProfileImages.js
import { useState, useCallback } from "react";

export default function useProfileImages(maxCount = 3) {
    const [images, setImages] = useState([]);

    // e(target.files) | File | File[] | Blob[] | dataURL[] 모두 허용
    const handleAddImage = useCallback(async (input, { replace = false } = {}) => {
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
        incoming = incoming.map((f, i) =>
        f instanceof File ? f : new File([f], `image-${Date.now()}-${i}.png`, { type: f.type || "image/png" })
        );

        setImages(prev => {
        const base = replace ? [] : prev;
        const next = [...base, ...incoming].slice(0, maxCount);
        return next;
        });
    }, [maxCount]);

    const handleRemoveImage = useCallback((index, removeAll = false) => {
        if (removeAll) {
        setImages([]);
        return;
        }
        setImages(prev => prev.filter((_, i) => i !== index));
    }, []);

    return { images, setImages, handleAddImage, handleRemoveImage };
}
