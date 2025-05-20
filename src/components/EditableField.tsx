import React, { useState, useRef, useEffect } from 'react';
import { CardData } from '../types/cardData';

interface EditableFieldProps {
  field: keyof CardData;
  value: string;
  onChange: (field: keyof CardData, value: string) => void;
  style: React.CSSProperties;
  className?: string;
}

interface CursorPosition {
  node: Node | null;
  offset: number;
}

const EditableField: React.FC<EditableFieldProps> = ({ field, value, onChange, style, className }) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition | null>(null);
  const [shouldRestoreCursor, setShouldRestoreCursor] = useState(false);
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
      setShouldRestoreCursor(true); // Yêu cầu khôi phục con trỏ sau khi value thay đổi
    }
  }, [value]);

  // Focus và lưu vị trí con trỏ khi nhấp
  const handleClick = (e: React.MouseEvent<HTMLParagraphElement>) => {
    if (!ref.current) return;

    ref.current.focus();
    const selection = window.getSelection();
    if (!selection) return;

    // Nếu là nhấp đúp (e.detail === 2), để trình duyệt xử lý hành vi bôi đen mặc định
    if (e.detail === 2) {
      // Không can thiệp vào vùng chọn, để trình duyệt bôi đen văn bản
      setTimeout(() => {
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          setCursorPosition({
            node: range.startContainer,
            offset: range.startOffset,
          });
          setShouldRestoreCursor(false);
        }
      }, 0); // setTimeout để đảm bảo selection được cập nhật sau nhấp đúp
      return;
    }

    // Xử lý nhấp đơn: đặt con trỏ tại vị trí nhấp chuột
    const range = document.caretRangeFromPoint(e.clientX, e.clientY);
    if (range) {
      selection.removeAllRanges();
      selection.addRange(range);

      // Lưu vị trí con trỏ
      const position: CursorPosition = {
        node: range.startContainer,
        offset: range.startOffset,
      };
      setCursorPosition(position);
      setShouldRestoreCursor(false); // Không cần khôi phục ngay sau khi nhấp
    } else if (selection.rangeCount === 0) {
      // Nếu không xác định được vị trí nhấp, đặt con trỏ ở cuối
      const fallbackRange = document.createRange();
      fallbackRange.selectNodeContents(ref.current);
      fallbackRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(fallbackRange);

      setCursorPosition({
        node: ref.current.lastChild || null,
        offset: ref.current.lastChild?.textContent?.length || 0,
      });
      setShouldRestoreCursor(false);
    }
  };

  const handleInput = () => {
    if (!ref.current) return;

    const selection = window.getSelection();
    let position: CursorPosition = { node: null, offset: 0 };

    // Lưu vị trí con trỏ sau khi nhập
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      position.node = range.endContainer;
      position.offset = range.endOffset;
      setCursorPosition(position);
      setShouldRestoreCursor(false); // Không khôi phục con trỏ khi đang nhập liệu
    }

    // Cập nhật nội dung, bao gồm cả định dạng
    const newValue = ref.current.innerHTML;
    onChange(field, newValue);
  };

  // Khôi phục vị trí con trỏ chỉ khi cần thiết
  useEffect(() => {
    if (ref.current && cursorPosition && shouldRestoreCursor) {
      const selection = window.getSelection();
      if (!selection) return;

      const { node, offset } = cursorPosition;

      // Kiểm tra xem node có còn tồn tại trong DOM không
      if (node && ref.current.contains(node)) {
        const range = document.createRange();
        const nodeLength = node.textContent?.length || 0;
        range.setStart(node, Math.min(offset, nodeLength));
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // Nếu node không tồn tại, đặt con trỏ ở cuối
        const range = document.createRange();
        range.selectNodeContents(ref.current);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      setShouldRestoreCursor(false); // Đặt lại trạng thái sau khi khôi phục
    }
  }, [cursorPosition, shouldRestoreCursor]);

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