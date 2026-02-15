// src/components/HUD.jsx
import { getHealthPercentage, getHealthBarColor, formatTime, isBossRoom } from '../utils/helpers';

function HUD({ player, currentRoom, enemiesKilled, totalEnemies, score, gameTime, message, isMobile }) {
  const healthPct = player ? getHealthPercentage(player.health, player.maxHealth) : 0;
  const healthColor = getHealthBarColor(healthPct);
  const inBossRoom = isBossRoom(currentRoom);

  return (
    <div className={`hud ${isMobile ? 'hud-mobile' : ''}`}>

      {/* Left - Health */}
      <div className="hud-left">
        <div className="health-section">
          <span className="health-label">❤️</span>
          <div className="health-bar large">
            <div
              className="health-bar-fill"
              style={{
                width: `${healthPct}%`,
                backgroundColor: healthColor,
              }}
            />
          </div>
          <span className="health-text">
            {player?.health ?? 0}/{player?.maxHealth ?? 0}
          </span>
        </div>
      </div>

      {/* Center - Room */}
      <div className="hud-center">
        <span className="room-indicator">
          {inBossRoom && '👑 '}
          Room {currentRoom}/5
          {inBossRoom && ' 👑'}
        </span>
        {message && <span className="game-message">{message}</span>}
      </div>

      {/* Right - Stats */}
      <div className="hud-right">
        <span className="hud-stat">🏆 {score}</span>
        <span className="hud-stat">⏱️ {formatTime(gameTime)}</span>
        <span className="hud-stat">
          👹 {enemiesKilled}/{totalEnemies}
        </span>
      </div>

    </div>
  );
}

export default HUD;