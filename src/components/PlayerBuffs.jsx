// src/components/PlayerBuffs.jsx
import { memo } from 'react';

const PlayerBuffs = memo(function PlayerBuffs({ buffs, weapon }) {
  if ((!buffs || buffs.length === 0) && !weapon) return null;

  const getBuffIcon = (stat) => {
    switch (stat) {
      case 'speed': return '💨';
      case 'damage': return '💪';
      case 'defense': return '🛡️';
      default: return '✨';
    }
  };

  const getWeaponIcon = (effect) => {
    switch (effect) {
      case 'burn': return '🔥';
      case 'slow': return '❄️';
      case 'chain': return '⚡';
      default: return '⚔️';
    }
  };

  const getRemainingTime = (expiresAt) => {
    const remaining = Math.max(0, expiresAt - Date.now());
    return Math.ceil(remaining / 1000);
  };

  return (
    <div className="player-buffs">
      {/* Active weapon */}
      {weapon && (
        <div className="buff-item weapon-buff" title={weapon.name}>
          <span className="buff-icon">{getWeaponIcon(weapon.effect)}</span>
          <span className="buff-name">{weapon.name}</span>
        </div>
      )}

      {/* Active buffs */}
      {buffs.map((buff) => (
        <div 
          key={buff.id} 
          className="buff-item"
          title={buff.name}
        >
          <span className="buff-icon">{getBuffIcon(buff.stat)}</span>
          <span className="buff-timer">{getRemainingTime(buff.expiresAt)}s</span>
        </div>
      ))}
    </div>
  );
});

export default PlayerBuffs;