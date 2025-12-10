import { useState } from 'react';

export function useCropper() {
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const openCropper = (file: File) => {
    if (file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setCropperImage(imageUrl);
      setPendingFile(file);
      return true;
    }
    return false;
  };

  const closeCropper = () => {
    if (cropperImage) {
      URL.revokeObjectURL(cropperImage);
    }
    setCropperImage(null);
    setPendingFile(null);
  };

  const handleCropComplete = (croppedBlob: Blob, onComplete: (file: File) => void) => {
    if (!pendingFile) return;

    const croppedFile = new File([croppedBlob], pendingFile.name, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    onComplete(croppedFile);
    closeCropper();
  };

  return {
    cropperImage,
    pendingFile,
    openCropper,
    closeCropper,
    handleCropComplete,
  };
}
