import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import FormattingPopup from '../components/FormattingPopup';
import EditableField from '../components/EditableField';
import { CardData } from '../types/cardData';
import { v4 as uuidv4 } from 'uuid';

const BACKEND_URL = "https://virtual-business-cards-backend.onrender.com";

const Create = () => {
  const defaultData: CardData = {
    id: uuidv4(),
    name: 'John Doe',
    title: 'Position',
    organization: 'Organization',
    location: 'City, State',
    phone: '(123) 555-1234',
    email: 'john.doe@email.com',
    website: 'www.john-doe.com',
    positions: {
      group1: { x: 0, y: 0 },
      group2: { x: 0, y: 0 },
      group3: { x: 0, y: 0 },
      logo: { x: 0, y: 0 },
    },
    backgroundImage: null,
    logoImage: null,
  };

  const [cardData, setCardData] = useState<CardData>(defaultData);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState<Range | null>(null);
  const [textColor, setTextColor] = useState<'white' | 'black'>('white');
  const [touchOffset, setTouchOffset] = useState<{ offsetX: number; offsetY: number } | null>(null);
  const [showImageUrlPopup, setShowImageUrlPopup] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [backgroundUrlInput, setBackgroundUrlInput] = useState('');
  const [loading, setLoading] = useState<{ logo: boolean; background: boolean }>({ logo: false, background: false });
  const [dashEnable, setDashEnable] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);
  const group1Ref = useRef<HTMLDivElement>(null);
  const group2Ref = useRef<HTMLDivElement>(null);
  const group3Ref = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const initializeCardPositions = () => {
    resetPositions();
  };

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
      if (cardRef.current && !cardRef.current.contains(e.target as Node) && 
          !(e.target as HTMLElement)?.closest('.formatting-popup')) {
        setShowPopup(false);
        setSelectedText(null);
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

  const handleInput = (field: keyof CardData, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const field = e.dataTransfer.getData('text/plain');
    const offsetX = parseFloat(e.dataTransfer.getData('offsetX'));
    const offsetY = parseFloat(e.dataTransfer.getData('offsetY'));
    
    if (cardRef.current && isDragging) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left - offsetX, rect.width - 100));
      const y = Math.max(0, Math.min(e.clientY - rect.top - offsetY, rect.height - 20));
      
      setCardData((prev) => ({
        ...prev,
        positions: {
          ...prev.positions,
          [field]: { x, y },
        },
      }));
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

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDragging && cardRef.current && touchOffset) {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = cardRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(touch.clientX - rect.left - touchOffset.offsetX, rect.width - 100));
      const y = Math.max(0, Math.min(touch.clientY - rect.top - touchOffset.offsetY, rect.height - 20));

      setCardData((prev) => ({
        ...prev,
        positions: {
          ...prev.positions,
          [isDragging]: { x, y },
        },
      }));
    }
  }, [isDragging, cardRef, touchOffset]);

  const handleTouchEnd = () => {
    setIsDragging(null);
    setTouchOffset(null);
  };

  // Hàm tải hình ảnh với retry và timeout
  const loadImage = (url: string, maxRetries = 3, retryDelay = 2000): Promise<void> => {
    return new Promise((resolve, reject) => {
      let retries = 0;
      const attemptLoad = () => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;

        const timeout = setTimeout(() => {
          if (retries < maxRetries) {
            retries++;
            setTimeout(attemptLoad, retryDelay);
          } else {
            reject(new Error(`Timeout loading image: ${url}`));
          }
        }, 10000); // Timeout 10 giây

        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          if (retries < maxRetries) {
            retries++;
            setTimeout(attemptLoad, retryDelay);
          } else {
            reject(new Error(`Failed to load image after ${maxRetries} retries: ${url}`));
          }
        };
      };
      attemptLoad();
    });
  };

  const handleSave = async () => {
    if (cardRef.current) {
      const groupElements = [group1Ref, group2Ref, group3Ref];
      groupElements.forEach((ref) => {
        if (ref.current) {
          setDashEnable(false);
        }
      });

      try {
        // Chờ tất cả hình ảnh tải xong
        const imagePromises: Promise<void>[] = [];
        if (backgroundImage) {
          imagePromises.push(loadImage(backgroundImage));
        }
        if (logoImage) {
          imagePromises.push(loadImage(logoImage));
        }

        await Promise.all(imagePromises);

        // Sau khi hình ảnh đã tải xong, gọi html2canvas
        const canvas = await html2canvas(cardRef.current, {
          scale: window.devicePixelRatio,
          useCORS: true,
          backgroundColor: null,
        });

        groupElements.forEach((ref) => {
          if (ref.current) {
            setDashEnable(true);
          }
        });

        // Chuyển canvas thành base64
        const imageData = canvas.toDataURL('image/png');

        // Lưu imageData vào Neon
        const newCardId = uuidv4();
        const saveImageResponse = await fetch(`${BACKEND_URL}/api/save-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: newCardId, imageData }),
        });
        const saveImageResult = await saveImageResponse.json();
        if (!saveImageResponse.ok) {
          throw new Error(saveImageResult.error || 'Failed to save image to Neon');
        }

        // Chuẩn bị dữ liệu card để lưu vào localStorage (ngoại trừ imageData)
        const newCard: CardData = {
          ...cardData,
          id: newCardId,
          backgroundImage: backgroundImage,
          logoImage: logoImage,
          imageData: undefined, // Không lưu imageData vào localStorage
        };

        // Lưu card vào localStorage với key 'savedCards'
        const storedCards = JSON.parse(localStorage.getItem('savedCards') || '{"cards": []}');
        storedCards.cards = storedCards.cards || [];
        storedCards.cards.push(newCard);
        localStorage.setItem('savedCards', JSON.stringify(storedCards));

        navigate('/profile');
      } catch (error) {
        console.error('Error during save:', error);
        groupElements.forEach((ref) => {
          if (ref.current) {
            setDashEnable(true);
          }
        });
        alert(`Failed to save card. ${error}. Please check image URLs or try again.`);
      } finally {
        setLoading({ logo: false, background: false });
      }
    }
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

  const handleTextSelect = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.formatting-popup')) {
      return;
    }

    const selection = window.getSelection();
    if (selection && selection.toString().length > 0 && cardRef.current) {
      const range = selection.getRangeAt(0);
      const commonAncestor = range.commonAncestorContainer;
      const isWithinCard = cardRef.current.contains(commonAncestor as Node);

      if (isWithinCard && selection.toString().trim().length > 0) {
        const rect = range.getBoundingClientRect();
        const popupWidth = 300;
        const windowWidth = window.innerWidth;
        
        let x = rect.left + window.scrollX;
        if (x + popupWidth > windowWidth + window.scrollX) {
          x = windowWidth + window.scrollX - popupWidth - 10;
        }
        if (x < window.scrollX) {
          x = window.scrollX + 10;
        }

        const y = rect.top + window.scrollY + rect.height;

        setPopupPosition({ x, y });
        setSelectedText(range);
        setShowPopup(true);
      } else {
        setShowPopup(false);
        setSelectedText(null);
        selection?.removeAllRanges();
      }
    } else {
      setShowPopup(false);
      setSelectedText(null);
      selection?.removeAllRanges();
    }
  };

  const applyFormatting = (style: Partial<CSSStyleDeclaration>) => {
    if (selectedText) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(selectedText);

      const range = selectedText;
      const commonAncestor = range.commonAncestorContainer;
      let targetElement: HTMLElement | null = null;

      if (commonAncestor.nodeType === Node.TEXT_NODE) {
        targetElement = commonAncestor.parentElement;
      } else if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
        targetElement = commonAncestor as HTMLElement;
      }

      if (targetElement && targetElement.tagName.toLowerCase() === 'span') {
        Object.assign(targetElement.style, style);
      } else {
        const span = document.createElement('span');
        range.surroundContents(span);
        Object.assign(span.style, style);
      }

      const parentP = targetElement?.closest('p');
      if (parentP) {
        const field = parentP.getAttribute('data-field') as keyof CardData;
        if (field) {
          handleInput(field, parentP.innerHTML);
        }
      }

      setShowPopup(false);
      setSelectedText(null);
      selection?.removeAllRanges();
    }
  };

  const removeFormatting = () => {
    if (!selectedText) return;

    const selection = window.getSelection();
    if (!selection) return;

    selection.removeAllRanges();
    selection.addRange(selectedText);

    const range = selectedText;
    const commonAncestor = range.commonAncestorContainer;

    const parentP = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
      ? (range.commonAncestorContainer as HTMLElement).closest('p')
      : range.commonAncestorContainer.parentElement?.closest('p');
    if (!parentP) return;

    let currentNode: Node | null = range.startContainer;
    let targetSpan: HTMLElement | null = null;

    while (currentNode && currentNode !== parentP) {
      if (currentNode.nodeType === Node.ELEMENT_NODE && (currentNode as HTMLElement).tagName.toLowerCase() === 'span') {
        targetSpan = currentNode as HTMLElement;
        break;
      }
      currentNode = currentNode.parentNode;
    }

    if (targetSpan && range.intersectsNode(targetSpan)) {
      const rangeInSpan = document.createRange();
      rangeInSpan.selectNodeContents(targetSpan);
      const intersection = document.createRange();
      intersection.setStart(range.startContainer, range.startOffset);
      intersection.setEnd(range.endContainer, range.endOffset);

      if (rangeInSpan.compareBoundaryPoints(Range.START_TO_START, intersection) <= 0 &&
          rangeInSpan.compareBoundaryPoints(Range.END_TO_END, intersection) >= 0) {
        const fragment = intersection.extractContents();
        const textContent = fragment.textContent || '';
        const textNode = document.createTextNode(textContent);

        intersection.insertNode(textNode);
        if (targetSpan.childNodes.length === 0) {
          targetSpan.parentNode?.removeChild(targetSpan);
        } else {
          const remainingContent = rangeInSpan.cloneContents();
          if (remainingContent.textContent && remainingContent.textContent.trim().length > 0) {
            targetSpan.parentNode?.replaceChild(remainingContent, targetSpan);
          }
        }
      }
    }

    const field = parentP.getAttribute('data-field') as keyof CardData;
    if (field) {
      handleInput(field, parentP.innerHTML);
    }

    setShowPopup(false);
    setSelectedText(null);
    selection.removeAllRanges();
  };

  const applyBold = () => {
    if (selectedText) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(selectedText);

      const range = selectedText;
      const startContainer = range.startContainer;
      let parentElement: HTMLElement | null = null;

      if (startContainer.nodeType === Node.TEXT_NODE) {
        parentElement = startContainer.parentElement;
      } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
        parentElement = startContainer as HTMLElement;
      }

      const computedStyle = parentElement ? window.getComputedStyle(parentElement) : null;
      const currentFontWeight = computedStyle?.fontWeight;
      const newFontWeight = currentFontWeight === '700' || currentFontWeight === 'bold' ? 'normal' : 'bold';

      applyFormatting({ fontWeight: newFontWeight });
    }
  };

  const applyItalic = () => {
    if (selectedText) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(selectedText);

      const range = selectedText;
      const startContainer = range.startContainer;
      let parentElement: HTMLElement | null = null;

      if (startContainer.nodeType === Node.TEXT_NODE) {
        parentElement = startContainer.parentElement;
      } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
        parentElement = startContainer as HTMLElement;
      }

      const computedStyle = parentElement ? window.getComputedStyle(parentElement) : null;
      const currentFontStyle = computedStyle?.fontStyle;
      const newFontStyle = currentFontStyle === 'italic' ? 'normal' : 'italic';

      applyFormatting({ fontStyle: newFontStyle });
    }
  };

  const applyUnderline = () => {
    if (selectedText) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(selectedText);

      const range = selectedText;
      const startContainer = range.startContainer;
      let parentElement: HTMLElement | null = null;

      if (startContainer.nodeType === Node.TEXT_NODE) {
        parentElement = startContainer.parentElement;
      } else if (startContainer.nodeType === Node.ELEMENT_NODE) {
        parentElement = startContainer as HTMLElement;
      }

      const computedStyle = parentElement ? window.getComputedStyle(parentElement) : null;
      const currentTextDecoration = computedStyle?.textDecorationLine || computedStyle?.textDecoration;
      const newTextDecoration = currentTextDecoration?.includes('underline') ? 'none' : 'underline';

      applyFormatting({ textDecoration: newTextDecoration });
    }
  };

  const setFontSize = (size: string) => {
    applyFormatting({ fontSize: `${size}px` });
  };

  const setFontFamily = (font: string) => {
    applyFormatting({ fontFamily: font });
  };

  const toggleTextColor = () => {
    setTextColor((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  const handleImageUrlSubmit = async () => {
    setShowImageUrlPopup(false);

    if (logoUrlInput) {
      setLoading((prev) => ({ ...prev, logo: true }));
      try {
        const proxyUrl = `${BACKEND_URL}/api/proxy-image?url=${encodeURIComponent(logoUrlInput)}`;
        await loadImage(proxyUrl);
        setLogoImage(proxyUrl);
      } catch (error) {
        console.error('Error loading logo:', error);
        alert(`Failed to load logo image: ${error}. Please check the URL.`);
        setLogoImage(null);
      } finally {
        setLoading((prev) => ({ ...prev, logo: false }));
      }
    }

    if (backgroundUrlInput) {
      setLoading((prev) => ({ ...prev, background: true }));
      try {
        const proxyUrl = `${BACKEND_URL}/api/proxy-image?url=${encodeURIComponent(backgroundUrlInput)}`;
        await loadImage(proxyUrl);
        setBackgroundImage(proxyUrl);
      } catch (error) {
        console.error('Error loading background:', error);
        alert(`Failed to load background image: ${error}. Please check the URL.`);
        setBackgroundImage(null);
      } finally {
        setLoading((prev) => ({ ...prev, background: false }));
      }
    }
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
        onDrop={handleDrop}
        onMouseUp={handleTextSelect}
        onTouchMove={handleTouchMove}
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
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => setShowImageUrlPopup(true)}
          >
            Add Image URLs
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
        <div className={`flex gap-4 ${isMobile ? 'm-auto' : ''}`}>
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
            onClick={handleResetInfo}
          >
            Reset Info
          </button>
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
            onClick={resetPositions}
          >
            Reset position
          </button>
        </div>
        <div className={`flex gap-4 ${isMobile ? 'm-auto' : ''}`}>
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
            onClick={toggleTextColor}
          >
            Change text color
          </button>
        </div>
      </div>
      
      {showImageUrlPopup && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageUrlPopup(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Add Image URLs</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo Image URL
              </label>
              <input
                type="url"
                value={logoUrlInput}
                onChange={(e) => setLogoUrlInput(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Image URL
              </label>
              <input
                type="url"
                value={backgroundUrlInput}
                onChange={(e) => setBackgroundUrlInput(e.target.value)}
                placeholder="https://example.com/background.jpg"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                onClick={() => setShowImageUrlPopup(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={handleImageUrlSubmit}
              >
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