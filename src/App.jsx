// src/App.jsx
import { useEffect, useCallback, useState, useRef } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { useGameLoop, usePlayerMovement, useCollision } from './hooks';
import { GAME_STATES, ARENA, KEYS, WAVES } from './utils/constants';
import {
  getHealthPercentage,
  getHealthBarColor,
  formatTime,
  isBossRoom,
  isDead,
} from './utils/helpers';
import './App.css';

function GameTest() {
  const { state, actions } = useGame();
  const collision = useCollision();

  const [debugInfo, setDebugInfo] = useState({
    enemiesInRange: 0,
    closestEnemyDist: null,
  });

  // Refs to avoid stale closures in game loop
  const stateRef = useRef(state);
  const lastSpawnTimeRef = useRef(0);
  const removingEnemiesRef = useRef(new Set());

  // Keep stateRef current every render
  useEffect(() => {
    stateRef.current = state;
  });

  const isPlaying = state.gameState === GAME_STATES.PLAYING;

  // Player movement hook - enabled only when playing
  usePlayerMovement(
    useCallback((keys) => {
      actions.setKeysPressed(keys);
    }, [actions]),
    isPlaying
  );

  // Pause key - works in any state
  useEffect(() => {
    const handlePause = (e) => {
      if (KEYS.PAUSE.includes(e.key)) {
        actions.togglePause();
      }
    };
    window.addEventListener('keydown', handlePause);
    return () => window.removeEventListener('keydown', handlePause);
  }, [actions]);

  // Main game loop - actions is stable so this never re-creates unnecessarily
  useGameLoop(
    useCallback((deltaTime) => {
      // Read state from ref to avoid stale closure without adding state to deps
      const currentState = stateRef.current;

      actions.tick();
      actions.updateCooldowns(deltaTime);

      // Update debug info
      if (currentState.player && currentState.enemies.length > 0) {
        const inRange = collision.getEnemiesInAttackRange(
          currentState.player,
          currentState.enemies,
          50
        );
        const closest = collision.getClosestEnemy(
          currentState.player,
          currentState.enemies
        );
        setDebugInfo({
          enemiesInRange: inRange.length,
          closestEnemyDist: closest
            ? Math.round(collision.getEntityDistance(currentState.player, closest))
            : null,
        });
      } else {
        setDebugInfo({ enemiesInRange: 0, closestEnemyDist: null });
      }

      // Enemy spawning inside game loop using ref values - no extra deps needed
      const now = Date.now();
      const maxOnScreen = isBossRoom(currentState.currentRoom) ? 1 : 5;
      const canSpawn = currentState.enemiesSpawned < currentState.totalEnemiesInRoom;
      const hasRoomOnScreen = currentState.enemies.length < maxOnScreen;
      const spawnReady = now - lastSpawnTimeRef.current > WAVES.SPAWN_DELAY;

      if (canSpawn && hasRoomOnScreen && spawnReady) {
        actions.spawnEnemy();
        lastSpawnTimeRef.current = now;
      }
    }, [actions, collision]), // actions and collision are both stable
    isPlaying
  );

  // Remove dead enemies - use removingEnemiesRef to prevent duplicate removals
  useEffect(() => {
    const deadEnemies = state.enemies.filter(
      (enemy) => isDead(enemy) && !removingEnemiesRef.current.has(enemy.id)
    );

    deadEnemies.forEach((enemy) => {
      // Mark as being removed so we don't queue it again
      removingEnemiesRef.current.add(enemy.id);

      setTimeout(() => {
        actions.removeEnemy(enemy.id);
        removingEnemiesRef.current.delete(enemy.id);
      }, 100);
    });
  }, [state.enemies, actions]);

  // Room transition - only watch gameState, not actions
  useEffect(() => {
    if (state.gameState !== GAME_STATES.ROOM_TRANSITION) return;

    console.log('Room transition started, moving to next room in', WAVES.ROOM_CLEAR_DELAY, 'ms');

    const timer = setTimeout(() => {
      actions.nextRoom();
    }, WAVES.ROOM_CLEAR_DELAY);

    return () => clearTimeout(timer);
  }, [state.gameState, actions]);

  // Clear message after delay - only re-run when message actually changes
  useEffect(() => {
    if (!state.message) return;

    const timer = setTimeout(() => {
      actions.setMessage('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [state.message, actions]);

  // Reset spawn tracking when room changes
  useEffect(() => {
    lastSpawnTimeRef.current = 0;
    removingEnemiesRef.current.clear();
  }, [state.currentRoom]);

  // Render functions
  const renderGameState = () => {
    switch (state.gameState) {
      case GAME_STATES.START:
        return (
          <div className="game-screen start-screen">
            <h2>⚔️ Dungeon Crawler ⚔️</h2>
            <p>Survive 5 rooms and defeat the dragon boss!</p>
            <div className="controls-info">
              <p><strong>Controls</strong></p>
              <p>WASD / Arrow Keys — Move</p>
              <p>Space — Attack</p>
              <p>P / Escape — Pause</p>
            </div>
            <button onClick={actions.startGame}>Start Game</button>
          </div>
        );

      case GAME_STATES.PAUSED:
        return (
          <div className="game-screen pause-screen">
            <h2>⏸️ Paused</h2>
            <p>Room {state.currentRoom} | Score: {state.score}</p>
            <button onClick={actions.resumeGame}>Resume</button>
            <button onClick={actions.resetGame}>Quit to Menu</button>
          </div>
        );

      case GAME_STATES.GAME_OVER:
        return (
          <div className="game-screen gameover-screen">
            <h2>💀 Game Over 💀</h2>
            <p>Room Reached: {state.currentRoom}</p>
            <p>Final Score: {state.score}</p>
            <p>Time Survived: {formatTime(state.gameTime)}</p>
            <button onClick={actions.startGame}>Try Again</button>
            <button onClick={actions.resetGame}>Main Menu</button>
          </div>
        );

      case GAME_STATES.VICTORY:
        return (
          <div className="game-screen victory-screen">
            <h2>🏆 Victory! 🏆</h2>
            <p>You defeated the dragon!</p>
            <p>Final Score: {state.score}</p>
            <p>Time: {formatTime(state.gameTime)}</p>
            <button onClick={actions.startGame}>Play Again</button>
            <button onClick={actions.resetGame}>Main Menu</button>
          </div>
        );

      case GAME_STATES.ROOM_TRANSITION:
        return (
          <div className="game-screen transition-screen">
            <h2>✨ {state.message} ✨</h2>
            {state.currentRoom < 5 && (
              <p>Prepare for Room {state.currentRoom + 1}...</p>
            )}
            {isBossRoom(state.currentRoom + 1) && (
              <p className="boss-warning">🐉 BOSS INCOMING 🐉</p>
            )}
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
              <span className="health-label">❤️</span>
              <div className="health-bar large">
                <div
                  className="health-bar-fill"
                  style={{
                    width: `${playerHealthPct}%`,
                    backgroundColor: getHealthBarColor(playerHealthPct),
                  }}
                />
              </div>
              <span className="health-text">
                {state.player?.health ?? 0}/{state.player?.maxHealth ?? 0}
              </span>
            </div>
          </div>

          <div className="hud-center">
            <span className="room-indicator">
              {isBossRoom(state.currentRoom) ? '👑 ' : ''}
              Room {state.currentRoom}/5
              {isBossRoom(state.currentRoom) ? ' 👑' : ''}
            </span>
            {state.message && (
              <span className="game-message">{state.message}</span>
            )}
          </div>

          <div className="hud-right">
            <span>🏆 {state.score}</span>
            <span>⏱️ {formatTime(state.gameTime)}</span>
            <span>👹 {state.enemiesKilled}/{state.totalEnemiesInRoom}</span>
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
              className={`entity player
                ${state.player.isAttacking ? 'attacking' : ''}
                ${state.player.isHit ? 'hit' : ''}
              `}
              style={{
                width: state.player.size,
                height: state.player.size,
                left: state.player.x,
                top: state.player.y,
                transform:
                  state.player.direction === 'left'
                    ? 'scaleX(-1)'
                    : 'scaleX(1)',
              }}
              dangerouslySetInnerHTML={{ __html: state.player.sprite }}
            />
          )}

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

          {/* Enemies */}
          {state.enemies.map((enemy) => {
            const enemyHealthPct = getHealthPercentage(
              enemy.health,
              enemy.maxHealth
            );
            const isInRange =
              state.player &&
              collision.getEnemiesInAttackRange(state.player, [enemy], 50)
                .length > 0;

            return (
              <div
                key={enemy.id}
                className={`entity enemy ${enemy.type}
                  ${enemy.isHit ? 'hit' : ''}
                  ${isDead(enemy) ? 'dead' : ''}
                `}
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
                <div className={`enemy-health-bar ${isInRange ? 'in-range' : ''}`}>
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
        </div>

        {/* Debug panel */}
        <div className="debug-info">
          <p>
            Keys:{' '}
            {Object.entries(state.keysPressed)
              .filter(([, v]) => v)
              .map(([k]) => k)
              .join(', ') || 'none'}
          </p>
          <p>
            Player: ({Math.round(state.player?.x ?? 0)},{' '}
            {Math.round(state.player?.y ?? 0)}) | Dir: {state.player?.direction}
          </p>
          <p>
            In Range: {debugInfo.enemiesInRange} | Closest:{' '}
            {debugInfo.closestEnemyDist ?? 'N/A'}px | Cooldown:{' '}
            {Math.round(state.attackCooldown)}ms
          </p>
          <p>
            Spawned: {state.enemiesSpawned}/{state.totalEnemiesInRoom} | Killed:{' '}
            {state.enemiesKilled}/{state.totalEnemiesInRoom} | On Screen:{' '}
            {state.enemies.length}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="game-container">
      <h1>⚔️ Dungeon Crawler ⚔️</h1>
      {renderGameState()}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameTest />
    </GameProvider>
  );
}

export default App;