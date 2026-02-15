// src/hooks/useGameLoop.js
import { useEffect, useRef, useCallback } from 'react';
import { GAME_LOOP } from '../utils/constants';

/**
 * Custom hook that runs a game loop at specified FPS
 * @param {Function} callback - Function to call each frame
 * @param {boolean} isRunning - Whether the loop should be running
 * @param {number} fps - Frames per second (default: 60)
 */
export function useGameLoop(callback, isRunning, fps = GAME_LOOP.FPS) {
  const requestRef = useRef(null);
  const previousTimeRef = useRef(null);
  const callbackRef = useRef(callback);
  const accumulatorRef = useRef(0);
  
  const frameTime = 1000 / fps;

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const loop = useCallback((currentTime) => {
    if (previousTimeRef.current === null) {
      previousTimeRef.current = currentTime;
    }

    const deltaTime = currentTime - previousTimeRef.current;
    previousTimeRef.current = currentTime;

    // Accumulate time and run updates at fixed intervals
    accumulatorRef.current += deltaTime;

    // Prevent spiral of death - cap accumulated time
    if (accumulatorRef.current > frameTime * 5) {
      accumulatorRef.current = frameTime * 5;
    }

    // Run fixed updates
    while (accumulatorRef.current >= frameTime) {
      callbackRef.current(frameTime);
      accumulatorRef.current -= frameTime;
    }

    requestRef.current = requestAnimationFrame(loop);
  }, [frameTime]);

  useEffect(() => {
    if (isRunning) {
      previousTimeRef.current = null;
      accumulatorRef.current = 0;
      requestRef.current = requestAnimationFrame(loop);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning, loop]);

  // Return function to get current FPS (for debugging)
  const getFPS = useCallback(() => {
    return fps;
  }, [fps]);

  return { getFPS };
}

export default useGameLoop;