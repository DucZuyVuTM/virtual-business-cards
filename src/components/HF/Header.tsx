import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (path: string) => {
    setIsMenuOpen(false);
    navigate(path === '/' ? '/virtual-business-cards/' : path);
  };

  return (
    <header className="header bg-blue-800 text-white p-4">
      <nav className="header__nav container mx-auto flex justify-between items-center">
        <h1 className="header__logo text-xl font-bold">Virtual Business Cards</h1>
        <button
          className="sm:hidden text-2xl focus:outline-none hover:text-gray-300 transition-colors"
          onClick={toggleMenu}
        >
          ☰
        </button>
        <ul
          className={`header__menu flex flex-col sm:flex-row gap-4 ${
            isMenuOpen ? 'flex' : 'hidden'
          } sm:flex absolute sm:static top-16 left-0 right-0 bg-blue-800 sm:bg-transparent p-4 sm:p-0 z-[100]`}
        >
          <li className="flex justify-center items-center">
            <NavLink to="/" className="header__link" onClick={(e) => {
              e.preventDefault(); // Ngăn hành vi mặc định
              handleNavClick('/'); // Sử dụng hàm điều hướng tùy chỉnh
            }}>
              Home
            </NavLink>
          </li>
          <li className="flex justify-center items-center">
            <NavLink to="/create" className="header__link" onClick={() => setIsMenuOpen(false)}>
              Create
            </NavLink>
          </li>
          <li className="flex justify-center items-center">
            <NavLink to="/templates" className="header__link" onClick={() => setIsMenuOpen(false)}>
              Templates
            </NavLink>
          </li>
          <li className="flex justify-center items-center">
            <NavLink to="/profile" className="header__link" onClick={() => setIsMenuOpen(false)}>
              Profile
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;