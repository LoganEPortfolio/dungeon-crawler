// src/components/Arena.jsx
import { memo } from 'react';
import { ARENA } from '../utils/constants';
import Player from './Player';
import Enemy from './Enemy';

const Arena = memo(function Arena({
  player,
  enemies,
  enemiesInAttackRange,
  scale,
  isMobile,
}) {
  // Create a Set for quick lookup of enemies in range
  const inRangeSet = new Set(enemiesInAttackRange);

  return (
    <div
      className="arena-wrapper"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'top center',
      }}
    >
      <div
        className="arena"
        style={{
          width: ARENA.WIDTH,
          height: ARENA.HEIGHT,
          backgroundColor: ARENA.BACKGROUND_COLOR,
          border: `${ARENA.BORDER_WIDTH}px solid ${ARENA.BORDER_COLOR}`,
        }}
      >
        {/* Corner decorations */}
        <div className="arena-corner tl" />
        <div className="arena-corner tr" />
        <div className="arena-corner bl" />
        <div className="arena-corner br" />

        {/* Player */}
        <Player
          player={player}
          showAttackIndicator={true}
        />

        {/* Enemies */}
        {enemies.map((enemy) => (
          <Enemy
            key={enemy.id}
            enemy={enemy}
            isInAttackRange={inRangeSet.has(enemy.id)}
          />
        ))}

        {/* Mobile touch hint */}
        {isMobile && enemies.length === 0 && (
          <div className="arena-touch-hint">
            Use joystick to move, button to attack
          </div>
        )}
      </div>
    </div>
  );
});

export default Arena;