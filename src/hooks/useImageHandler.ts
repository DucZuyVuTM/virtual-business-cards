import { useState, useEffect } from 'react';
import { BACKEND_URL } from '../const/backend';
import { loadImage } from '../components/CardEditor/loadImage';

export const useImageHandler = (initialBackground?: string, initialLogo?: string) => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(initialBackground || null);
  const [logoImage, setLogoImage] = useState<string | null>(initialLogo || null);
  const [showImageUrlPopup, setShowImageUrlPopup] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [backgroundUrlInput, setBackgroundUrlInput] = useState('');
  const [loading, setLoading] = useState<{ logo: boolean; background: boolean }>({ logo: false, background: false });

  useEffect(() => {
    if (initialBackground) {
      setLoading((prev) => ({ ...prev, background: true }));
      loadImage(initialBackground)
        .then(() => setBackgroundImage(initialBackground))
        .catch((error) => {
          console.error('Error loading initial background:', error);
          setBackgroundImage(null);
        })
        .finally(() => setLoading((prev) => ({ ...prev, background: false })));
    }
  }, [initialBackground]);

  useEffect(() => {
    if (initialLogo) {
      setLoading((prev) => ({ ...prev, logo: true }));
      loadImage(initialLogo)
        .then(() => setLogoImage(initialLogo))
        .catch((error) => {
          console.error('Error loading initial logo:', error);
          setLogoImage(null);
        })
        .finally(() => setLoading((prev) => ({ ...prev, logo: false })));
    }
  }, [initialLogo]);

  const handleImageUrlSubmit = async () => {
    setShowImageUrlPopup(false);

    if (logoUrlInput) {
      setLoading((prev) => ({ ...prev, logo: true }));
      try {
        const proxyUrl = `${BACKEND_URL}/api/proxy-image?url=${encodeURIComponent(logoUrlInput)}`;
        await loadImage(proxyUrl);
        setLogoImage(proxyUrl);
      } catch (error) {
        console.error('Error loading logo:', error);
        alert(`Failed to load logo image: ${error}. Please check the URL.`);
        setLogoImage(null);
      } finally {
        setLoading((prev) => ({ ...prev, logo: false }));
      }
    }

    if (backgroundUrlInput) {
      setLoading((prev) => ({ ...prev, background: true }));
      try {
        const proxyUrl = `${BACKEND_URL}/api/proxy-image?url=${encodeURIComponent(backgroundUrlInput)}`;
        await loadImage(proxyUrl);
        setBackgroundImage(proxyUrl);
      } catch (error) {
        console.error('Error loading background:', error);
        alert(`Failed to load background image: ${error}. Please check the URL.`);
        setBackgroundImage(null);
      } finally {
        setLoading((prev) => ({ ...prev, background: false }));
      }
    }
  };

  return {
    backgroundImage,
    logoImage,
    showImageUrlPopup,
    logoUrlInput,
    backgroundUrlInput,
    loading,
    setShowImageUrlPopup,
    setLogoUrlInput,
    setBackgroundUrlInput,
    handleImageUrlSubmit,
    setLogoImage,
    setLoading,
  };
};