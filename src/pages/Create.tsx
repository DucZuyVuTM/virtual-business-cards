import React, { useState, useRef, useEffect } from 'react';
import { CardData } from '../types/cardData';
import { defaultData } from '../types/defaultData';
import { useDrag } from '../hooks/useDrag';
import { useTextFormatting } from '../hooks/useTextFormatting';
import { useImageHandler } from '../hooks/useImageHandler';
import { useCardCapture } from '../hooks/useCardCapture';
import FormattingPopup from '../components/CardEditor/FormattingPopup';
import EditableField from '../components/CardEditor/EditableField';

const Create = () => {
  const [cardData, setCardData] = useState<CardData>(defaultData);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [textColor, setTextColor] = useState<'white' | 'black'>('white');
  const [dashEnable, setDashEnable] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);
  const group1Ref = useRef<HTMLDivElement>(null);
  const group2Ref = useRef<HTMLDivElement>(null);
  const group3Ref = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  const handleInput = (field: keyof CardData, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
  };

  const { handleDragStart, handleDragOver, handleDrop, handleTouchStart, handleTouchMove, handleTouchEnd } = useDrag(cardRef);
  const { backgroundImage, logoImage, showImageUrlPopup, logoUrlInput, backgroundUrlInput, loading, setShowImageUrlPopup, setLogoUrlInput, setBackgroundUrlInput, handleImageUrlSubmit, setLogoImage, setLoading } = useImageHandler();
  const { showPopup, popupPosition, handleTextSelect, applyBold, applyItalic, applyUnderline, setFontSize, setFontFamily, removeFormatting } = useTextFormatting(handleInput);
  const { handleSave } = useCardCapture(cardRef, group1Ref, group2Ref, group3Ref, cardData, backgroundImage, logoImage, setDashEnable, setLoading);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Open+Sans&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    initializeCardPositions();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node) && !(e.target as HTMLElement)?.closest('.formatting-popup')) {
        window.getSelection()?.removeAllRanges();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
      document.head.removeChild(link);
    };
  }, []);

  const updatePosition = (field: string, x: number, y: number) => {
    setCardData((prev) => ({
      ...prev,
      positions: {
        ...prev.positions,
        [field]: { x, y },
      },
    }));
  };

  const initializeCardPositions = () => {
    resetPositions();
  };

  const handleResetInfo = () => {
    setCardData((prev) => ({
      ...prev,
      name: defaultData.name,
      title: defaultData.title,
      organization: defaultData.organization,
      location: defaultData.location,
      phone: defaultData.phone,
      email: defaultData.email,
      website: defaultData.website,
    }));
  };

  const resetPositions = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const symmetryAxisX = rect.width * 3 / 4;
      const logoX = rect.width / 4;
      const logoY = rect.height / 2;
      const spacing = isMobile ? 20 : 0;

      const group1Height = group1Ref.current?.getBoundingClientRect().height || 0;
      const group2Height = group2Ref.current?.getBoundingClientRect().height || 0;
      const group3Height = group3Ref.current?.getBoundingClientRect().height || 0;
      const group1Width = group1Ref.current?.getBoundingClientRect().width || 0;
      const group2Width = group2Ref.current?.getBoundingClientRect().width || 0;
      const group3Width = group3Ref.current?.getBoundingClientRect().width || 0;
      const logoHeight = logoRef.current?.getBoundingClientRect().height || 0;
      const logoWidth = logoRef.current?.getBoundingClientRect().width || 0;

      const group1X = symmetryAxisX - group1Width / 2;
      const group2X = symmetryAxisX - group2Width / 2;
      const group3X = symmetryAxisX - group3Width / 2;
      const adjustedLogoX = logoX - logoWidth / 2;
      const adjustedLogoY = logoY - logoHeight / 2;

      setCardData((prev) => ({
        ...prev,
        positions: {
          group1: { x: group1X, y: rect.height / 4 - group1Height / 2 - spacing },
          group2: { x: group2X, y: rect.height / 2 - group2Height / 2 },
          group3: { x: group3X, y: (rect.height * 3) / 4 - group3Height / 2 + spacing },
          logo: { x: adjustedLogoX, y: adjustedLogoY },
        },
      }));
    }
  };

  const toggleTextColor = () => {
    setTextColor((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  const dragHandleStyle: React.CSSProperties = {
    position: 'absolute',
    padding: '4px',
    border: dashEnable ? `4px dashed ${textColor === 'white' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}` : 'none',
    cursor: 'move',
    borderRadius: '4px',
    maxWidth: '5000px',
    maxHeight: '5000px',
    touchAction: 'none',
  };

  const dragHandleHoverStyle: React.CSSProperties = {
    border: dashEnable ? `4px dashed ${textColor === 'white' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'}` : 'none',
    maxWidth: '5000px',
    maxHeight: '5000px',
  };

  const textElementStyle: React.CSSProperties = {
    margin: 0,
    padding: '1px',
    cursor: 'text',
    fontSize: isMobile ? '0.875rem' : '1.125rem',
    userSelect: 'text',
    fontFamily: 'Open Sans, sans-serif',
  };

  const logoStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${cardData.positions.logo.x}px`,
    top: `${cardData.positions.logo.y}px`,
    cursor: 'move',
    width: isMobile ? '100px' : '200px',
    height: isMobile ? '100px' : '200px',
    maxWidth: '5000px',
    maxHeight: '5000px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    touchAction: 'none',
  };

  return (
    <main className="container mx-auto p-4 flex-grow">
      <h2 className="text-2xl font-bold mb-6 text-center">Customize your business card</h2>
      <div
        ref={cardRef}
        className="relative flex justify-center"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, updatePosition)}
        onMouseUp={handleTextSelect}
        onTouchMove={(e) => handleTouchMove(e, updatePosition)}
        style={{
          background: backgroundImage ? `url(${backgroundImage}) no-repeat center/cover` : 'linear-gradient(to bottom, #1e3c72, #2a5298)',
          aspectRatio: '7 / 4',
          maxWidth: '608px',
          maxHeight: '348px',
          margin: '0 auto',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative',
          touchAction: 'none',
        }}
      >
        {!backgroundImage && (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'10\' cy=\'20\' r=\'1\' fill=\'white\'/%3E%3Ccircle cx=\'30\' cy=\'50\' r=\'1\' fill=\'white\'/%3E%3Ccircle cx=\'70\' cy=\'80\' r=\'1\' fill=\'white\'/%3E%3C/svg\')",
              opacity: 0.2,
            }}
          />
        )}
        {loading.background && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <span className="text-white">Loading background...</span>
          </div>
        )}
        <div className="flex w-full h-full p-4">
          <div className={`w-2/3 text-${textColor} p-4`}>
            {/* Group 1: name and title */}
            <div
              ref={group1Ref}
              key="group1"
              draggable
              onDragStart={(e) => handleDragStart(e, 'group1')}
              onTouchStart={(e) => handleTouchStart(e, 'group1')}
              style={{
                ...dragHandleStyle,
                left: `${cardData.positions.group1.x}px`,
                top: `${cardData.positions.group1.y}px`,
              }}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, dragHandleHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, dragHandleStyle)}
            >
              <EditableField
                field="name"
                value={cardData.name}
                onChange={handleInput}
                style={textElementStyle}
                className={`font-bold ${cardData.name === '' ? 'empty:before:content-["Enter_name"] empty:before:text-gray-300' : ''}`}
              />
              <EditableField
                field="title"
                value={cardData.title}
                onChange={handleInput}
                style={textElementStyle}
                className={`${cardData.title === '' ? 'empty:before:content-["Enter_title"] empty:before:text-gray-300' : ''}`}
              />
            </div>

            {/* Group 2: organization, location, phone */}
            <div
              ref={group2Ref}
              key="group2"
              draggable
              onDragStart={(e) => handleDragStart(e, 'group2')}
              onTouchStart={(e) => handleTouchStart(e, 'group2')}
              style={{
                ...dragHandleStyle,
                left: `${cardData.positions.group2.x}px`,
                top: `${cardData.positions.group2.y}px`,
              }}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, dragHandleHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, dragHandleStyle)}
            >
              <EditableField
                field="organization"
                value={cardData.organization}
                onChange={handleInput}
                style={textElementStyle}
                className={`${cardData.organization === '' ? 'empty:before:content-["Enter_organization"] empty:before:text-gray-300' : ''}`}
              />
              <EditableField
                field="location"
                value={cardData.location}
                onChange={handleInput}
                style={textElementStyle}
                className={`${cardData.location === '' ? 'empty:before:content-["Enter_location"] empty:before:text-gray-300' : ''}`}
              />
              <EditableField
                field="phone"
                value={cardData.phone}
                onChange={handleInput}
                style={textElementStyle}
                className={`${cardData.phone === '' ? 'empty:before:content-["Enter_phone"] empty:before:text-gray-300' : ''}`}
              />
            </div>

            {/* Group 3: email and website */}
            <div
              ref={group3Ref}
              key="group3"
              draggable
              onDragStart={(e) => handleDragStart(e, 'group3')}
              onTouchStart={(e) => handleTouchStart(e, 'group3')}
              style={{
                ...dragHandleStyle,
                left: `${cardData.positions.group3.x}px`,
                top: `${cardData.positions.group3.y}px`,
              }}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, dragHandleHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, dragHandleStyle)}
            >
              <EditableField
                field="email"
                value={cardData.email}
                onChange={handleInput}
                style={textElementStyle}
                className={`${cardData.email === '' ? 'empty:before:content-["Enter_email"] empty:before:text-gray-300' : ''}`}
              />
              <EditableField
                field="website"
                value={cardData.website}
                onChange={handleInput}
                style={textElementStyle}
                className={`${cardData.website === '' ? 'empty:before:content-["Enter_website"] empty:before:text-gray-300' : ''}`}
              />
            </div>

            {/* Logo */}
            <div
              ref={logoRef}
              key="logo"
              draggable
              onDragStart={(e) => handleDragStart(e, 'logo')}
              onTouchStart={(e) => handleTouchStart(e, 'logo')}
              style={logoStyle}
              className="outline-none focus:ring-2 focus:ring-blue-500 rounded"
              onTouchEnd={handleTouchEnd}
              onClick={() => setShowImageUrlPopup(true)}
            >
              <div className={`cursor-pointer flex flex-col items-center ${logoImage ? '' : `text-${textColor}`}`}>
                {loading.logo ? (
                  <span className="text-white">Loading logo...</span>
                ) : logoImage ? (
                  <img
                    src={logoImage}
                    alt="Logo"
                    style={{ width: isMobile ? '100px' : '200px', height: isMobile ? '100px' : '200px', objectFit: 'contain' }}
                    onError={() => setLogoImage(null)}
                  />
                ) : (
                  <>
                    <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Click to add logo URL</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} justify-center gap-4 mt-4`}>
        <div className={`flex gap-4 ${isMobile ? 'm-auto' : ''}`}>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={() => setShowImageUrlPopup(true)}>
            Add Image URLs
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={handleSave}>
            Save
          </button>
        </div>
        <div className={`flex gap-4 ${isMobile ? 'm-auto' : ''}`}>
          <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition" onClick={handleResetInfo}>
            Reset Info
          </button>
          <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition" onClick={resetPositions}>
            Reset position
          </button>
        </div>
        <div className={`flex gap-4 ${isMobile ? 'm-auto' : ''}`}>
          <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition" onClick={toggleTextColor}>
            Change text color
          </button>
        </div>
      </div>

      {showImageUrlPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowImageUrlPopup(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Add Image URLs</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image URL</label>
              <input
                type="url"
                value={logoUrlInput}
                onChange={(e) => setLogoUrlInput(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Background Image URL</label>
              <input
                type="url"
                value={backgroundUrlInput}
                onChange={(e) => setBackgroundUrlInput(e.target.value)}
                placeholder="https://example.com/background.jpg"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition" onClick={() => setShowImageUrlPopup(false)}>
                Cancel
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={handleImageUrlSubmit}>
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <FormattingPopup
        position={popupPosition}
        onBold={applyBold}
        onItalic={applyItalic}
        onUnderline={applyUnderline}
        onFontSizeChange={setFontSize}
        onFontFamilyChange={setFontFamily}
        onRemoveFormatting={removeFormatting}
        visible={showPopup}
      />
    </main>
  );
};

export default Create;