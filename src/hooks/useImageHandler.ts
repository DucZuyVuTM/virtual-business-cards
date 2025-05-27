import { useState, useEffect } from 'react';
import { BACKEND_URL } from '../const/const';

export const useImageHandler = (initialBackground?: string) => {
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [showImageUrlPopup, setShowImageUrlPopup] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [backgroundUrlInput, setBackgroundUrlInput] = useState('');
  const [loading, setLoading] = useState<{ logo: boolean; background: boolean }>({ logo: false, background: false });

  const loadImage = (url: string, maxRetries = 3, retryDelay = 2000): Promise<void> => {
    return new Promise((resolve, reject) => {
      let retries = 0;
      const attemptLoad = () => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = url;

        const timeout = setTimeout(() => {
          if (retries < maxRetries) {
            retries++;
            setTimeout(attemptLoad, retryDelay);
          } else {
            reject(new Error(`Timeout loading image: ${url}`));
          }
        }, 10000);

        img.onload = () => {
          clearTimeout(timeout);
          resolve();
        };
        img.onerror = () => {
          clearTimeout(timeout);
          if (retries < maxRetries) {
            retries++;
            setTimeout(attemptLoad, retryDelay);
          } else {
            reject(new Error(`Failed to load image after ${maxRetries} retries: ${url}`));
          }
        };
      };
      attemptLoad();
    });
  };

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