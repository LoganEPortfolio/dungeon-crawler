// src/App.jsx
import { useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { GAME_STATES, ARENA } from './utils/constants';
import {
  getHealthPercentage,
  getHealthBarColor,
  formatTime,
  isBossRoom,
} from './utils/helpers';
import './App.css';

// Separate component that uses the context
function GameTest() {
  const { state, actions } = useGame();

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          actions.setKeysPressed({ up: true });
          break;
        case 's':
        case 'arrowdown':
          actions.setKeysPressed({ down: true });
          break;
        case 'a':
        case 'arrowleft':
          actions.setKeysPressed({ left: true });
          break;
        case 'd':
        case 'arrowright':
          actions.setKeysPressed({ right: true });
          break;
        case ' ':
          e.preventDefault();
          actions.setKeysPressed({ attack: true });
          break;
        case 'escape':
        case 'p':
          actions.togglePause();
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
        case 'arrowup':
          actions.setKeysPressed({ up: false });
          break;
        case 's':
        case 'arrowdown':
          actions.setKeysPressed({ down: false });
          break;
        case 'a':
        case 'arrowleft':
          actions.setKeysPressed({ left: false });
          break;
        case 'd':
        case 'arrowright':
          actions.setKeysPressed({ right: false });
          break;
        case ' ':
          actions.setKeysPressed({ attack: false });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [actions]);

  // Game loop
  useEffect(() => {
    if (state.gameState !== GAME_STATES.PLAYING) return;

    const gameLoop = setInterval(() => {
      actions.tick();
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, [state.gameState, actions]);

  // Enemy spawning
  useEffect(() => {
    if (state.gameState !== GAME_STATES.PLAYING) return;
    if (state.enemiesSpawned >= state.enemiesRemaining + state.enemies.length) return;

    const spawnInterval = setInterval(() => {
      if (state.enemies.length < 5) { // Max 5 enemies at once
        actions.spawnEnemy();
      }
    }, 1500);

    return () => clearInterval(spawnInterval);
  }, [state.gameState, state.enemiesSpawned, state.enemies.length, actions]);

  // Remove dead enemies
  useEffect(() => {
    state.enemies.forEach((enemy) => {
      if (enemy.health <= 0) {
        actions.removeEnemy(enemy.id);
      }
    });
  }, [state.enemies, actions]);

  // Room transition
  useEffect(() => {
    if (state.gameState !== GAME_STATES.ROOM_TRANSITION) return;

    const timer = setTimeout(() => {
      actions.nextRoom();
    }, 2000);

    return () => clearTimeout(timer);
  }, [state.gameState, actions]);

  // Render based on game state
  const renderGameState = () => {
    switch (state.gameState) {
      case GAME_STATES.START:
        return (
          <div className="game-screen start-screen">
            <h2>Dungeon Crawler</h2>
            <p>Survive 5 rooms and defeat the boss!</p>
            <div className="controls-info">
              <p><strong>Controls:</strong></p>
              <p>WASD / Arrow Keys - Move</p>
              <p>Space - Attack</p>
              <p>P / Escape - Pause</p>
            </div>
            <button onClick={actions.startGame}>Start Game</button>
          </div>
        );

      case GAME_STATES.PAUSED:
        return (
          <div className="game-screen pause-screen">
            <h2>Paused</h2>
            <button onClick={actions.resumeGame}>Resume</button>
            <button onClick={actions.resetGame}>Quit to Menu</button>
          </div>
        );

      case GAME_STATES.GAME_OVER:
        return (
          <div className="game-screen gameover-screen">
            <h2>Game Over</h2>
            <p>Room Reached: {state.currentRoom}</p>
            <p>Score: {state.score}</p>
            <p>Time: {formatTime(state.gameTime)}</p>
            <button onClick={actions.resetGame}>Try Again</button>
          </div>
        );

      case GAME_STATES.VICTORY:
        return (
          <div className="game-screen victory-screen">
            <h2>Victory!</h2>
            <p>You defeated the boss!</p>
            <p>Final Score: {state.score}</p>
            <p>Time: {formatTime(state.gameTime)}</p>
            <button onClick={actions.resetGame}>Play Again</button>
          </div>
        );

      case GAME_STATES.ROOM_TRANSITION:
        return (
          <div className="game-screen transition-screen">
            <h2>{state.message}</h2>
            <p>Prepare for Room {state.currentRoom + 1}...</p>
            {isBossRoom(state.currentRoom + 1) && <p className="boss-warning">⚠️ BOSS INCOMING ⚠️</p>}
          </div>
        );

      case GAME_STATES.PLAYING:
      default:
        return renderPlaying();
    }
  };

  const renderPlaying = () => {
    const playerHealthPct = state.player
      ? getHealthPercentage(state.player.health, state.player.maxHealth)
      : 0;

    return (
      <div className="game-playing">
        {/* HUD */}
        <div className="hud">
          <div className="hud-left">
            <div className="health-section">
              <span>HP</span>
              <div className="health-bar large">
                <div
                  className="health-bar-fill"
                  style={{
                    width: `${playerHealthPct}%`,
                    backgroundColor: getHealthBarColor(playerHealthPct),
                  }}
                />
              </div>
              <span>{state.player?.health || 0}/{state.player?.maxHealth || 0}</span>
            </div>
          </div>
          <div className="hud-center">
            <span className="room-indicator">
              Room {state.currentRoom}/{ARENA.TOTAL || 5}
              {isBossRoom(state.currentRoom) && ' 👑'}
            </span>
            {state.message && <span className="game-message">{state.message}</span>}
          </div>
          <div className="hud-right">
            <span>Score: {state.score}</span>
            <span>Time: {formatTime(state.gameTime)}</span>
            <span>Enemies: {state.enemies.length}</span>
          </div>
        </div>

        {/* Arena */}
        <div
          className="arena"
          style={{
            width: ARENA.WIDTH,
            height: ARENA.HEIGHT,
            backgroundColor: ARENA.BACKGROUND_COLOR,
            border: `${ARENA.BORDER_WIDTH}px solid ${ARENA.BORDER_COLOR}`,
          }}
        >
          {/* Player */}
          {state.player && (
            <div
              className={`entity player ${state.player.isAttacking ? 'attacking' : ''} ${state.player.isHit ? 'hit' : ''}`}
              style={{
                width: state.player.size,
                height: state.player.size,
                left: state.player.x,
                top: state.player.y,
                transform: state.player.direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
              }}
              dangerouslySetInnerHTML={{ __html: state.player.sprite }}
            />
          )}

          {/* Enemies */}
          {state.enemies.map((enemy) => {
            const enemyHealthPct = getHealthPercentage(enemy.health, enemy.maxHealth);
            return (
              <div
                key={enemy.id}
                className={`entity enemy ${enemy.type} ${enemy.isHit ? 'hit' : ''}`}
                style={{
                  width: enemy.size,
                  height: enemy.size,
                  left: enemy.x,
                  top: enemy.y,
                }}
              >
                <div
                  className="enemy-sprite"
                  dangerouslySetInnerHTML={{ __html: enemy.sprite }}
                />
                <div className="enemy-health-bar">
                  <div
                    className="enemy-health-fill"
                    style={{
                      width: `${enemyHealthPct}%`,
                      backgroundColor: getHealthBarColor(enemyHealthPct),
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Attack indicator */}
          {state.player?.isAttacking && (
            <div
              className="attack-indicator"
              style={{
                left: state.player.x + state.player.size / 2,
                top: state.player.y + state.player.size / 2,
              }}
            />
          )}
        </div>

        {/* Debug Info */}
        <div className="debug-info">
          <p>Keys: {Object.entries(state.keysPressed).filter(([_, v]) => v).map(([k]) => k).join(', ') || 'none'}</p>
          <p>Player Pos: ({Math.round(state.player?.x || 0)}, {Math.round(state.player?.y || 0)})</p>
          <p>Attack Cooldown: {Math.round(state.attackCooldown)}ms</p>
        </div>
      </div>
    );
  };

  return (
    <div className="game-container">
      <h1>Dungeon Crawler - Context Test</h1>
      {renderGameState()}
    </div>
  );
}

// Main App with Provider
function App() {
  return (
    <GameProvider>
      <GameTest />
    </GameProvider>
  );
}

export default App;