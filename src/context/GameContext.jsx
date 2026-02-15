// src/context/GameContext.jsx
import { createContext, useContext, useReducer, useMemo } from 'react';
import { GAME_STATES, ROOMS, PLAYER, ENEMY, BOSS } from '../utils/constants';
import {
  createPlayer,
  createEnemy,
  createBoss,
  applyDamage,
  isDead,
  getEnemyCountForRoom,
  isBossRoom,
  moveTowardsPlayer,
  checkCircleCollision,
  checkAttackHit,
  calculatePlayerMovement,
} from '../utils/helpers';

const initialState = {
  gameState: GAME_STATES.START,
  player: null,
  enemies: [],
  currentRoom: 1,
  totalEnemiesInRoom: 0,
  enemiesSpawned: 0,
  enemiesKilled: 0,
  score: 0,
  gameTime: 0,
  isPaused: false,
  keysPressed: {
    up: false,
    down: false,
    left: false,
    right: false,
    attack: false,
  },
  lastFrameTime: 0,
  attackCooldown: 0,
  message: '',
};

const ACTIONS = {
  START_GAME: 'START_GAME',
  PAUSE_GAME: 'PAUSE_GAME',
  RESUME_GAME: 'RESUME_GAME',
  TOGGLE_PAUSE: 'TOGGLE_PAUSE',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY',
  UPDATE_PLAYER: 'UPDATE_PLAYER',
  DAMAGE_PLAYER: 'DAMAGE_PLAYER',
  SPAWN_ENEMY: 'SPAWN_ENEMY',
  DAMAGE_ENEMY: 'DAMAGE_ENEMY',
  REMOVE_ENEMY: 'REMOVE_ENEMY',
  NEXT_ROOM: 'NEXT_ROOM',
  SET_KEYS_PRESSED: 'SET_KEYS_PRESSED',
  UPDATE_COOLDOWNS: 'UPDATE_COOLDOWNS',
  ADD_SCORE: 'ADD_SCORE',
  SET_MESSAGE: 'SET_MESSAGE',
  TICK: 'TICK',
  RESET_GAME: 'RESET_GAME',
};

function gameReducer(state, action) {
  switch (action.type) {

    case ACTIONS.START_GAME: {
      const player = createPlayer();
      const enemyCount = getEnemyCountForRoom(1);
      console.log('Starting game - Room 1, Enemies:', enemyCount);
      return {
        ...initialState,
        gameState: GAME_STATES.PLAYING,
        player,
        currentRoom: 1,
        totalEnemiesInRoom: enemyCount,
        enemiesSpawned: 0,
        enemiesKilled: 0,
        enemies: [],
        lastFrameTime: Date.now(),
        message: 'Room 1 - Fight!',
      };
    }

    case ACTIONS.PAUSE_GAME: {
      if (state.gameState !== GAME_STATES.PLAYING) return state;
      return { ...state, gameState: GAME_STATES.PAUSED, isPaused: true };
    }

    case ACTIONS.RESUME_GAME: {
      if (state.gameState !== GAME_STATES.PAUSED) return state;
      return {
        ...state,
        gameState: GAME_STATES.PLAYING,
        isPaused: false,
        lastFrameTime: Date.now(),
      };
    }

    // Toggle handled entirely in reducer - no state dependency in actions
    case ACTIONS.TOGGLE_PAUSE: {
      if (state.gameState === GAME_STATES.PLAYING) {
        return { ...state, gameState: GAME_STATES.PAUSED, isPaused: true };
      }
      if (state.gameState === GAME_STATES.PAUSED) {
        return {
          ...state,
          gameState: GAME_STATES.PLAYING,
          isPaused: false,
          lastFrameTime: Date.now(),
        };
      }
      return state;
    }

    case ACTIONS.GAME_OVER: {
      return { ...state, gameState: GAME_STATES.GAME_OVER, message: 'Game Over!' };
    }

    case ACTIONS.VICTORY: {
      return {
        ...state,
        gameState: GAME_STATES.VICTORY,
        message: 'Victory! You defeated the boss!',
      };
    }

    case ACTIONS.UPDATE_PLAYER: {
      return { ...state, player: action.payload };
    }

    case ACTIONS.DAMAGE_PLAYER: {
      if (!state.player) return state;
      const damagedPlayer = applyDamage(state.player, action.payload);
      if (isDead(damagedPlayer)) {
        return {
          ...state,
          player: damagedPlayer,
          gameState: GAME_STATES.GAME_OVER,
          message: 'Game Over!',
        };
      }
      return { ...state, player: damagedPlayer };
    }

    case ACTIONS.SPAWN_ENEMY: {
      if (!state.player) return state;
      if (state.enemiesSpawned >= state.totalEnemiesInRoom) return state;

      let newEnemy;
      if (isBossRoom(state.currentRoom)) {
        newEnemy = createBoss(state.player.x, state.player.y);
        console.log('Spawning BOSS');
      } else {
        newEnemy = createEnemy(state.player.x, state.player.y, state.currentRoom);
        console.log('Spawning enemy', state.enemiesSpawned + 1, '/', state.totalEnemiesInRoom);
      }

      return {
        ...state,
        enemies: [...state.enemies, newEnemy],
        enemiesSpawned: state.enemiesSpawned + 1,
      };
    }

    case ACTIONS.DAMAGE_ENEMY: {
      const { enemyId, damage } = action.payload;
      return {
        ...state,
        enemies: state.enemies.map((enemy) =>
          enemy.id === enemyId ? applyDamage(enemy, damage) : enemy
        ),
      };
    }

    case ACTIONS.REMOVE_ENEMY: {
      const enemyToRemove = state.enemies.find((e) => e.id === action.payload);
      if (!enemyToRemove) return state;

      const scoreValue = enemyToRemove.type === 'boss' ? 500 : 100;
      const newEnemies = state.enemies.filter((e) => e.id !== action.payload);
      const newEnemiesKilled = state.enemiesKilled + 1;

      console.log('Enemy removed. Killed:', newEnemiesKilled, '/', state.totalEnemiesInRoom);

      // Room cleared when all enemies have been killed
      if (newEnemiesKilled >= state.totalEnemiesInRoom) {
        if (isBossRoom(state.currentRoom)) {
          console.log('BOSS DEFEATED - VICTORY!');
          return {
            ...state,
            enemies: newEnemies,
            enemiesKilled: newEnemiesKilled,
            score: state.score + scoreValue,
            gameState: GAME_STATES.VICTORY,
            message: 'Victory! You defeated the boss!',
          };
        }

        console.log('Room', state.currentRoom, 'cleared!');
        return {
          ...state,
          enemies: newEnemies,
          enemiesKilled: newEnemiesKilled,
          score: state.score + scoreValue,
          gameState: GAME_STATES.ROOM_TRANSITION,
          message: `Room ${state.currentRoom} Cleared!`,
        };
      }

      return {
        ...state,
        enemies: newEnemies,
        enemiesKilled: newEnemiesKilled,
        score: state.score + scoreValue,
      };
    }

    case ACTIONS.NEXT_ROOM: {
      const nextRoom = state.currentRoom + 1;
      if (nextRoom > ROOMS.TOTAL) {
        return { ...state, gameState: GAME_STATES.VICTORY };
      }

      const enemyCount = getEnemyCountForRoom(nextRoom);
      const roomMessage = isBossRoom(nextRoom)
        ? `Room ${nextRoom} - BOSS FIGHT!`
        : `Room ${nextRoom} - Fight!`;

      console.log('Entering Room', nextRoom, '- Enemies:', enemyCount);

      return {
        ...state,
        gameState: GAME_STATES.PLAYING,
        currentRoom: nextRoom,
        totalEnemiesInRoom: enemyCount,
        enemiesSpawned: 0,
        enemiesKilled: 0,
        enemies: [],
        message: roomMessage,
        lastFrameTime: Date.now(),
      };
    }

    case ACTIONS.SET_KEYS_PRESSED: {
      return {
        ...state,
        keysPressed: { ...state.keysPressed, ...action.payload },
      };
    }

    case ACTIONS.UPDATE_COOLDOWNS: {
      const deltaTime = action.payload;
      return {
        ...state,
        attackCooldown: Math.max(0, state.attackCooldown - deltaTime),
        player: state.player
          ? {
              ...state.player,
              hitTimer: Math.max(0, state.player.hitTimer - 1),
              attackTimer: Math.max(0, state.player.attackTimer - 1),
              isHit: state.player.hitTimer > 1,
              isAttacking: state.player.attackTimer > 1,
            }
          : null,
        enemies: state.enemies.map((enemy) => ({
          ...enemy,
          hitTimer: Math.max(0, enemy.hitTimer - 1),
          isHit: enemy.hitTimer > 1,
        })),
      };
    }

    case ACTIONS.ADD_SCORE: {
      return { ...state, score: state.score + action.payload };
    }

    case ACTIONS.SET_MESSAGE: {
      return { ...state, message: action.payload };
    }

    case ACTIONS.TICK: {
      if (state.gameState !== GAME_STATES.PLAYING || !state.player) return state;

      const now = Date.now();
      const deltaTime = now - state.lastFrameTime;

      let updatedPlayer = calculatePlayerMovement(state.player, state.keysPressed);

      let updatedEnemies = state.enemies.map((enemy) =>
        moveTowardsPlayer(enemy, updatedPlayer.x, updatedPlayer.y)
      );

      // Enemy attacks player on collision
      updatedEnemies.forEach((enemy) => {
        if (checkCircleCollision(updatedPlayer, enemy)) {
          const cooldown = enemy.type === 'boss'
            ? BOSS.ATTACK_COOLDOWN
            : ENEMY.ATTACK_COOLDOWN;
          const canAttack = now - enemy.lastAttackTime > cooldown;
          if (canAttack) {
            updatedPlayer = applyDamage(updatedPlayer, enemy.damage);
            enemy.lastAttackTime = now;
          }
        }
      });

      if (isDead(updatedPlayer)) {
        return {
          ...state,
          player: updatedPlayer,
          enemies: updatedEnemies,
          gameState: GAME_STATES.GAME_OVER,
          message: 'Game Over!',
          lastFrameTime: now,
        };
      }

      // Player attacks
      if (state.keysPressed.attack && state.attackCooldown <= 0) {
        updatedPlayer = {
          ...updatedPlayer,
          isAttacking: true,
          attackTimer: 10,
        };

        updatedEnemies = updatedEnemies.map((enemy) =>
          checkAttackHit(updatedPlayer, enemy)
            ? applyDamage(enemy, updatedPlayer.damage)
            : enemy
        );

        return {
          ...state,
          player: updatedPlayer,
          enemies: updatedEnemies,
          attackCooldown: PLAYER.ATTACK_COOLDOWN,
          lastFrameTime: now,
          gameTime: state.gameTime + deltaTime / 1000,
        };
      }

      return {
        ...state,
        player: updatedPlayer,
        enemies: updatedEnemies,
        lastFrameTime: now,
        gameTime: state.gameTime + deltaTime / 1000,
      };
    }

    case ACTIONS.RESET_GAME: {
      return { ...initialState };
    }

    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // useMemo with empty deps - dispatch is stable so actions never change reference
  const actions = useMemo(() => ({
    startGame:       () => dispatch({ type: ACTIONS.START_GAME }),
    pauseGame:       () => dispatch({ type: ACTIONS.PAUSE_GAME }),
    resumeGame:      () => dispatch({ type: ACTIONS.RESUME_GAME }),
    togglePause:     () => dispatch({ type: ACTIONS.TOGGLE_PAUSE }),
    gameOver:        () => dispatch({ type: ACTIONS.GAME_OVER }),
    victory:         () => dispatch({ type: ACTIONS.VICTORY }),
    updatePlayer:    (p) => dispatch({ type: ACTIONS.UPDATE_PLAYER, payload: p }),
    damagePlayer:    (d) => dispatch({ type: ACTIONS.DAMAGE_PLAYER, payload: d }),
    spawnEnemy:      () => dispatch({ type: ACTIONS.SPAWN_ENEMY }),
    damageEnemy:     (id, d) => dispatch({ type: ACTIONS.DAMAGE_ENEMY, payload: { enemyId: id, damage: d } }),
    removeEnemy:     (id) => dispatch({ type: ACTIONS.REMOVE_ENEMY, payload: id }),
    nextRoom:        () => dispatch({ type: ACTIONS.NEXT_ROOM }),
    setKeysPressed:  (k) => dispatch({ type: ACTIONS.SET_KEYS_PRESSED, payload: k }),
    updateCooldowns: (dt) => dispatch({ type: ACTIONS.UPDATE_COOLDOWNS, payload: dt }),
    addScore:        (pts) => dispatch({ type: ACTIONS.ADD_SCORE, payload: pts }),
    setMessage:      (m) => dispatch({ type: ACTIONS.SET_MESSAGE, payload: m }),
    tick:            () => dispatch({ type: ACTIONS.TICK }),
    resetGame:       () => dispatch({ type: ACTIONS.RESET_GAME }),
  }), []); // Empty - dispatch never changes

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export { ACTIONS };