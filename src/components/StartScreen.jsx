// src/components/StartScreen.jsx
import { BOSS } from '../utils/constants';

function StartScreen({ onStart }) {
  return (
    <div className="game-screen start-screen">

      <div className="start-title">
        <h1>⚔️ Dungeon Crawler ⚔️</h1>
        <p className="start-subtitle">Survive 5 rooms and defeat the dragon!</p>
      </div>

      {/* Boss sprite preview */}
      <div className="start-boss-preview">
        <div
          className="boss-preview-sprite"
          dangerouslySetInnerHTML={{ __html: BOSS.SPRITE }}
        />
        <p className="boss-preview-label">Defeat me if you dare...</p>
      </div>

      {/* Room breakdown */}
      <div className="start-room-info">
        <div className="room-info-item">
          <span className="room-info-icon">👹</span>
          <span>Rooms 1-4: Enemy Waves</span>
        </div>
        <div className="room-info-item">
          <span className="room-info-icon">👑</span>
          <span>Room 5: Boss Fight</span>
        </div>
        <div className="room-info-item">
          <span className="room-info-icon">📈</span>
          <span>Enemies get stronger each room</span>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-info">
        <p className="controls-title">Controls</p>
        <div className="controls-grid">
          <div className="control-item">
            <span className="control-key">WASD</span>
            <span className="control-desc">Move</span>
          </div>
          <div className="control-item">
            <span className="control-key">↑↓←→</span>
            <span className="control-desc">Move</span>
          </div>
          <div className="control-item">
            <span className="control-key">SPACE</span>
            <span className="control-desc">Attack</span>
          </div>
          <div className="control-item">
            <span className="control-key">P / ESC</span>
            <span className="control-desc">Pause</span>
          </div>
        </div>
      </div>

      <button className="start-button" onClick={onStart}>
        ⚔️ Start Game ⚔️
      </button>

    </div>
  );
}

export default StartScreen;