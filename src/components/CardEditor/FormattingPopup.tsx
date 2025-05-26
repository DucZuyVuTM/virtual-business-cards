import React from 'react';

interface FormattingPopupProps {
  position: { x: number; y: number };
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onFontSizeChange: (size: string) => void;
  onFontFamilyChange: (font: string) => void;
  onRemoveFormatting: () => void;
  visible: boolean;
}

const FormattingPopup: React.FC<FormattingPopupProps> = ({
  position,
  onBold,
  onItalic,
  onUnderline,
  onFontSizeChange,
  onFontFamilyChange,
  onRemoveFormatting,
  visible
}) => {
  const popupStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${position.y}px`,
    left: `${position.x}px`,
    background: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '4px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    zIndex: 1000,
    display: visible ? 'flex' : 'none',
    gap: '4px',
    alignItems: 'center',
    flexWrap: 'wrap', // Cho phép các phần tử xuống dòng khi cần
    maxWidth: '300px', // Giới hạn chiều rộng tối đa để tránh tràn quá mức
    justifyContent: 'flex-start',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '2px 6px',
    background: '#f0f0f0',
    border: '1px solid #ddd',
    borderRadius: '3px',
    cursor: 'pointer',
    margin: '2px 0', // Thêm margin để tránh dính nhau khi xuống dòng
  };

  return (
    <div 
      className="formatting-popup"
      style={popupStyle}
      onMouseUp={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button 
        onClick={onBold} 
        style={{ ...buttonStyle, fontWeight: 'bold' }}
        title="Bold"
      >
        B
      </button>
      
      <button 
        onClick={onItalic} 
        style={{ ...buttonStyle, fontStyle: 'italic' }}
        title="Italic"
      >
        I
      </button>
      
      <button 
        onClick={onUnderline} 
        style={{ ...buttonStyle, textDecoration: 'underline' }}
        title="Underline"
      >
        U
      </button>
      
      <select 
        onChange={(e) => onFontSizeChange(e.target.value)}
        defaultValue="18"
        style={{ ...buttonStyle, padding: '1px 4px' }}
        title="Font Size"
      >
        <option value="10">10px</option>
        <option value="12">12px</option>
        <option value="14">14px</option>
        <option value="16">16px</option>
        <option value="18">18px</option>
        <option value="20">20px</option>
        <option value="22">22px</option>
        <option value="24">24px</option>
        <option value="26">26px</option>
      </select>
      
      <select 
        onChange={(e) => onFontFamilyChange(e.target.value)} 
        style={{ ...buttonStyle, padding: '1px 4px' }}
        title="Font Family"
      >
        <option value="Open Sans">Open Sans</option>
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Georgia">Georgia</option>
      </select>
      
      <button 
        onClick={onRemoveFormatting} 
        style={{ ...buttonStyle }}
        title="Remove Formatting"
      >
        <span role="img" aria-label="Remove Formatting">Aa</span>
      </button>
    </div>
  );
};

export default FormattingPopup;