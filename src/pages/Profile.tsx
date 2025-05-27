import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CardData, CardsState } from '../types/cardData';
import { BACKEND_URL } from '../const/const';

const Profile: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [imageDataMap, setImageDataMap] = useState<{ [key: string]: string }>({});
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Lấy dữ liệu từ localStorage với key 'savedCards'
    const savedData: CardsState = JSON.parse(localStorage.getItem('savedCards') || '{"cards": []}');
    setCards(savedData.cards || []);

    // Lấy imageData từ Neon dựa trên danh sách id từ localStorage
    const fetchImages = async () => {
      try {
        const cardIds = savedData.cards.map((card) => card.id);
        const response = await fetch(`${BACKEND_URL}/api/get-images`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: cardIds }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch images');
        }
        const imageMap: { [key: string]: string } = {};
        data.images.forEach((item: { id: string; image_data: string }) => {
          imageMap[item.id] = item.image_data;
        });
        setImageDataMap(imageMap);
      } catch (error) {
        console.error('Error fetching images:', error);
        setImageLoadError('Failed to load images from server.');
      }
    };

    fetchImages();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDeleteCard = async (id: string) => {
    try {
      // Xóa từ Neon
      const deleteResponse = await fetch(`${BACKEND_URL}/api/delete-card/${id}`, {
        method: 'DELETE',
      });
      const deleteResult = await deleteResponse.json();
      if (!deleteResponse.ok) {
        throw new Error(deleteResult.error || 'Failed to delete card from Neon');
      }

      // Xóa từ localStorage
      const updatedCards = cards.filter((card) => card.id !== id);
      localStorage.setItem('savedCards', JSON.stringify({ cards: updatedCards }));
      setCards(updatedCards);
      setSelectedCard(null);
      setImageDataMap((prev) => {
        const newMap = { ...prev };
        delete newMap[id];
        return newMap;
      });
    } catch (error) {
      console.error('Error deleting card:', error);
      setImageLoadError('Failed to delete card.');
    }
  };

  const closePopup = () => {
    setSelectedCard(null);
    setImageLoadError(null);
  };

  const downloadImage = (imageData: string, name: string) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = `${name || 'business_card'}_${new Date().toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageError = (cardId: string) => {
    setImageLoadError(`Failed to load image for card ${cardId}. The image data may be corrupted or inaccessible.`);
  };

  const previewStyle: React.CSSProperties = {
    width: isMobile ? '50px' : '100px',
    height: isMobile ? '30px' : '60px',
    background: selectedCard?.backgroundImage ? `url(${selectedCard.backgroundImage}) no-repeat center/cover` : 'linear-gradient(to bottom, #1e3c72, #2a5298)',
    borderRadius: '5px',
    marginRight: '10px',
    overflow: 'hidden',
    position: 'relative',
  };

  return (
    <main className="profile container mx-auto p-4 flex-grow">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Your Profile -- {cards.length} card{cards.length !== 1 ? 's' : ''}
      </h2>
      {cards.length === 0 ? (
        <p className="text-center text-gray-500">No saved cards.</p>
      ) : (
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          }}
        >
          {cards.map((card) => {
            const imageData = imageDataMap[card.id];
            return (
              <div
                key={card.id}
                className="flex items-center p-2 border rounded-lg shadow-md hover:bg-gray-100 cursor-pointer transition"
                onClick={() => setSelectedCard({ ...card, imageData })}
              >
                <div style={previewStyle}>
                  {imageData ? (
                    <img
                      src={imageData}
                      alt={`${card.name || 'Card'} preview`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={() => handleImageError(card.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs">
                      No preview
                    </div>
                  )}
                </div>
                <div className="flex-1 ml-2">
                  <p className="font-semibold">{card.name || 'No name'}</p>
                  <p className="text-sm text-gray-600">{card.title || 'No title'}</p>
                  <p className="text-sm text-gray-600">{card.organization || 'No organization'}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {imageLoadError && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
          {imageLoadError}
        </div>
      )}
      <div className={`mt-6 flex ${isMobile ? 'flex-col' : 'flex-row'} justify-center gap-4`}>
        <Link
          to="/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center w-full sm:w-auto"
        >
          Create New Card
        </Link>
      </div>

      {selectedCard && selectedCard.imageData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closePopup}
        >
          <div
            className="relative bg-white rounded-lg p-4 flex flex-col items-center"
            style={{
              width: '100%',
              maxWidth: isMobile ? '90%' : '700px',
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full mb-4"
              style={{
                aspectRatio: '7 / 4',
                maxHeight: '80vh',
              }}
            >
              <img
                src={selectedCard.imageData}
                alt={`${selectedCard.name || 'Card'} full view`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                onError={() => handleImageError(selectedCard.id)}
              />
            </div>
            {imageLoadError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {imageLoadError}
              </div>
            )}
            <div className="flex gap-2 justify-end w-full">
              <Link
                to={"/create"}
                state={{ cardData: selectedCard }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Edit
              </Link>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                onClick={() => handleDeleteCard(selectedCard.id)}
              >
                Delete
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={() => downloadImage(selectedCard.imageData!, selectedCard.name || 'business_card')}
              >
                Download
              </button>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
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