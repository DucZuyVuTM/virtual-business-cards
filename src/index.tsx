import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Create from './pages/Create';
import Templates from './pages/Templates';
import Profile from './pages/Profile';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <div className="flex flex-col h-screen text-[18px]">
    <HashRouter>
      <Header />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </HashRouter>
  </div>
);