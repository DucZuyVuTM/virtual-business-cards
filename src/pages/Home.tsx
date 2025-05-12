import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <main className="home container mx-auto p-4 text-gray-700">
      <h1 className="home__title text-3xl mb-4">Create Your Virtual Business Card</h1>
      <p className="home__text mb-4">Design professional business cards in minutes with our easy-to-use editor.</p>
      <Link to="/create" className="home__button bg-blue-600 text-white px-4 py-2 rounded">Get Started</Link>
    </main>
  );
};

export default Home;