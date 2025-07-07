import { useState } from "react";

export default function useImagePreview() {
  const [previewUrl, setPreviewUrl] = useState(null);

  const openPreview = (url) => {
    setPreviewUrl(url);
  };

  const closePreview = () => {
    setPreviewUrl(null);
  };

  return {
    previewUrl,
    openPreview,
    closePreview,
  };
}