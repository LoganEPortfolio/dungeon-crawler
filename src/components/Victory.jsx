// src/components/Victory.jsx
import { formatTime } from '../utils/helpers';
import { BOSS } from '../utils/constants';

function Victory({ score, time, onPlayAgain, onMenu }) {
  return (
    <div className="game-screen victory-screen">

      <div className="victory-boss-preview">
        <div
          className="defeated-boss-sprite"
          dangerouslySetInnerHTML={{ __html: BOSS.SPRITE }}
        />
      </div>

      <h2>🏆 Victory! 🏆</h2>
      <p className="screen-flavour">
        The dragon falls! The dungeon is yours!
      </p>

      <div className="stats-panel">
        <div className="stat-row">
          <span className="stat-label">🏰 Rooms Cleared</span>
          <span className="stat-value">5 / 5</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">🏆 Final Score</span>
          <span className="stat-value gold">{score}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">⏱️ Completion Time</span>
          <span className="stat-value">{formatTime(time)}</span>
        </div>
      </div>

      <div className="screen-buttons">
        <button className="btn-primary" onClick={onPlayAgain}>
          ⚔️ Play Again
        </button>
        <button className="btn-secondary" onClick={onMenu}>
          🏠 Main Menu
        </button>
      </div>

    </div>
  );
}

export default Victory;