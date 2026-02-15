// src/components/Game.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useGameLoop, usePlayerMovement, useCollision, useScreenSize } from '../hooks';
import {
  StartScreen,
  GameOver,
  Victory,
  RoomTransition,
  PauseScreen,
  HUD,
  Arena,
  TouchControls,
} from './index';
import { GAME_STATES, KEYS, WAVES } from '../utils/constants';
import { isDead, isBossRoom } from '../utils/helpers';

function Game() {
  const { state, actions } = useGame();
  const collision = useCollision();
  const { isMobile, arenaScale } = useScreenSize();

  // Track which enemies are in attack range for UI highlighting
  const [enemiesInRange, setEnemiesInRange] = useState([]);

  // Show debug panel on desktop
  const [showDebug, setShowDebug] = useState(false);

  // Refs to avoid stale closures in game loop
  const stateRef = useRef(state);
  const lastSpawnTimeRef = useRef(0);
  const removingEnemiesRef = useRef(new Set());

  // Always keep stateRef pointing at latest state
  useEffect(() => {
    stateRef.current = state;
  });

  // ─── Derived state ──────────────────────────────────────────────
  const isPlaying = state.gameState === GAME_STATES.PLAYING;
  const isInBossRoom = isBossRoom(state.currentRoom);

  // ─── Keyboard: Movement (desktop only) ─────────────────────────
  usePlayerMovement(
    useCallback((keys) => {
      actions.setKeysPressed(keys);
    }, [actions]),
    isPlaying && !isMobile
  );

  // ─── Keyboard: Pause + Debug toggle ────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (KEYS.PAUSE.includes(e.key)) {
        actions.togglePause();
      }
      if (e.key === '`' && !isMobile) {
        setShowDebug((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions, isMobile]);

  // ─── Touch: Movement ────────────────────────────────────────────
  const handleTouchMove = useCallback((keys) => {
    if (!isMobile) return;
    // Merge movement keys while preserving current attack state
    actions.setKeysPressed({
      ...keys,
      attack: stateRef.current.keysPressed.attack,
    });
  }, [actions, isMobile]);

  // ─── Touch: Attack ──────────────────────────────────────────────
  const handleTouchAttack = useCallback((isAttacking) => {
    if (!isMobile) return;
    actions.setKeysPressed({ attack: isAttacking });
  }, [actions, isMobile]);

  // ─── Main Game Loop ─────────────────────────────────────────────
  useGameLoop(
    useCallback((deltaTime) => {
      const s = stateRef.current;

      // Core tick - movement, attacks, collisions
      actions.tick();

      // Cooldown timers
      actions.updateCooldowns(deltaTime);

      // Update which enemies are highlighted (in attack range)
      if (s.player && s.enemies.length > 0) {
        const inRange = collision.getEnemiesInAttackRange(
          s.player,
          s.enemies,
          50
        );
        setEnemiesInRange(inRange);
      } else {
        setEnemiesInRange([]);
      }

      // ── Enemy Spawning ─────────────────────────────────────────
      const now = Date.now();
      const maxOnScreen = isInBossRoom ? 1 : 5;
      const canSpawn = s.enemiesSpawned < s.totalEnemiesInRoom;
      const hasRoom = s.enemies.length < maxOnScreen;
      const spawnReady = now - lastSpawnTimeRef.current > WAVES.SPAWN_DELAY;

      if (canSpawn && hasRoom && spawnReady) {
        actions.spawnEnemy();
        lastSpawnTimeRef.current = now;
      }
    }, [actions, collision, isInBossRoom]),
    isPlaying
  );

  // ─── Remove Dead Enemies ────────────────────────────────────────
  useEffect(() => {
    const deadEnemies = state.enemies.filter(
      (e) => isDead(e) && !removingEnemiesRef.current.has(e.id)
    );

    deadEnemies.forEach((enemy) => {
      // Track that we are already removing this enemy
      removingEnemiesRef.current.add(enemy.id);
      setTimeout(() => {
        actions.removeEnemy(enemy.id);
        removingEnemiesRef.current.delete(enemy.id);
      }, 100);
    });
  }, [state.enemies, actions]);

  // ─── Room Transition Timer ──────────────────────────────────────
  useEffect(() => {
    if (state.gameState !== GAME_STATES.ROOM_TRANSITION) return;

    const timer = setTimeout(() => {
      actions.nextRoom();
    }, WAVES.ROOM_CLEAR_DELAY);

    return () => clearTimeout(timer);
  }, [state.gameState, actions]);

  // ─── Clear Message After Delay ──────────────────────────────────
  useEffect(() => {
    if (!state.message) return;

    const timer = setTimeout(() => {
      actions.setMessage('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [state.message, actions]);

  // ─── Reset Spawn Tracking on Room Change ────────────────────────
  useEffect(() => {
    lastSpawnTimeRef.current = 0;
    removingEnemiesRef.current.clear();
  }, [state.currentRoom]);

  // ─── Render Helpers ─────────────────────────────────────────────

  const renderDebug = () => {
    if (isMobile || !showDebug) return null;

    return (
      <div className="debug-info">
        <p>
          Keys:{' '}
          {Object.entries(state.keysPressed)
            .filter(([, v]) => v)
            .map(([k]) => k)
            .join(', ') || 'none'}
          {' | '}
          Player: ({Math.round(state.player?.x ?? 0)},{' '}
          {Math.round(state.player?.y ?? 0)})
          {' | '}
          Dir: {state.player?.direction}
        </p>
        <p>
          In Range: {enemiesInRange.length}
          {' | '}
          Cooldown: {Math.round(state.attackCooldown)}ms
          {' | '}
          Spawned: {state.enemiesSpawned}/{state.totalEnemiesInRoom}
          {' | '}
          Killed: {state.enemiesKilled}/{state.totalEnemiesInRoom}
          {' | '}
          On Screen: {state.enemies.length}
        </p>
        <p>
          Room: {state.currentRoom}
          {' | '}
          State: {state.gameState}
          {' | '}
          Scale: {arenaScale.toFixed(2)}
          {' | '}
          Press ` to hide debug
        </p>
      </div>
    );
  };

  const renderPlaying = () => (
    <div className="game-playing">
      <HUD
        player={state.player}
        currentRoom={state.currentRoom}
        enemiesKilled={state.enemiesKilled}
        totalEnemies={state.totalEnemiesInRoom}
        score={state.score}
        gameTime={state.gameTime}
        message={state.message}
        isMobile={isMobile}
        onPause={actions.togglePause}
      />

      <Arena
        player={state.player}
        enemies={state.enemies}
        enemiesInAttackRange={enemiesInRange}
        scale={arenaScale}
        isMobile={isMobile}
      />

      {isMobile && (
        <TouchControls
          onMove={handleTouchMove}
          onAttack={handleTouchAttack}
          disabled={!isPlaying}
        />
      )}

      {renderDebug()}
    </div>
  );

  // ─── Main Render ────────────────────────────────────────────────
  const renderByState = () => {
    switch (state.gameState) {

      case GAME_STATES.START:
        return (
          <StartScreen
            onStart={actions.startGame}
          />
        );

      case GAME_STATES.PLAYING:
        return renderPlaying();

      case GAME_STATES.PAUSED:
        return (
          <PauseScreen
            currentRoom={state.currentRoom}
            score={state.score}
            onResume={actions.resumeGame}
            onQuit={actions.resetGame}
          />
        );

      case GAME_STATES.ROOM_TRANSITION:
        return (
          <RoomTransition
            currentRoom={state.currentRoom}
            message={state.message}
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

      default:
        return <StartScreen onStart={actions.startGame} />;
    }
  };

  return (
    <div className="game-container">
      {renderByState()}
    </div>
  );
}

export default Game;