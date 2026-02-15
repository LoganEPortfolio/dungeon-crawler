// src/hooks/usePlayerMovement.js
import { useEffect, useCallback, useRef } from 'react';
import { KEYS } from '../utils/constants';

/**
 * Custom hook that handles keyboard input for player movement
 * @param {Function} onKeysChange - Callback when keys state changes
 * @param {boolean} isEnabled - Whether input should be captured
 */
export function usePlayerMovement(onKeysChange, isEnabled = true) {
  const keysRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
  });

  const isKeyInList = useCallback((key, keyList) => {
    return keyList.includes(key);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!isEnabled) return;

    let changed = false;
    const newKeys = { ...keysRef.current };

    if (isKeyInList(e.key, KEYS.UP) && !newKeys.up) {
      newKeys.up = true;
      changed = true;
    }
    if (isKeyInList(e.key, KEYS.DOWN) && !newKeys.down) {
      newKeys.down = true;
      changed = true;
    }
    if (isKeyInList(e.key, KEYS.LEFT) && !newKeys.left) {
      newKeys.left = true;
      changed = true;
    }
    if (isKeyInList(e.key, KEYS.RIGHT) && !newKeys.right) {
      newKeys.right = true;
      changed = true;
    }
    if (isKeyInList(e.key, KEYS.ATTACK) && !newKeys.attack) {
      e.preventDefault(); // Prevent space from scrolling
      newKeys.attack = true;
      changed = true;
    }

    if (changed) {
      keysRef.current = newKeys;
      onKeysChange(newKeys);
    }
  }, [isEnabled, isKeyInList, onKeysChange]);

  const handleKeyUp = useCallback((e) => {
    if (!isEnabled) return;

    let changed = false;
    const newKeys = { ...keysRef.current };

    if (isKeyInList(e.key, KEYS.UP) && newKeys.up) {
      newKeys.up = false;
      changed = true;
    }
    if (isKeyInList(e.key, KEYS.DOWN) && newKeys.down) {
      newKeys.down = false;
      changed = true;
    }
    if (isKeyInList(e.key, KEYS.LEFT) && newKeys.left) {
      newKeys.left = false;
      changed = true;
    }
    if (isKeyInList(e.key, KEYS.RIGHT) && newKeys.right) {
      newKeys.right = false;
      changed = true;
    }
    if (isKeyInList(e.key, KEYS.ATTACK)) {
      newKeys.attack = false;
      changed = true;
    }

    if (changed) {
      keysRef.current = newKeys;
      onKeysChange(newKeys);
    }
  }, [isEnabled, isKeyInList, onKeysChange]);

  // Handle window blur (reset all keys when window loses focus)
  const handleBlur = useCallback(() => {
    const resetKeys = {
      up: false,
      down: false,
      left: false,
      right: false,
      attack: false,
    };
    keysRef.current = resetKeys;
    onKeysChange(resetKeys);
  }, [onKeysChange]);

  useEffect(() => {
    if (isEnabled) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('blur', handleBlur);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isEnabled, handleKeyDown, handleKeyUp, handleBlur]);

  // Reset keys when disabled
  useEffect(() => {
    if (!isEnabled) {
      const resetKeys = {
        up: false,
        down: false,
        left: false,
        right: false,
        attack: false,
      };
      keysRef.current = resetKeys;
      onKeysChange(resetKeys);
    }
  }, [isEnabled, onKeysChange]);

  // Return current keys state
  const getKeys = useCallback(() => {
    return keysRef.current;
  }, []);

  return { getKeys };
}

export default usePlayerMovement;