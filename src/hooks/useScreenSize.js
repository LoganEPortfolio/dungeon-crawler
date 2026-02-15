// src/hooks/useScreenSize.js
import { useState, useEffect } from 'react';
import { ARENA } from '../utils/constants';

export function useScreenSize() {
  const [screenSize, setScreenSize] = useState(() => getScreenData());

  useEffect(() => {
    const handleResize = () => {
      setScreenSize(getScreenData());
    };

    window.addEventListener('resize', handleResize);
    // Also listen for orientation change on mobile
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return screenSize;
}

function getScreenData() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isLandscape = width > height;

  // Calculate arena scale
  // Mobile needs room for: HUD (60px) + Arena + Touch Controls (150px) + padding
  // Desktop needs room for: HUD (60px) + Arena + Debug (80px) + padding
  const hudHeight = isMobile ? 50 : 60;
  const bottomUIHeight = isMobile ? 160 : 90; // Touch controls vs debug panel
  const paddingX = isMobile ? 16 : 40;
  const paddingY = 20;

  const availableWidth = width - (paddingX * 2);
  const availableHeight = height - hudHeight - bottomUIHeight - (paddingY * 2);

  const scaleX = availableWidth / ARENA.WIDTH;
  const scaleY = availableHeight / ARENA.HEIGHT;

  // Use smaller scale to fit both dimensions, cap at 1.0
  const arenaScale = Math.min(scaleX, scaleY, 1.0);

  // Calculate actual arena dimensions after scaling
  const scaledArenaWidth = ARENA.WIDTH * arenaScale;
  const scaledArenaHeight = ARENA.HEIGHT * arenaScale;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isLandscape,
    arenaScale,
    scaledArenaWidth,
    scaledArenaHeight,
    availableWidth,
    availableHeight,
  };
}

export default useScreenSize;