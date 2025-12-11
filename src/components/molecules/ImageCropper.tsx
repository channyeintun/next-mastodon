'use client';

import styled from '@emotion/styled';
import { useState, useRef } from 'react';
import { Cropper, ReactCropperElement } from 'react-cropper';
import 'react-cropper/node_modules/cropperjs/dist/cropper.min.css';
import { X, Check, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../atoms/Button';
import { IconButton } from '../atoms/IconButton';

// Styled components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  z-index: 1000;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--size-3);
  background: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h2`
  margin: 0;
  color: white;
  font-size: var(--font-size-3);
  font-weight: var(--font-weight-6);
`;

const CropperContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--size-4);
  overflow: hidden;
`;

const Controls = styled.div`
  padding: var(--size-4);
  background: rgba(0, 0, 0, 0.8);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const ToolButtons = styled.div`
  display: flex;
  gap: var(--size-2);
  justify-content: center;
  margin-bottom: var(--size-4);
  flex-wrap: wrap;
`;

const ToolButton = styled(IconButton)`
  background: rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--size-2);
  justify-content: flex-end;
`;

const ApplyButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: var(--size-1);
`;

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
    <Overlay>
      {/* Header */}
      <Header>
        <Title>Crop Image</Title>
        <IconButton onClick={onCancel} title="Cancel" size="small">
          <X size={20} color="white" />
        </IconButton>
      </Header>

      {/* Cropper Area */}
      <CropperContainer>
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
      </CropperContainer>

      {/* Controls */}
      <Controls>
        {/* Tool Buttons */}
        <ToolButtons>
          <ToolButton onClick={handleZoomIn} title="Zoom In" size="small">
            <ZoomIn size={18} color="white" />
          </ToolButton>
          <ToolButton onClick={handleZoomOut} title="Zoom Out" size="small">
            <ZoomOut size={18} color="white" />
          </ToolButton>
          <ToolButton onClick={handleRotateLeft} title="Rotate Left 90°" size="small">
            <RotateCcw size={18} color="white" />
          </ToolButton>
          <ToolButton onClick={handleRotateRight} title="Rotate Right 90°" size="small">
            <RotateCw size={18} color="white" />
          </ToolButton>
          <ToolButton onClick={handleFlipHorizontal} title="Flip Horizontal" size="small">
            <FlipHorizontal size={18} color="white" />
          </ToolButton>
          <ToolButton onClick={handleFlipVertical} title="Flip Vertical" size="small">
            <FlipVertical size={18} color="white" />
          </ToolButton>
        </ToolButtons>

        {/* Action Buttons */}
        <ActionButtons>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <ApplyButton onClick={handleCropConfirm} disabled={isProcessing}>
            <Check size={16} />
            {isProcessing ? 'Processing...' : 'Apply Crop'}
          </ApplyButton>
        </ActionButtons>
      </Controls>
    </Overlay>
  );
}
