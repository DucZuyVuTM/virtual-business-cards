import { useState, useCallback } from 'react';

export const useDrag = (cardRef: React.RefObject<HTMLDivElement>) => {
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [touchOffset, setTouchOffset] = useState<{ offsetX: number; offsetY: number } | null>(null);

  const handleDragStart = (e: React.DragEvent, field: string) => {
    setIsDragging(field);
    e.dataTransfer.setData('text/plain', field);
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setData('offsetX', offsetX.toString());
    e.dataTransfer.setData('offsetY', offsetY.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, updatePosition: (field: string, x: number, y: number) => void) => {
    e.preventDefault();
    const field = e.dataTransfer.getData('text/plain');
    const offsetX = parseFloat(e.dataTransfer.getData('offsetX'));
    const offsetY = parseFloat(e.dataTransfer.getData('offsetY'));

    if (cardRef.current && isDragging) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left - offsetX, rect.width - 100));
      const y = Math.max(0, Math.min(e.clientY - rect.top - offsetY, rect.height - 20));
      updatePosition(field, x, y);
      setIsDragging(null);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, field: string) => {
    e.preventDefault();
    setIsDragging(field);
    const touch = e.touches[0];
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    setTouchOffset({ offsetX, offsetY });
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent, updatePosition: (field: string, x: number, y: number) => void) => {
      if (isDragging && cardRef.current && touchOffset) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = cardRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(touch.clientX - rect.left - touchOffset.offsetX, rect.width - 100));
        const y = Math.max(0, Math.min(touch.clientY - rect.top - touchOffset.offsetY, rect.height - 20));
        updatePosition(isDragging, x, y);
      }
    },
    [isDragging, cardRef, touchOffset]
  );

  const handleTouchEnd = () => {
    setIsDragging(null);
    setTouchOffset(null);
  };

  return {
    isDragging,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};