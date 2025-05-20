import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer bg-blue-800 text-white p-6 shadow-inner">
      <div className="footer__content container mx-auto">
        <p className="footer__text text-lg font-semibold mb-4">Contact to web owner:</p>
        <ul className="footer__links flex flex-col md:flex-row gap-4">
          <li className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.66-.22.66-.49v-1.73c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.564 9.564 0 0112 6.8c.85.004 1.71.11 2.52.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.67.94.67 1.9v2.82c0 .27.16.58.67.49A10.01 10.01 0 0022 12c0-5.52-4.48-10-10-10z" />
            </svg>
            <span>Github: <a href="https://github.com/DucZuyVuTM" className="footer__link hover:text-blue-200 transition-colors">DucZuyVuTM</a></span>
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 14H5c-.55 0-1-.45-1-1V8l6.94 4.34c.65.41 1.47.41 2.12 0L20 8v9c0 .55-.45 1-1 1zm-7-7L4 6h16l-8 5z" />
            </svg>
            <span>Email: <a href="mailto:duczuyvu12@gmail.com" className="footer__link hover:text-blue-200 transition-colors">duczuyvu12@gmail.com</a></span>
          </li>
          <li className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7v-3h3V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.91 8-4.94 8-9.95z" />
            </svg>
            <span>Facebook: <a href="https://www.facebook.com/duczuyvu" className="footer__link hover:text-blue-200 transition-colors">Vũ Đức Duy</a></span>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;