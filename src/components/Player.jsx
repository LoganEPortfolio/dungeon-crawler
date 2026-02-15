// src/components/Player.jsx
import { memo } from 'react';

const Player = memo(function Player({ player, showAttackIndicator }) {
  if (!player) return null;

  const { x, y, size, sprite, direction, isAttacking, isHit } = player;

  // Build class names
  const classNames = [
    'entity',
    'player',
    isAttacking ? 'attacking' : '',
    isHit ? 'hit' : '',
  ].filter(Boolean).join(' ');

  // Flip sprite based on direction
  const flipStyle = direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)';

  return (
    <>
      {/* Player sprite */}
      <div
        className={classNames}
        style={{
          width: size,
          height: size,
          left: x,
          top: y,
          transform: flipStyle,
        }}
        dangerouslySetInnerHTML={{ __html: sprite }}
      />

      {/* Attack range indicator */}
      {showAttackIndicator && isAttacking && (
        <div
          className="attack-indicator"
          style={{
            left: x + size / 2,
            top: y + size / 2,
          }}
        />
      )}
    </>
  );
});

export default Player;