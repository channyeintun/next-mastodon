'use client';

import { useState, useRef } from 'react';
import { Cropper, ReactCropperElement } from 'react-cropper';
import 'react-cropper/node_modules/cropperjs/dist/cropper.min.css';
import { X, Check, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../atoms/Button';
import { IconButton } from '../atoms/IconButton';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 16 / 9,
}: ImageCropperProps) {
  const cropperRef = useRef<ReactCropperElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCropConfirm = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    try {
      setIsProcessing(true);

      // Get cropped canvas
      const canvas = cropper.getCroppedCanvas({
        maxWidth: 4096,
        maxHeight: 4096,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
      });

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
        }
        setIsProcessing(false);
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Error cropping image:', error);
      setIsProcessing(false);
    }
  };

  const handleRotateRight = () => {
    cropperRef.current?.cropper.rotate(90);
  };

  const handleRotateLeft = () => {
    cropperRef.current?.cropper.rotate(-90);
  };

  const handleFlipHorizontal = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const scaleX = cropper.getData().scaleX || 1;
      cropper.scaleX(-scaleX);
    }
  };

  const handleFlipVertical = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      const scaleY = cropper.getData().scaleY || 1;
      cropper.scaleY(-scaleY);
    }
  };

  const handleZoomIn = () => {
    cropperRef.current?.cropper.zoom(0.1);
  };

  const handleZoomOut = () => {
    cropperRef.current?.cropper.zoom(-0.1);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.95)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--size-3)',
          background: 'rgba(0, 0, 0, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h2
          style={{
            margin: 0,
            color: 'white',
            fontSize: 'var(--font-size-3)',
            fontWeight: 'var(--font-weight-6)',
          }}
        >
          Crop Image
        </h2>
        <IconButton onClick={onCancel} title="Cancel" size="small">
          <X size={20} color="white" />
        </IconButton>
      </div>

      {/* Cropper Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--size-4)',
          overflow: 'hidden',
        }}
      >
        <Cropper
          ref={cropperRef}
          src={image}
          style={{
            height: '100%',
            width: '100%',
            maxHeight: 'calc(100vh - 300px)',
          }}
          aspectRatio={aspectRatio}
          guides={true}
          viewMode={1}
          dragMode="move"
          cropBoxMovable={true}
          cropBoxResizable={true}
          toggleDragModeOnDblclick={false}
          background={false}
          responsive={true}
          autoCropArea={0.8}
          checkOrientation={false}
          zoomOnWheel={true}
          wheelZoomRatio={0.1}
        />
      </div>

      {/* Controls */}
      <div
        style={{
          padding: 'var(--size-4)',
          background: 'rgba(0, 0, 0, 0.8)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Tool Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--size-2)',
            justifyContent: 'center',
            marginBottom: 'var(--size-4)',
            flexWrap: 'wrap',
          }}
        >
          <IconButton
            onClick={handleZoomIn}
            title="Zoom In"
            size="small"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <ZoomIn size={18} color="white" />
          </IconButton>
          <IconButton
            onClick={handleZoomOut}
            title="Zoom Out"
            size="small"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <ZoomOut size={18} color="white" />
          </IconButton>
          <IconButton
            onClick={handleRotateLeft}
            title="Rotate Left 90°"
            size="small"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <RotateCcw size={18} color="white" />
          </IconButton>
          <IconButton
            onClick={handleRotateRight}
            title="Rotate Right 90°"
            size="small"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <RotateCw size={18} color="white" />
          </IconButton>
          <IconButton
            onClick={handleFlipHorizontal}
            title="Flip Horizontal"
            size="small"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <FlipHorizontal size={18} color="white" />
          </IconButton>
          <IconButton
            onClick={handleFlipVertical}
            title="Flip Vertical"
            size="small"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            <FlipVertical size={18} color="white" />
          </IconButton>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--size-2)',
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleCropConfirm}
            disabled={isProcessing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--size-1)',
            }}
          >
            <Check size={16} />
            {isProcessing ? 'Processing...' : 'Apply Crop'}
          </Button>
        </div>
      </div>
    </div>
  );
}
