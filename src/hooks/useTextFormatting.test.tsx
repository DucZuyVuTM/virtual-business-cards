import { renderHook, act } from '@testing-library/react';
import { useTextFormatting } from './useTextFormatting';

describe('useTextFormatting Hook', () => {
  let mockHandleInput: jest.Mock;

  beforeEach(() => {
    mockHandleInput = jest.fn();
    // Thiết lập DOM giả lập
    document.body.innerHTML = '<p data-field="name">John Doe</p>';

    // Thêm getBoundingClientRect vào Range.prototype nếu nó không tồn tại
    if (!Range.prototype.hasOwnProperty('getBoundingClientRect')) {
      Range.prototype.getBoundingClientRect = jest.fn(() => ({
        left: 100,
        top: 200,
        height: 20,
        width: 100,
        right: 200,
        bottom: 220,
        x: 100,
        y: 200,
        toJSON: () => ({}),
      }));
    }

    // Mock Range.prototype.getBoundingClientRect
    const mockRect = {
      left: 100,
      top: 200,
      height: 20,
      width: 100,
      right: 200,
      bottom: 220,
      x: 100,
      y: 200,
      toJSON: () => ({}),
    };
    jest.spyOn(Range.prototype, 'getBoundingClientRect').mockImplementation(() => mockRect);

    // Mock window.innerWidth và window.scrollX/Y
    Object.defineProperty(window, 'innerWidth', { value: 1000, writable: true });
    Object.defineProperty(window, 'scrollX', { value: 0, writable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
  });

  afterEach(() => {
    // Dọn dẹp mock sau mỗi bài kiểm tra
    jest.restoreAllMocks();
    // Xóa phương thức nếu đã thêm vào Range.prototype
    if (Range.prototype.hasOwnProperty('getBoundingClientRect')) {
      delete (Range.prototype as any).getBoundingClientRect;
    }
  });

  it('applies bold formatting to selected text', () => {
    const { result } = renderHook(() => useTextFormatting(mockHandleInput));

    // Giả lập việc chọn văn bản
    const textNode = document.querySelector('p')?.firstChild;
    const range = document.createRange();
    range.selectNodeContents(textNode!);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    // Gọi handleTextSelect để thiết lập selectedText và popup
    act(() => {
      result.current.handleTextSelect({
        target: document.querySelector('p'),
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent);
    });

    // Kiểm tra rằng showPopup được đặt thành true
    expect(result.current.showPopup).toBe(true);

    // Kiểm tra vị trí popup (dựa trên mockRect)
    expect(result.current.popupPosition).toEqual({ x: 100, y: 220 });

    // Áp dụng định dạng bold
    act(() => {
      result.current.applyBold();
    });

    // Kiểm tra rằng handleInput được gọi với nội dung mới
    expect(mockHandleInput).toHaveBeenCalledWith('name', '<span style="font-weight: bold;">John Doe</span>');

    // Kiểm tra rằng showPopup được đặt lại thành false
    expect(result.current.showPopup).toBe(false);
  });
});