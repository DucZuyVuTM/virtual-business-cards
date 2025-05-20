import React, { useState, useRef, useEffect } from 'react';
import { CardData } from '../types/cardData';

interface EditableFieldProps {
  field: keyof CardData;
  value: string;
  onChange: (field: keyof CardData, value: string) => void;
  style: React.CSSProperties;
  className?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({ field, value, onChange, style, className }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const isInitialRender = useRef(true);

  // Khởi tạo nội dung ban đầu khi component mount
  useEffect(() => {
    if (ref.current && isInitialRender.current) {
      ref.current.innerHTML = value || '';
      isInitialRender.current = false;
    }
  }, []); // Chỉ chạy một lần khi mount

  // Cập nhật nội dung khi value thay đổi từ bên ngoài (ví dụ: reset)
  useEffect(() => {
    if (ref.current && !isInitialRender.current && document.activeElement !== ref.current) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  // Focus vào phần tử khi nhấp
  const handleClick = () => {
    if (ref.current) {
      ref.current.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount === 0) {
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        range.collapse(false); // Đặt con trỏ ở cuối
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const handleInput = () => {
    if (!ref.current) return;

    const selection = window.getSelection();
    let position = 0;

    // Lưu vị trí con trỏ
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(ref.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      position = preCaretRange.toString().length;
      setCursorPosition(position);
    }

    // Cập nhật nội dung, bao gồm cả định dạng
    const newValue = ref.current.innerHTML;
    onChange(field, newValue);
  };

  // Khôi phục vị trí con trỏ sau khi re-render
  useEffect(() => {
    if (ref.current && cursorPosition !== null) {
      const selection = window.getSelection();
      if (!selection) return;

      let currentOffset = 0;
      let targetNode: Node | null = null;
      let targetOffset = 0;

      // Duyệt qua các nút văn bản để tìm vị trí chính xác
      const walker = document.createTreeWalker(ref.current, NodeFilter.SHOW_TEXT, null);
      let node: Node | null = walker.nextNode();

      while (node) {
        const nodeLength = node.textContent?.length || 0;
        if (currentOffset + nodeLength >= cursorPosition) {
          targetNode = node;
          targetOffset = cursorPosition - currentOffset;
          break;
        }
        currentOffset += nodeLength;
        node = walker.nextNode();
      }

      // Nếu không tìm thấy nút phù hợp, đặt con trỏ ở cuối
      if (!targetNode) {
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        const range = document.createRange();
        range.setStart(targetNode, Math.min(targetOffset, targetNode.textContent?.length || 0));
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [cursorPosition]);

  return (
    <p
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onClick={handleClick}
      style={style}
      className={className}
      data-field={field}
    />
  );
};

export default EditableField;