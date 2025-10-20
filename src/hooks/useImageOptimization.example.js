// useImageOptimization 훅 사용 예시들

import useImageOptimization from './useImageOptimization';

// 예시 1: 기본 이미지 최적화
export function BasicImageOptimization() {
  const { optimizeImage, isProcessing, error } = useImageOptimization();

  const handleFileUpload = async (file) => {
    try {
      const result = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        format: 'auto', // 브라우저 지원에 따라 자동 선택
      });

      console.log('최적화 결과:', {
        format: result.format,
        originalSize: result.originalSize,
        optimizedSize: result.optimizedSize,
        compressionRatio: result.compressionRatio,
        dimensions: result.dimensions,
      });

      // 최적화된 이미지 URL 사용
      return result.url;
    } catch (err) {
      console.error('이미지 최적화 실패:', err);
    }
  };

  return { handleFileUpload, isProcessing, error };
}

// 예시 2: 썸네일 생성
export function ThumbnailGeneration() {
  const { optimizeImage } = useImageOptimization();

  const generateThumbnail = async (file) => {
    try {
      const result = await optimizeImage(file, {
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.7,
        format: 'webp', // 썸네일은 WebP로 고정
      });

      return result.url;
    } catch (err) {
      console.error('썸네일 생성 실패:', err);
    }
  };

  return { generateThumbnail };
}

// 예시 3: 다중 이미지 최적화
export function MultipleImageOptimization() {
  const { optimizeMultipleImages, isProcessing } = useImageOptimization();

  const handleMultipleUpload = async (files) => {
    try {
      const results = await optimizeMultipleImages(files, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        format: 'auto',
      });

      const totalOriginalSize = results.reduce((sum, r) => sum + r.originalSize, 0);
      const totalOptimizedSize = results.reduce((sum, r) => sum + r.optimizedSize, 0);
      const totalCompressionRatio = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1);

      console.log('다중 이미지 최적화 결과:', {
        count: results.length,
        totalOriginalSize,
        totalOptimizedSize,
        totalCompressionRatio: `${totalCompressionRatio}%`,
      });

      return results;
    } catch (err) {
      console.error('다중 이미지 최적화 실패:', err);
    }
  };

  return { handleMultipleUpload, isProcessing };
}

// 예시 4: 조건부 최적화
export function ConditionalOptimization() {
  const { optimizeImage, getImageMetadata, formatFileSize } = useImageOptimization();

  const smartOptimize = async (file) => {
    try {
      // 먼저 메타데이터 확인
      const metadata = await getImageMetadata(file);
      
      // 이미 작은 이미지는 최적화하지 않음
      if (file.size < 100 * 1024) { // 100KB 미만
        console.log('이미지가 이미 작아서 최적화를 건너뜁니다.');
        return {
          blob: file,
          url: URL.createObjectURL(file),
          format: file.type.split('/')[1],
          originalSize: file.size,
          optimizedSize: file.size,
          compressionRatio: '0%',
          dimensions: { width: metadata.width, height: metadata.height },
        };
      }

      // 고해상도 이미지는 더 강한 압축
      const quality = metadata.width > 2000 ? 0.6 : 0.8;
      
      const result = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality,
        format: 'auto',
      });

      return result;
    } catch (err) {
      console.error('스마트 최적화 실패:', err);
    }
  };

  return { smartOptimize };
}

// 예시 5: React 컴포넌트에서 사용
export function ImageUploadComponent() {
  const { optimizeImage, isProcessing, error, formatFileSize } = useImageOptimization();
  const [uploadedImages, setUploadedImages] = useState([]);

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      try {
        const result = await optimizeImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8,
          format: 'auto',
        });

        setUploadedImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          url: result.url,
          format: result.format,
          originalSize: result.originalSize,
          optimizedSize: result.optimizedSize,
          compressionRatio: result.compressionRatio,
        }]);
      } catch (err) {
        console.error('이미지 업로드 실패:', err);
      }
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        disabled={isProcessing}
      />
      
      {isProcessing && <p>이미지 최적화 중...</p>}
      {error && <p className="text-red-500">오류: {error}</p>}
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        {uploadedImages.map((image) => (
          <div key={image.id} className="border rounded p-2">
            <img src={image.url} alt="업로드된 이미지" className="w-full h-32 object-cover" />
            <div className="mt-2 text-sm">
              <p>형식: {image.format.toUpperCase()}</p>
              <p>원본: {formatFileSize(image.originalSize)}</p>
              <p>최적화: {formatFileSize(image.optimizedSize)}</p>
              <p>압축률: {image.compressionRatio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
