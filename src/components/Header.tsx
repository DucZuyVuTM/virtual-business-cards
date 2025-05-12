import React from 'react';
import { NavLink } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="header bg-blue-800 text-white p-4">
      <nav className="header__nav container mx-auto flex justify-between">
        <h1 className="header__logo text-xl">Virtual Business Cards</h1>
        <ul className="header__menu flex gap-4">
          <li className="flex justify-center items-center">
            <NavLink to="/" className="header__link">Home</NavLink>
          </li>
          <li className="flex justify-center items-center">
            <NavLink to="/create" className="header__link">Create</NavLink>
          </li>
          <li className="flex justify-center items-center">
            <NavLink to="/templates" className="header__link">Templates</NavLink>
          </li>
          <li className="flex justify-center items-center">
            <NavLink to="/profile" className="header__link">Profile</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;