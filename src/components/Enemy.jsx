// src/components/Enemy.jsx
import { memo } from 'react';
import { getHealthPercentage, getHealthBarColor, isDead } from '../utils/helpers';

const Enemy = memo(function Enemy({ enemy, isInAttackRange }) {
  if (!enemy) return null;

  const { id, x, y, size, sprite, type, health, maxHealth, isHit, statusEffects } = enemy;
  const healthPct = getHealthPercentage(health, maxHealth);
  const healthColor = getHealthBarColor(healthPct);
  const dead = isDead(enemy);

  // Check for status effects
  const isBurning = statusEffects?.some(e => e.type === 'burn');
  const isSlowed = statusEffects?.some(e => e.type === 'slow');

  // Build class names
  const classNames = [
    'entity',
    'enemy',
    type,
    isHit ? 'hit' : '',
    dead ? 'dead' : '',
    isBurning ? 'burning' : '',
    isSlowed ? 'slowed' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
      }}
      data-enemy-id={id}
    >
      <div
        className="enemy-sprite"
        dangerouslySetInnerHTML={{ __html: sprite }}
      />

      {/* Health bar */}
      <div className={`enemy-health-bar ${isInAttackRange ? 'in-range' : ''}`}>
        <div
          className="enemy-health-fill"
          style={{
            width: `${healthPct}%`,
            backgroundColor: healthColor,
          }}
        />
      </div>

      {/* Boss label */}
      {type === 'boss' && (
        <div className="boss-label">BOSS</div>
      )}

      {/* Status effect indicators */}
      {(isBurning || isSlowed) && (
        <div className="status-indicators">
          {isBurning && <span className="status-icon">🔥</span>}
          {isSlowed && <span className="status-icon">❄️</span>}
        </div>
      )}
    </div>
  );
});

export default Enemy;