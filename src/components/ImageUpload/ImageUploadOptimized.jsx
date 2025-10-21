import React, { useState, useRef } from 'react';
import useImageOptimization from '../../hooks/useImageOptimization';
import SvgIcon from '../SvgIcon/SvgIcon';

/**
 * 최적화된 이미지 업로드 컴포넌트
 * - WebP/AVIF 자동 변환
 * - 이미지 압축 및 리사이징
 * - 업로드 진행률 표시
 */
export default function ImageUploadOptimized({ 
  onImagesChange, 
  maxImages = 5, 
  maxSize = 10 * 1024 * 1024, // 10MB
  className = "" 
}) {
  const [images, setImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const { 
    optimizeImage, 
    optimizeMultipleImages, 
    getImageMetadata, 
    formatFileSize, 
    checkSupport,
    isProcessing, 
    error 
  } = useImageOptimization();

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    
    // 파일 개수 제한
    if (images.length + fileArray.length > maxImages) {
      alert(`최대 ${maxImages}개의 이미지만 업로드할 수 있습니다.`);
      return;
    }

    // 파일 크기 검증
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert(`파일 크기가 너무 큽니다. 최대 ${formatFileSize(maxSize)}까지 업로드 가능합니다.`);
      return;
    }

    try {
      // 이미지 최적화
      const optimizedResults = await optimizeMultipleImages(fileArray, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        format: 'auto',
        enableCompression: true,
      });

      // 메타데이터 추가
      const newImages = await Promise.all(
        optimizedResults.map(async (result, index) => {
          const metadata = await getImageMetadata(fileArray[index]);
          return {
            id: Date.now() + index,
            file: fileArray[index],
            optimizedBlob: result.blob,
            url: result.url,
            format: result.format,
            originalSize: result.originalSize,
            optimizedSize: result.optimizedSize,
            compressionRatio: result.compressionRatio,
            dimensions: result.dimensions,
            metadata,
          };
        })
      );

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange?.(updatedImages);

    } catch (err) {
      console.error('이미지 최적화 실패:', err);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const removeImage = (id) => {
    const updatedImages = images.filter(img => img.id !== id);
    setImages(updatedImages);
    onImagesChange?.(updatedImages);
  };

  const support = checkSupport();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 브라우저 지원 정보 */}
      <div className="text-sm text-gray-600">
        <span className="font-medium">지원 형식:</span>
        <span className={`ml-2 px-2 py-1 rounded text-xs ${support.avif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          AVIF {support.avif ? '✓' : '✗'}
        </span>
        <span className={`ml-1 px-2 py-1 rounded text-xs ${support.webp ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          WebP {support.webp ? '✓' : '✗'}
        </span>
      </div>

      {/* 드래그 앤 드롭 영역 */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {isProcessing ? (
          <div className="space-y-2">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600">이미지 최적화 중...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <SvgIcon name="image" className="w-12 h-12 mx-auto text-gray-400" />
            <p className="text-gray-600">
              이미지를 드래그하거나 클릭하여 업로드
            </p>
            <p className="text-sm text-gray-500">
              최대 {maxImages}개, 각 {formatFileSize(maxSize)}까지
            </p>
          </div>
        )}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* 업로드된 이미지 목록 */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">업로드된 이미지 ({images.length}/{maxImages})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image.url}
                    alt="업로드된 이미지"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* 삭제 버튼 */}
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <SvgIcon name="close" className="w-4 h-4" />
                </button>

                {/* 이미지 정보 */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{image.dimensions.width} × {image.dimensions.height}</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {image.format.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(image.optimizedSize)}</span>
                    <span className="text-green-600">
                      {image.compressionRatio} 압축
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
