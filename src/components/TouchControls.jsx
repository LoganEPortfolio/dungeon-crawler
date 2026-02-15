// src/components/TouchControls.jsx
import { useState, useRef, useCallback, useEffect, memo } from 'react';

const TouchControls = memo(function TouchControls({ onMove, onAttack, disabled }) {
  // Joystick state
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickRef = useRef(null);
  const joystickTouchId = useRef(null);

  // Attack button state
  const [attackActive, setAttackActive] = useState(false);

  // Joystick settings
  const maxDistance = 40; // Max pixels the knob can move from center

  // Calculate direction from joystick position
  const calculateDirection = useCallback((x, y) => {
    const threshold = 10; // Dead zone

    const keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      attack: false,
    };

    if (Math.abs(x) > threshold || Math.abs(y) > threshold) {
      if (y < -threshold) keys.up = true;
      if (y > threshold) keys.down = true;
      if (x < -threshold) keys.left = true;
      if (x > threshold) keys.right = true;
    }

    return keys;
  }, []);

  // Handle joystick touch start
  const handleJoystickStart = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();

    const touch = e.touches[0];
    joystickTouchId.current = touch.identifier;
    setJoystickActive(true);

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let x = touch.clientX - centerX;
    let y = touch.clientY - centerY;

    // Clamp to max distance
    const distance = Math.sqrt(x * x + y * y);
    if (distance > maxDistance) {
      x = (x / distance) * maxDistance;
      y = (y / distance) * maxDistance;
    }

    setJoystickPos({ x, y });
    onMove(calculateDirection(x, y));
  }, [disabled, onMove, calculateDirection, maxDistance]);

  // Handle joystick touch move
  const handleJoystickMove = useCallback((e) => {
    if (disabled || !joystickActive) return;
    e.preventDefault();

    // Find the touch that matches our joystick
    const touch = Array.from(e.touches).find(
      (t) => t.identifier === joystickTouchId.current
    );
    if (!touch) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let x = touch.clientX - centerX;
    let y = touch.clientY - centerY;

    // Clamp to max distance
    const distance = Math.sqrt(x * x + y * y);
    if (distance > maxDistance) {
      x = (x / distance) * maxDistance;
      y = (y / distance) * maxDistance;
    }

    setJoystickPos({ x, y });
    onMove(calculateDirection(x, y));
  }, [disabled, joystickActive, onMove, calculateDirection, maxDistance]);

  // Handle joystick touch end
  const handleJoystickEnd = useCallback((e) => {
    // Check if our touch ended
    const touch = Array.from(e.changedTouches).find(
      (t) => t.identifier === joystickTouchId.current
    );
    if (!touch) return;

    joystickTouchId.current = null;
    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    onMove({
      up: false,
      down: false,
      left: false,
      right: false,
      attack: false,
    });
  }, [onMove]);

  // Handle attack button
  const handleAttackStart = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();
    setAttackActive(true);
    onAttack(true);
  }, [disabled, onAttack]);

  const handleAttackEnd = useCallback((e) => {
    e.preventDefault();
    setAttackActive(false);
    onAttack(false);
  }, [onAttack]);

  // Cleanup on unmount or disable
  useEffect(() => {
    if (disabled) {
      setJoystickActive(false);
      setJoystickPos({ x: 0, y: 0 });
      setAttackActive(false);
    }
  }, [disabled]);

  return (
    <div className={`touch-controls ${disabled ? 'disabled' : ''}`}>

      {/* Left side - Joystick */}
      <div
        ref={joystickRef}
        className={`joystick-container ${joystickActive ? 'active' : ''}`}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        onTouchCancel={handleJoystickEnd}
      >
        <div className="joystick-base">
          <div className="joystick-direction up">▲</div>
          <div className="joystick-direction down">▼</div>
          <div className="joystick-direction left">◀</div>
          <div className="joystick-direction right">▶</div>
          <div
            className={`joystick-knob ${joystickActive ? 'active' : ''}`}
            style={{
              transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
            }}
          />
        </div>
        <span className="touch-label">MOVE</span>
      </div>

      {/* Right side - Attack button */}
      <div
        className={`attack-button-container ${attackActive ? 'active' : ''}`}
        onTouchStart={handleAttackStart}
        onTouchEnd={handleAttackEnd}
        onTouchCancel={handleAttackEnd}
      >
        <div className={`attack-button ${attackActive ? 'active' : ''}`}>
          <span className="attack-icon">⚔️</span>
        </div>
        <span className="touch-label">ATTACK</span>
      </div>

    </div>
  );
});

export default TouchControls;