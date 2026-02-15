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
  PickupNotification,
  PlayerBuffs,
} from './index';
import { GAME_STATES, KEYS, WAVES } from '../utils/constants';
import { isDead, isBossRoom } from '../utils/helpers';

function Game() {
  const { state, actions } = useGame();
  const collision = useCollision();
  const { isMobile, arenaScale } = useScreenSize();

  const [enemiesInRange, setEnemiesInRange] = useState([]);
  const [showDebug, setShowDebug] = useState(false);

  const stateRef = useRef(state);
  const lastSpawnTimeRef = useRef(0);
  const removingEnemiesRef = useRef(new Set());

  useEffect(() => {
    stateRef.current = state;
  });

  const isPlaying = state.gameState === GAME_STATES.PLAYING;
  const isInBossRoom = isBossRoom(state.currentRoom);

  // Keyboard movement (desktop)
  usePlayerMovement(
    useCallback((keys) => {
      actions.setKeysPressed(keys);
    }, [actions]),
    isPlaying && !isMobile
  );

  // Pause + debug toggle
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

  // Touch movement
  const handleTouchMove = useCallback((keys) => {
    if (!isMobile) return;
    actions.setKeysPressed({
      ...keys,
      attack: stateRef.current.keysPressed.attack,
    });
  }, [actions, isMobile]);

  // Touch attack
  const handleTouchAttack = useCallback((isAttacking) => {
    if (!isMobile) return;
    actions.setKeysPressed({ attack: isAttacking });
  }, [actions, isMobile]);

  // Main game loop
  useGameLoop(
    useCallback((deltaTime) => {
      const s = stateRef.current;

      actions.tick();
      actions.updateCooldowns(deltaTime);

      // Update enemies in range
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

      // Enemy spawning
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

  // Remove dead enemies
  useEffect(() => {
    const deadEnemies = state.enemies.filter(
      (e) => isDead(e) && !removingEnemiesRef.current.has(e.id)
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

  // Reset on room change
  useEffect(() => {
    lastSpawnTimeRef.current = 0;
    removingEnemiesRef.current.clear();
  }, [state.currentRoom]);

  // Clear pickup notification
  useEffect(() => {
    if (!state.recentPickup) return;

    const timer = setTimeout(() => {
      actions.clearRecentPickup();
    }, 2000);

    return () => clearTimeout(timer);
  }, [state.recentPickup, actions]);

  // Render debug
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
          Items: {state.items.length}
          {' | '}
          Obstacles: {state.obstacles.length}
        </p>
        <p>
          Weapon: {state.player?.weapon?.name || 'None'}
          {' | '}
          Buffs: {state.player?.activeBuffs?.length || 0}
          {' | '}
          Speed: {state.player?.speed?.toFixed(1)}
          {' | '}
          Damage: {state.player?.damage}
          {' | '}
          Defense: {state.player?.defense?.toFixed(2) || 1}
        </p>
        <p>
          Room: {state.currentRoom}
          {' | '}
          Scale: {arenaScale.toFixed(2)}
          {' | '}
          Press ` to hide debug
        </p>
      </div>
    );
  };

  // Render playing state
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

      {/* Player buffs display */}
      <PlayerBuffs
        buffs={state.player?.activeBuffs || []}
        weapon={state.player?.weapon}
      />

      <Arena
        player={state.player}
        enemies={state.enemies}
        items={state.items}
        obstacles={state.obstacles}
        enemiesInAttackRange={enemiesInRange}
        scale={arenaScale}
        isMobile={isMobile}
      />

      {/* Pickup notification */}
      <PickupNotification
        pickup={state.recentPickup}
        onComplete={actions.clearRecentPickup}
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

  // Main render
  const renderByState = () => {
    switch (state.gameState) {
      case GAME_STATES.START:
        return <StartScreen onStart={actions.startGame} />;

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