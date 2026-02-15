// src/hooks/useScreenSize.js
import { useState, useEffect } from 'react';
import { ARENA } from '../utils/constants';

export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    // How much we need to scale the arena to fit the screen
    arenaScale: calculateArenaScale(window.innerWidth, window.innerHeight),
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        arenaScale: calculateArenaScale(width, height),
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}

function calculateArenaScale(screenWidth, screenHeight) {
  // Add padding so the arena doesn't touch the edges
  const paddingX = 20;
  const paddingY = 160; // Room for HUD above and controls below on mobile

  const scaleX = (screenWidth - paddingX) / ARENA.WIDTH;
  const scaleY = (screenHeight - paddingY) / ARENA.HEIGHT;

  // Use the smaller scale to fit both dimensions
  // Cap at 1.0 so we never upscale on big screens
  return Math.min(scaleX, scaleY, 1.0);
}

export default useScreenSize;