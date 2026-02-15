// src/components/GameOver.jsx
import { formatTime } from '../utils/helpers';
import { ENEMY_SPRITES } from '../utils/sprites';

function GameOver({ room, score, time, onRetry, onMenu }) {
  return (
    <div className="game-screen gameover-screen">

      <div className="screen-icon-row">
        {/* Show a few enemy sprites as taunts */}
        {ENEMY_SPRITES.slice(0, 3).map((sprite, i) => (
          <div
            key={i}
            className="taunt-sprite"
            style={{ animationDelay: `${i * 0.2}s` }}
            dangerouslySetInnerHTML={{ __html: sprite }}
          />
        ))}
      </div>

      <h2>💀 Game Over 💀</h2>
      <p className="screen-flavour">
        The dungeon claims another soul...
      </p>

      <div className="stats-panel">
        <div className="stat-row">
          <span className="stat-label">🏰 Room Reached</span>
          <span className="stat-value">{room} / 5</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">🏆 Score</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">⏱️ Time Survived</span>
          <span className="stat-value">{formatTime(time)}</span>
        </div>
      </div>

      <div className="screen-buttons">
        <button className="btn-primary" onClick={onRetry}>
          ⚔️ Try Again
        </button>
        <button className="btn-secondary" onClick={onMenu}>
          🏠 Main Menu
        </button>
      </div>

    </div>
  );
}

export default GameOver;