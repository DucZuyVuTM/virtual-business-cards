import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CardData, CardsState } from '../types/cardData';

const Profile: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const savedData: CardsState = JSON.parse(localStorage.getItem('savedCards') || '{"cards": []}');
    setCards(savedData.cards || []);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDeleteCard = (id: string) => {
    const updatedCards = cards.filter((card) => card.id !== id);
    localStorage.setItem('savedCards', JSON.stringify({ cards: updatedCards }));
    setCards(updatedCards);
    setSelectedCard(null);
  };

  const closePopup = () => {
    setSelectedCard(null);
  };

  const downloadImage = (imageData: string, name: string) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `${name || 'business_card'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const previewStyle: React.CSSProperties = {
    width: isMobile ? '50px' : '100px',
    height: isMobile ? '30px' : '60px',
    background: 'linear-gradient(to bottom, #1e3c72, #2a5298)',
    borderRadius: '5px',
    marginRight: '10px',
    overflow: 'hidden',
  };

  return (
    <main className="profile container mx-auto p-4">
      <h2 className="text-2xl mb-4 text-center">Your Profile</h2>
      {cards.length === 0 ? (
        <p className="text-center">No saved cards.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center p-2 border rounded shadow hover:bg-gray-100 cursor-pointer"
              onClick={() => setSelectedCard(card)}
            >
              <div style={previewStyle}>
                {card.imageData && (
                  <img
                    src={card.imageData}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
              </div>
              <div>
                <p>{card.name || 'No name'}</p>
                <p>{card.title || 'No title'}</p>
                <p>{card.organization || 'No organization'}</p>
                <p>{card.location || 'No location'}</p>
                <p>{card.phone || 'No phone'}</p>
                <p>{card.email || 'No email'}</p>
                <p>{card.website || 'No website'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className={`mt-4 flex ${isMobile ? 'flex-col' : 'flex-row'} justify-center gap-4`}>
        <Link to="/create" className="bg-blue-600 text-white text-center px-4 py-2 rounded hover:bg-blue-700">
          Create New Card
        </Link>
      </div>

      {selectedCard && selectedCard.imageData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closePopup}
        >
          <div
            className="relative bg-transparent rounded-lg flex flex-col items-center justify-center"
            style={{
              width: '100%',
              maxWidth: isMobile ? '90%' : '700px',
              maxHeight: 'calc(100vh - 100px)', // Tăng không gian để chứa cả ảnh và nút
              overflowY: 'auto', // Cho phép cuộn nếu nội dung vượt quá
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full"
              style={{
                aspectRatio: '7 / 4', // Giữ tỷ lệ cho ảnh
                maxHeight: '80vh', // Đảm bảo ảnh không vượt quá viewport
              }}
            >
              <img
                src={selectedCard.imageData}
                alt="Card"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '10px',
                }}
              />
            </div>
            <div className="flex gap-2 mt-4 justify-end w-full px-4 pb-4">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                onClick={() => handleDeleteCard(selectedCard.id)}
              >
                Delete
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                onClick={() => downloadImage(selectedCard.imageData!, selectedCard.name)}
              >
                Download
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                onClick={closePopup}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Profile;