import React, { useState, useEffect } from 'react';

interface CardData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
}

const Profile: React.FC = () => {
  const [savedCard, setSavedCard] = useState<CardData | null>(null);

  useEffect(() => {
    const card = JSON.parse(localStorage.getItem('savedCard') || 'null');
    setSavedCard(card);
  }, []);

  const handleDelete = () => {
    localStorage.removeItem('savedCard');
    setSavedCard(null);
  };

  return (
    <main className="profile container mx-auto p-4">
      <h2 className="text-2xl mb-4">Your Profile</h2>
      {savedCard ? (
        <div className="profile__card border p-4 bg-white shadow">
          <h3 className="text-xl">{savedCard.name}</h3>
          <p>{savedCard.title}</p>
          <p>{savedCard.company}</p>
          <p>{savedCard.email}</p>
          <p>{savedCard.phone}</p>
          <button onClick={handleDelete} className="mt-2 bg-red-600 text-white px-2 py-1 rounded">
            Delete Card
          </button>
        </div>
      ) : (
        <p>No saved cards.</p>
      )}
    </main>
  );
};

export default Profile;