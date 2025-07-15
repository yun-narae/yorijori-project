import { useState } from "react";

export default function useProfileImages(maxCount = 3) {
    const [images, setImages] = useState([]);

    // 추가
    const handleAddImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (images.length >= maxCount) {
        alert(`이미지는 최대 ${maxCount}개까지 업로드할 수 있어요.`);
        return;
        }

        setImages((prev) => [...prev, file]);
        e.target.value = null;
    };

    // 삭제
    const handleRemoveImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        alert("이미지가 삭제되었습니다!");
    };

    return {
        images,
        handleAddImage,
        handleRemoveImage,
    };
}
