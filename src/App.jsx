// src/App.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { useGameLoop, usePlayerMovement, useCollision, useScreenSize } from './hooks';
import {
  StartScreen,
  GameOver,
  Victory,
  RoomTransition,
  PauseScreen,
  HUD,
  Arena,
} from './components';
import { GAME_STATES, KEYS, WAVES } from './utils/constants';
import { isDead } from './utils/helpers';
import './App.css';

function Game() {
  const { state, actions } = useGame();
  const collision = useCollision();
  const { isMobile, arenaScale } = useScreenSize();

  const [enemiesInRange, setEnemiesInRange] = useState([]);
  const [showDebug, setShowDebug] = useState(true);

  // Refs to avoid stale closures
  const stateRef = useRef(state);
  const lastSpawnTimeRef = useRef(0);
  const removingEnemiesRef = useRef(new Set());

  // Keep ref current
  useEffect(() => {
    stateRef.current = state;
  });

  const isPlaying = state.gameState === GAME_STATES.PLAYING;

  // Keyboard movement
  usePlayerMovement(
    useCallback((keys) => {
      actions.setKeysPressed(keys);
    }, [actions]),
    isPlaying
  );

  // Pause key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (KEYS.PAUSE.includes(e.key)) {
        actions.togglePause();
      }
      // Toggle debug with backtick
      if (e.key === '`') {
        setShowDebug((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);

  // Main game loop
  useGameLoop(
    useCallback((deltaTime) => {
      const currentState = stateRef.current;

      actions.tick();
      actions.updateCooldowns(deltaTime);

      // Update enemies in attack range for highlighting
      if (currentState.player && currentState.enemies.length > 0) {
        const inRange = collision.getEnemiesInAttackRange(
          currentState.player,
          currentState.enemies,
          50
        );
        setEnemiesInRange(inRange);
      } else {
        setEnemiesInRange([]);
      }

      // Enemy spawning
      const now = Date.now();
      const isBossRoom = currentState.currentRoom === 5;
      const maxOnScreen = isBossRoom ? 1 : 5;
      const canSpawn = currentState.enemiesSpawned < currentState.totalEnemiesInRoom;
      const hasRoom = currentState.enemies.length < maxOnScreen;
      const spawnReady = now - lastSpawnTimeRef.current > WAVES.SPAWN_DELAY;

      if (canSpawn && hasRoom && spawnReady) {
        actions.spawnEnemy();
        lastSpawnTimeRef.current = now;
      }
    }, [actions, collision]),
    isPlaying
  );

  // Remove dead enemies
  useEffect(() => {
    const deadEnemies = state.enemies.filter(
      (enemy) => isDead(enemy) && !removingEnemiesRef.current.has(enemy.id)
    );

    deadEnemies.forEach((enemy) => {
      removingEnemiesRef.current.add(enemy.id);
      setTimeout(() => {
        actions.removeEnemy(enemy.id);
        removingEnemiesRef.current.delete(enemy.id);
      }, 100);
    });
  }, [state.enemies, actions]);

  // Room transition
  useEffect(() => {
    if (state.gameState !== GAME_STATES.ROOM_TRANSITION) return;

    const timer = setTimeout(() => {
      actions.nextRoom();
    }, WAVES.ROOM_CLEAR_DELAY);

    return () => clearTimeout(timer);
  }, [state.gameState, actions]);

  // Clear message
  useEffect(() => {
    if (!state.message) return;

    const timer = setTimeout(() => {
      actions.setMessage('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [state.message, actions]);

  // Reset refs on room change
  useEffect(() => {
    lastSpawnTimeRef.current = 0;
    removingEnemiesRef.current.clear();
  }, [state.currentRoom]);

  // Render based on game state
  const renderGameState = () => {
    switch (state.gameState) {
      case GAME_STATES.START:
        return <StartScreen onStart={actions.startGame} />;

      case GAME_STATES.PAUSED:
        return (
          <PauseScreen
            currentRoom={state.currentRoom}
            score={state.score}
            onResume={actions.resumeGame}
            onQuit={actions.resetGame}
          />
        );

      case GAME_STATES.GAME_OVER:
        return (
          <GameOver
            room={state.currentRoom}
            score={state.score}
            time={state.gameTime}
            onRetry={actions.startGame}
            onMenu={actions.resetGame}
          />
        );

      case GAME_STATES.VICTORY:
        return (
          <Victory
            score={state.score}
            time={state.gameTime}
            onPlayAgain={actions.startGame}
            onMenu={actions.resetGame}
          />
        );

      case GAME_STATES.ROOM_TRANSITION:
        return (
          <RoomTransition
            currentRoom={state.currentRoom}
            message={state.message}
          />
        );

      case GAME_STATES.PLAYING:
      default:
        return renderPlaying();
    }
  };

  const renderPlaying = () => {
    return (
      <div className="game-playing">
        {/* HUD */}
        <HUD
          player={state.player}
          currentRoom={state.currentRoom}
          enemiesKilled={state.enemiesKilled}
          totalEnemies={state.totalEnemiesInRoom}
          score={state.score}
          gameTime={state.gameTime}
          message={state.message}
          isMobile={isMobile}
        />

        {/* Arena */}
        <Arena
          player={state.player}
          enemies={state.enemies}
          enemiesInAttackRange={enemiesInRange}
          scale={arenaScale}
          isMobile={isMobile}
        />

        {/* Debug Panel */}
        <div className={`debug-info ${showDebug ? '' : 'hidden'}`}>
          <p>
            Keys:{' '}
            {Object.entries(state.keysPressed)
              .filter(([, v]) => v)
              .map(([k]) => k)
              .join(', ') || 'none'}
            {' | '}
            Player: ({Math.round(state.player?.x ?? 0)}, {Math.round(state.player?.y ?? 0)})
            {' | '}
            Direction: {state.player?.direction}
          </p>
          <p>
            In Range: {enemiesInRange.length}
            {' | '}
            Cooldown: {Math.round(state.attackCooldown)}ms
            {' | '}
            Spawned: {state.enemiesSpawned}/{state.totalEnemiesInRoom}
            {' | '}
            Killed: {state.enemiesKilled}/{state.totalEnemiesInRoom}
          </p>
          <p>
            Screen: {isMobile ? 'Mobile' : 'Desktop'}
            {' | '}
            Scale: {arenaScale.toFixed(2)}
            {' | '}
            Press ` to toggle debug
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="game-container">
      {renderGameState()}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}

export default App;