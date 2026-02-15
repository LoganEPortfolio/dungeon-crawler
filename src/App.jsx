// src/App.jsx
import { ARENA, PLAYER, ENEMY, BOSS, EFFECTS } from './utils/constants';
import { getEnemySpriteByDifficulty } from './utils/sprites';
import './App.css';

function App() {
  return (
    <div className="test-container">
      <h1>Dungeon Crawler - Sprite Test</h1>
      
      <div className="test-section">
        <h2>Arena Preview</h2>
        <div 
          className="arena-preview"
          style={{
            width: '200px',
            height: '150px',
            backgroundColor: ARENA.BACKGROUND_COLOR,
            border: `${ARENA.BORDER_WIDTH}px solid ${ARENA.BORDER_COLOR}`,
          }}
        />
      </div>

      <div className="test-section">
        <h2>Player</h2>
        <p>Health: {PLAYER.MAX_HEALTH} | Speed: {PLAYER.SPEED} | Damage: {PLAYER.ATTACK_DAMAGE}</p>
        <div 
          className="sprite-container"
          style={{ width: PLAYER.SIZE * 2, height: PLAYER.SIZE * 2 }}
          dangerouslySetInnerHTML={{ __html: PLAYER.SPRITE }}
        />
      </div>

      <div className="test-section">
        <h2>Enemies by Room Difficulty</h2>
        <div className="sprite-row">
          {[1, 2, 3, 4].map((room) => (
            <div key={room} className="sprite-card">
              <p>Room {room}</p>
              <div 
                className="sprite-container"
                style={{ width: ENEMY.SIZE * 2, height: ENEMY.SIZE * 2 }}
                dangerouslySetInnerHTML={{ __html: getEnemySpriteByDifficulty(room) }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="test-section">
        <h2>Boss (Room 5)</h2>
        <p>Health: {BOSS.HEALTH} | Speed: {BOSS.SPEED} | Damage: {BOSS.DAMAGE}</p>
        <div 
          className="sprite-container boss"
          style={{ width: BOSS.SIZE * 2, height: BOSS.SIZE * 2 }}
          dangerouslySetInnerHTML={{ __html: BOSS.SPRITE }}
        />
      </div>

      <div className="test-section">
        <h2>Effects</h2>
        <div className="sprite-row">
          <div className="sprite-card">
            <p>Attack</p>
            <div 
              className="sprite-container"
              style={{ width: 50, height: 50 }}
              dangerouslySetInnerHTML={{ __html: EFFECTS.ATTACK_SLASH }}
            />
          </div>
          <div className="sprite-card">
            <p>Health</p>
            <div 
              className="sprite-container"
              style={{ width: 30, height: 30 }}
              dangerouslySetInnerHTML={{ __html: EFFECTS.HEALTH_PICKUP }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;