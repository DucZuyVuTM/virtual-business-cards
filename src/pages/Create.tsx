import React, { useState } from 'react';

interface CardData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
}

const Create: React.FC = () => {
  const [cardData, setCardData] = useState<CardData>({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    localStorage.setItem('savedCard', JSON.stringify(cardData));
    alert('Card saved!');
  };

  return (
    <main className="create container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="create__form">
        <h2 className="text-2xl mb-4">Create Your Card</h2>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={cardData.name}
          onChange={handleChange}
          className="w-full p-2 mb-2 border"
        />
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={cardData.title}
          onChange={handleChange}
          className="w-full p-2 mb-2 border"
        />
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={cardData.company}
          onChange={handleChange}
          className="w-full p-2 mb-2 border"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={cardData.email}
          onChange={handleChange}
          className="w-full p-2 mb-2 border"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone"
          value={cardData.phone}
          onChange={handleChange}
          className="w-full p-2 mb-2 border"
        />
        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">
          Save Card
        </button>
      </div>
      <div className="create__preview">
        <h2 className="text-2xl mb-4">Preview</h2>
        <div className="create__card border p-4 bg-white shadow">
          <h3 className="text-xl">{cardData.name}</h3>
          <p>{cardData.title}</p>
          <p>{cardData.company}</p>
          <p>{cardData.email}</p>
          <p>{cardData.phone}</p>
        </div>
      </div>
    </main>
  );
};

export default Create;