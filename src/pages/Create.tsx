import React, { useState, useRef, useEffect } from 'react';

interface CardData {
  name: string;
  title: string;
  organization: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  positions: {
    group1: { x: number; y: number };
    group2: { x: number; y: number };
    group3: { x: number; y: number };
    logo: { x: number; y: number };
  };
}

const Create: React.FC = () => {
  const defaultData: CardData = {
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
  };

  const [cardData, setCardData] = useState<CardData>(defaultData);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const group1Ref = useRef<HTMLDivElement>(null);
  const group2Ref = useRef<HTMLDivElement>(null);
  const group3Ref = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768); // Khởi tạo isMobile ngay lập tức

  // Tính toán vị trí động và kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        const symmetryAxisX = rect.width * 3 / 4; // Trục đối xứng tại 3/4 chiều dài card
        const logoX = rect.width / 4; // Vị trí x của logo tại 1/4 chiều dài card
        const logoY = (rect.height - 100) / 2; // Canh giữa logo theo trục y (giả định logo cao 100px)
        const spacing = isMobile ? 20 : 0; // Khoảng cách 20px giữa các nhóm trên mobile

        // Lấy chiều cao của từng nhóm
        const group1Height = group1Ref.current?.getBoundingClientRect().height || 0;
        const group2Height = group2Ref.current?.getBoundingClientRect().height || 0;
        const group3Height = group3Ref.current?.getBoundingClientRect().height || 0;

        // Lấy chiều rộng của nhóm và logo
        const group1Width = group1Ref.current?.getBoundingClientRect().width || 0;
        const group2Width = group2Ref.current?.getBoundingClientRect().width || 0;
        const group3Width = group3Ref.current?.getBoundingClientRect().width || 0;
        const logoWidth = logoRef.current?.getBoundingClientRect().width || 0;

        // Tính toán vị trí x: Đặt tâm của nhóm tại symmetryAxisX, tâm của logo tại logoX
        const group1X = symmetryAxisX - group1Width / 2;
        const group2X = symmetryAxisX - group2Width / 2;
        const group3X = symmetryAxisX - group3Width / 2;
        const adjustedLogoX = logoX - logoWidth / 2; // Căn giữa logo tại 1/4 chiều dài

        setCardData((prev) => ({
          ...prev,
          positions: {
            group1: { x: group1X, y: rect.height / 4 - group1Height / 2 - spacing }, // 1/4 chiều cao, căn giữa nhóm
            group2: { x: group2X, y: rect.height / 2 - group2Height / 2 }, // 1/2 chiều cao, thêm khoảng cách
            group3: { x: group3X, y: (rect.height * 3) / 4 - group3Height / 2 + spacing }, // 3/4 chiều cao, thêm khoảng cách
            logo: { x: adjustedLogoX, y: logoY },
          },
        }));
      }
      setIsMobile(window.innerWidth < 768); // Cập nhật isMobile khi resize
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInput = (field: keyof CardData, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDragStart = (e: React.DragEvent, field: string) => {
    setIsDragging(field);
    e.dataTransfer.setData('text/plain', field);
    const target = e.currentTarget;
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

  const handleSave = () => {
    console.log('Saved card data:', cardData);
    alert('Card data saved! Check console for details.');
  };

  const handleReset = () => {
    setCardData(defaultData);
    // Gọi lại logic useEffect để cập nhật vị trí động sau khi reset
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const symmetryAxisX = rect.width * 3 / 4;
      const logoX = rect.width / 4;
      const logoY = (rect.height - 100) / 2;
      const spacing = isMobile ? 20 : 0;
      const group1Height = group1Ref.current?.getBoundingClientRect().height || 0;
      const group2Height = group2Ref.current?.getBoundingClientRect().height || 0;
      const group3Height = group3Ref.current?.getBoundingClientRect().height || 0;
      const group1Width = group1Ref.current?.getBoundingClientRect().width || 0;
      const group2Width = group2Ref.current?.getBoundingClientRect().width || 0;
      const group3Width = group3Ref.current?.getBoundingClientRect().width || 0;
      const logoWidth = logoRef.current?.getBoundingClientRect().width || 100;

      const group1X = symmetryAxisX - group1Width / 2;
      const group2X = symmetryAxisX - group2Width / 2;
      const group3X = symmetryAxisX - group3Width / 2;
      const adjustedLogoX = logoX - logoWidth / 2;

      setCardData({
        ...defaultData,
        positions: {
          group1: { x: group1X, y: rect.height / 4 - group1Height / 2 - spacing },
          group2: { x: group2X, y: rect.height / 2 - group2Height / 2 },
          group3: { x: group3X, y: (rect.height * 3) / 4 - group3Height / 2 + spacing },
          logo: { x: adjustedLogoX, y: logoY },
        },
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('Logo uploaded:', file.name);
    }
  };

  // Style cho drag handle
  const dragHandleStyle: React.CSSProperties = {
    position: 'absolute',
    padding: '4px',
    border: '4px dashed rgba(255, 255, 255, 0.3)',
    cursor: 'move',
    borderRadius: '4px',
    maxWidth: '200px',
  };

  const dragHandleHoverStyle: React.CSSProperties = {
    border: '4px dashed rgba(255, 255, 255, 0.7)',
  };

  const textElementStyle: React.CSSProperties = {
    margin: 0,
    padding: '1px',
    cursor: 'text',
    fontSize: isMobile ? '0.875rem' : '1.125rem', // Thu nhỏ trên mobile (< 768px)
  };

  const logoStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${cardData.positions.logo.x}px`,
    top: `${cardData.positions.logo.y}px`,
    cursor: 'move',
  };

  return (
    <main className="container mx-auto p-4 flex-grow">
      <h2 className="text-2xl font-bold mb-6 text-center">Customize your business card</h2>
      <div
        ref={cardRef}
        className="relative flex justify-center"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          background: 'linear-gradient(to bottom, #1e3c72, #2a5298)',
          aspectRatio: '7 / 4',
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 200px)',
          margin: '0 auto',
          borderRadius: '10px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'10\' cy=\'20\' r=\'1\' fill=\'white\'/%3E%3Ccircle cx=\'30\' cy=\'50\' r=\'1\' fill=\'white\'/%3E%3Ccircle cx=\'70\' cy=\'80\' r=\'1\' fill=\'white\'/%3E%3C/svg\')",
            opacity: 0.2,
          }}
        />
        <div className="flex w-full h-full p-4">
          <div className="w-2/3 text-white p-4">
            {/* Group 1: name và title */}
            <div
              ref={group1Ref}
              key="group1"
              draggable
              onDragStart={(e) => handleDragStart(e, 'group1')}
              style={{
                ...dragHandleStyle,
                left: `${cardData.positions.group1.x}px`,
                top: `${cardData.positions.group1.y}px`,
              }}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, dragHandleHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, { border: '4px dashed rgba(255, 255, 255, 0.3)' })}
            >
              <p
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => handleInput('name', e.currentTarget.textContent || '')}
                style={textElementStyle}
                className={`font-bold ${cardData.name === '' ? 'empty:before:content-["Enter_name"] empty:before:text-gray-300' : ''}`}
              >
                {cardData.name}
              </p>
              <p
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => handleInput('title', e.currentTarget.textContent || '')}
                style={textElementStyle}
                className={`${cardData.title === '' ? 'empty:before:content-["Enter_title"] empty:before:text-gray-300' : ''}`}
              >
                {cardData.title}
              </p>
            </div>

            {/* Group 2: organization, location, phone */}
            <div
              ref={group2Ref}
              key="group2"
              draggable
              onDragStart={(e) => handleDragStart(e, 'group2')}
              style={{
                ...dragHandleStyle,
                left: `${cardData.positions.group2.x}px`,
                top: `${cardData.positions.group2.y}px`,
              }}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, dragHandleHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, { border: '4px dashed rgba(255, 255, 255, 0.3)' })}
            >
              <p
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => handleInput('organization', e.currentTarget.textContent || '')}
                style={textElementStyle}
                className={`${cardData.organization === '' ? 'empty:before:content-["Enter_organization"] empty:before:text-gray-300' : ''}`}
              >
                {cardData.organization}
              </p>
              <p
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => handleInput('location', e.currentTarget.textContent || '')}
                style={textElementStyle}
                className={`${cardData.location === '' ? 'empty:before:content-["Enter_location"] empty:before:text-gray-300' : ''}`}
              >
                {cardData.location}
              </p>
              <p
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => handleInput('phone', e.currentTarget.textContent || '')}
                style={textElementStyle}
                className={`${cardData.phone === '' ? 'empty:before:content-["Enter_phone"] empty:before:text-gray-300' : ''}`}
              >
                {cardData.phone}
              </p>
            </div>

            {/* Group 3: email và website */}
            <div
              ref={group3Ref}
              key="group3"
              draggable
              onDragStart={(e) => handleDragStart(e, 'group3')}
              style={{
                ...dragHandleStyle,
                left: `${cardData.positions.group3.x}px`,
                top: `${cardData.positions.group3.y}px`,
              }}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, dragHandleHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, { border: '4px dashed rgba(255, 255, 255, 0.3)' })}
            >
              <p
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => handleInput('email', e.currentTarget.textContent || '')}
                style={textElementStyle}
                className={`${cardData.email === '' ? 'empty:before:content-["Enter_email"] empty:before:text-gray-300' : ''}`}
              >
                {cardData.email}
              </p>
              <p
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => handleInput('website', e.currentTarget.textContent || '')}
                style={textElementStyle}
                className={`${cardData.website === '' ? 'empty:before:content-["Enter_website"] empty:before:text-gray-300' : ''}`}
              >
                {cardData.website}
              </p>
            </div>

            {/* Logo */}
            <div
              ref={logoRef}
              key="logo"
              draggable
              onDragStart={(e) => handleDragStart(e, 'logo')}
              style={logoStyle}
              className="outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              <label className="cursor-pointer text-white flex flex-col items-center">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <svg className="w-16 h-16 mb-2" fill="none" stroke="white" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Upload your logo</span>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>
    </main>
  );
};

export default Create;