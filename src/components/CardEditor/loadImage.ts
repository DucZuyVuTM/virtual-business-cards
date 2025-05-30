export const loadImage = (url: string, maxRetries = 3, retryDelay = 2000): Promise<void> => {
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