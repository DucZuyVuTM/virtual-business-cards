import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { v4 as uuidv4 } from 'uuid';
import { CardData } from '../types/cardData';
import { BACKEND_URL } from '../const/backend';

export const useCardCapture = (
  cardRef: React.RefObject<HTMLDivElement>,
  group1Ref: React.RefObject<HTMLDivElement>,
  group2Ref: React.RefObject<HTMLDivElement>,
  group3Ref: React.RefObject<HTMLDivElement>,
  cardData: CardData,
  backgroundImage: string | null,
  logoImage: string | null,
  setDashEnable: React.Dispatch<React.SetStateAction<boolean>>,
  setLoading: React.Dispatch<React.SetStateAction<{ logo: boolean; background: boolean }>>
) => {
  const navigate = useNavigate();

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

  const handleSave = async () => {
    if (cardRef.current) {
      const groupElements = [group1Ref, group2Ref, group3Ref];
      groupElements.forEach((ref) => {
        if (ref.current) {
          setDashEnable(false);
        }
      });

      try {
        const imagePromises: Promise<void>[] = [];
        if (backgroundImage) {
          imagePromises.push(loadImage(backgroundImage));
        }
        if (logoImage) {
          imagePromises.push(loadImage(logoImage));
        }

        await Promise.all(imagePromises);

        const canvas = await html2canvas(cardRef.current, {
          scale: window.devicePixelRatio,
          useCORS: true,
          backgroundColor: null,
        });

        groupElements.forEach((ref) => {
          if (ref.current) {
            setDashEnable(true);
          }
        });

        const imageData = canvas.toDataURL('image/png');

        const newCardId = uuidv4();
        const saveImageResponse = await fetch(`${BACKEND_URL}/api/save-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: newCardId, imageData }),
        });
        const saveImageResult = await saveImageResponse.json();
        if (!saveImageResponse.ok) {
          throw new Error(saveImageResult.error || 'Failed to save image to Neon');
        }

        const newCard: CardData = {
          ...cardData,
          id: newCardId,
          backgroundImage: backgroundImage,
          logoImage: logoImage,
          imageData: undefined,
        };

        const storedCards = JSON.parse(localStorage.getItem('savedCards') || '{"cards": []}');
        storedCards.cards = storedCards.cards || [];
        storedCards.cards.push(newCard);
        localStorage.setItem('savedCards', JSON.stringify(storedCards));

        navigate('/profile');
      } catch (error) {
        console.error('Error during save:', error);
        groupElements.forEach((ref) => {
          if (ref.current) {
            setDashEnable(true);
          }
        });
        alert(`Failed to save card. ${error}. Please check image URLs or try again.`);
      } finally {
        setLoading({ logo: false, background: false });
      }
    }
  };

  return { handleSave };
};