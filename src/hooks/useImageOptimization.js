import { useState, useCallback } from 'react';

/**
 * 이미지 최적화 훅
 * - WebP, AVIF 형식 지원
 * - 이미지 압축 및 리사이징
 * - 브라우저 지원 여부 자동 감지
 */
export default function useImageOptimization() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // 브라우저 지원 여부 확인
  const checkSupport = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    return {
      webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
      avif: canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0,
    };
  }, []);

  // 이미지 리사이징
  const resizeImage = useCallback((file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 원본 비율 유지하면서 리사이징
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // 고품질 리샘플링
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas);
      };

      img.onerror = () => reject(new Error('이미지 로드 실패'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // 최적화된 이미지 생성
  const optimizeImage = useCallback(async (file, options = {}) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'auto', // 'auto', 'webp', 'avif', 'jpeg', 'png'
      enableCompression = true,
    } = options;

    setIsProcessing(true);
    setError(null);

    try {
      const support = checkSupport();
      let canvas;
      let finalFormat = format;

      // 리사이징이 필요한 경우
      if (enableCompression) {
        canvas = await resizeImage(file, maxWidth, maxHeight, quality);
      } else {
        // 리사이징 없이 원본 사용
        canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve();
          };
          img.onerror = reject;
          img.src = URL.createObjectURL(file);
        });
      }

      // 형식 자동 선택
      if (format === 'auto') {
        if (support.avif) {
          finalFormat = 'avif';
        } else if (support.webp) {
          finalFormat = 'webp';
        } else {
          finalFormat = file.type.includes('png') ? 'png' : 'jpeg';
        }
      }

      // 최적화된 이미지 생성
      const mimeType = `image/${finalFormat}`;
      const optimizedBlob = await new Promise((resolve) => {
        canvas.toBlob(resolve, mimeType, quality);
      });

      // 파일 크기 비교
      const originalSize = file.size;
      const optimizedSize = optimizedBlob.size;
      const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);

      return {
        blob: optimizedBlob,
        url: URL.createObjectURL(optimizedBlob),
        format: finalFormat,
        originalSize,
        optimizedSize,
        compressionRatio: `${compressionRatio}%`,
        dimensions: {
          width: canvas.width,
          height: canvas.height,
        },
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [checkSupport, resizeImage]);

  // 여러 이미지 일괄 최적화
  const optimizeMultipleImages = useCallback(async (files, options = {}) => {
    setIsProcessing(true);
    setError(null);

    try {
      const results = await Promise.all(
        files.map(file => optimizeImage(file, options))
      );

      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, [optimizeImage]);

  // 이미지 메타데이터 추출
  const getImageMetadata = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        });
      };

      img.onerror = () => reject(new Error('이미지 메타데이터 추출 실패'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // 파일 크기 포맷팅
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  return {
    optimizeImage,
    optimizeMultipleImages,
    getImageMetadata,
    formatFileSize,
    checkSupport,
    isProcessing,
    error,
  };
}

// 사용 예시:
/*
const { optimizeImage, isProcessing, error } = useImageOptimization();

const handleImageUpload = async (file) => {
  try {
    const result = await optimizeImage(file, {
      maxWidth: 1920,
      maxHeight: 1080,
      quality: 0.8,
      format: 'auto', // 브라우저 지원에 따라 자동 선택
    });
    
    console.log('최적화 결과:', result);
    // result.url을 사용하여 최적화된 이미지 표시
  } catch (err) {
    console.error('이미지 최적화 실패:', err);
  }
};
*/
