// src/App.jsx
import { useState, useEffect } from 'react';
import { ARENA, PLAYER, ENEMY } from './utils/constants';
import {
  createPlayer,
  createEnemy,
  createBoss,
  getDistance,
  checkCollision,
  checkAttackHit,
  moveTowardsPlayer,
  applyDamage,
  getHealthPercentage,
  getHealthBarColor,
  getEnemyStatsForRoom,
  formatTime,
  getEnemyCountForRoom,
  isBossRoom,
} from './utils/helpers';
import './App.css';

function App() {
  const [player, setPlayer] = useState(createPlayer());
  const [testEnemy, setTestEnemy] = useState(null);
  const [testBoss, setTestBoss] = useState(null);
  const [collisionResult, setCollisionResult] = useState(false);
  const [attackResult, setAttackResult] = useState(false);

  // Create test enemy and boss on mount
  useEffect(() => {
    setTestEnemy(createEnemy(player.x, player.y, 3));
    setTestBoss(createBoss(player.x, player.y));
  }, []);

  // Test collision and attack when enemy exists
  useEffect(() => {
    if (testEnemy) {
      setCollisionResult(checkCollision(player, testEnemy));
      setAttackResult(checkAttackHit(player, testEnemy));
    }
  }, [player, testEnemy]);

  // Handle moving enemy towards player
  const handleMoveEnemy = () => {
    if (testEnemy) {
      setTestEnemy(moveTowardsPlayer(testEnemy, player.x, player.y));
    }
  };

  // Handle damaging enemy
  const handleDamageEnemy = () => {
    if (testEnemy) {
      setTestEnemy(applyDamage(testEnemy, PLAYER.ATTACK_DAMAGE));
    }
  };

  // Handle damaging player
  const handleDamagePlayer = () => {
    setPlayer(applyDamage(player, ENEMY.BASE_DAMAGE));
  };

  // Reset test
  const handleReset = () => {
    setPlayer(createPlayer());
    setTestEnemy(createEnemy(player.x, player.y, 3));
    setTestBoss(createBoss(player.x, player.y));
  };

  const playerHealthPct = getHealthPercentage(player.health, player.maxHealth);
  const enemyHealthPct = testEnemy ? getHealthPercentage(testEnemy.health, testEnemy.maxHealth) : 100;
  const bossHealthPct = testBoss ? getHealthPercentage(testBoss.health, testBoss.maxHealth) : 100;

  return (
    <div className="test-container">
      <h1>Dungeon Crawler - Helpers Test</h1>

      {/* Entity Creation Test */}
      <div className="test-section">
        <h2>Entity Creation</h2>
        <div className="test-grid">
          <div className="test-card">
            <h3>Player</h3>
            <div 
              className="sprite-container"
              style={{ width: 50, height: 50 }}
              dangerouslySetInnerHTML={{ __html: player.sprite }}
            />
            <p>Pos: ({Math.round(player.x)}, {Math.round(player.y)})</p>
            <p>Health: {player.health}/{player.maxHealth}</p>
            <div className="health-bar">
              <div 
                className="health-bar-fill"
                style={{ 
                  width: `${playerHealthPct}%`,
                  backgroundColor: getHealthBarColor(playerHealthPct)
                }}
              />
            </div>
          </div>

          {testEnemy && (
            <div className="test-card">
              <h3>Enemy (Room 3)</h3>
              <div 
                className="sprite-container"
                style={{ width: 50, height: 50 }}
                dangerouslySetInnerHTML={{ __html: testEnemy.sprite }}
              />
              <p>Pos: ({Math.round(testEnemy.x)}, {Math.round(testEnemy.y)})</p>
              <p>Health: {testEnemy.health}/{testEnemy.maxHealth}</p>
              <div className="health-bar">
                <div 
                  className="health-bar-fill"
                  style={{ 
                    width: `${enemyHealthPct}%`,
                    backgroundColor: getHealthBarColor(enemyHealthPct)
                  }}
                />
              </div>
            </div>
          )}

          {testBoss && (
            <div className="test-card">
              <h3>Boss</h3>
              <div 
                className="sprite-container"
                style={{ width: 80, height: 80 }}
                dangerouslySetInnerHTML={{ __html: testBoss.sprite }}
              />
              <p>Pos: ({Math.round(testBoss.x)}, {Math.round(testBoss.y)})</p>
              <p>Health: {testBoss.health}/{testBoss.maxHealth}</p>
              <div className="health-bar">
                <div 
                  className="health-bar-fill"
                  style={{ 
                    width: `${bossHealthPct}%`,
                    backgroundColor: getHealthBarColor(bossHealthPct)
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Collision & Distance Test */}
      <div className="test-section">
        <h2>Collision & Distance Detection</h2>
        {testEnemy && (
          <>
            <p>Distance to enemy: {Math.round(getDistance(player.x, player.y, testEnemy.x, testEnemy.y))}px</p>
            <p>
              Collision: 
              <span className={collisionResult ? 'status-true' : 'status-false'}>
                {collisionResult ? ' YES' : ' NO'}
              </span>
            </p>
            <p>
              In Attack Range: 
              <span className={attackResult ? 'status-true' : 'status-false'}>
                {attackResult ? ' YES' : ' NO'}
              </span>
            </p>
          </>
        )}
      </div>

      {/* Room Stats Test */}
      <div className="test-section">
        <h2>Room Configuration</h2>
        <div className="room-stats">
          {[1, 2, 3, 4, 5].map((room) => {
            const stats = getEnemyStatsForRoom(room);
            return (
              <div key={room} className="room-card">
                <h3>Room {room} {isBossRoom(room) ? '👑' : ''}</h3>
                <p>Enemies: {getEnemyCountForRoom(room)}</p>
                {!isBossRoom(room) && (
                  <>
                    <p>Enemy HP: {stats.health}</p>
                    <p>Enemy DMG: {stats.damage}</p>
                    <p>Enemy SPD: {stats.speed.toFixed(1)}</p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Utility Functions Test */}
      <div className="test-section">
        <h2>Utility Functions</h2>
        <p>Format Time (125 seconds): {formatTime(125)}</p>
        <p>Format Time (59 seconds): {formatTime(59)}</p>
        <p>Format Time (3661 seconds): {formatTime(3661)}</p>
      </div>

      {/* Interactive Test Buttons */}
      <div className="test-section">
        <h2>Interactive Tests</h2>
        <div className="button-row">
          <button onClick={handleMoveEnemy}>
            Move Enemy Towards Player
          </button>
          <button onClick={handleDamageEnemy}>
            Damage Enemy (-{PLAYER.ATTACK_DAMAGE})
          </button>
          <button onClick={handleDamagePlayer}>
            Damage Player (-{ENEMY.BASE_DAMAGE})
          </button>
          <button onClick={handleReset}>
            Reset All
          </button>
        </div>
      </div>

      {/* Mini Arena Preview */}
      <div className="test-section">
        <h2>Mini Arena Preview</h2>
        <div 
          className="mini-arena"
          style={{
            width: ARENA.WIDTH / 2,
            height: ARENA.HEIGHT / 2,
            backgroundColor: ARENA.BACKGROUND_COLOR,
            border: `${ARENA.BORDER_WIDTH}px solid ${ARENA.BORDER_COLOR}`,
          }}
        >
          {/* Player marker */}
          <div 
            className="entity-marker player-marker"
            style={{
              width: PLAYER.SIZE / 2,
              height: PLAYER.SIZE / 2,
              left: player.x / 2,
              top: player.y / 2,
            }}
            title="Player"
          />
          
          {/* Enemy marker */}
          {testEnemy && (
            <div 
              className="entity-marker enemy-marker"
              style={{
                width: ENEMY.SIZE / 2,
                height: ENEMY.SIZE / 2,
                left: testEnemy.x / 2,
                top: testEnemy.y / 2,
              }}
              title="Enemy"
            />
          )}

          {/* Boss marker */}
          {testBoss && (
            <div 
              className="entity-marker boss-marker"
              style={{
                width: testBoss.size / 2,
                height: testBoss.size / 2,
                left: testBoss.x / 2,
                top: testBoss.y / 2,
              }}
              title="Boss"
            />
          )}
        </div>
        <p className="arena-legend">
          <span className="legend-player">● Player</span>
          <span className="legend-enemy">■ Enemy</span>
          <span className="legend-boss">■ Boss</span>
        </p>
      </div>
    </div>
  );
}

export default App;