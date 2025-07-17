import { useState } from "react";

export default function useProfileImages(maxCount = 3) {
    const [images, setImages] = useState([]);
  
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
  
    const handleRemoveImage = (index, silent = false) => {
      if (index !== undefined) {
        setImages((prev) => prev.filter((_, i) => i !== index));
      } else {
        // 전체 초기화용
        setImages([]);
      }
  
      if (!silent) {
        alert("이미지가 삭제되었습니다!");
      }
    };
  
    return {
      images,
      handleAddImage,
      handleRemoveImage,
    };
  }
  