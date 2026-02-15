// src/context/GameContext.jsx
import { createContext, useContext, useReducer, useCallback } from 'react';
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

// Initial game state
const initialState = {
  gameState: GAME_STATES.START,
  player: null,
  enemies: [],
  currentRoom: 1,
  totalEnemiesInRoom: 0,  // Total enemies for this room
  enemiesSpawned: 0,       // How many have been spawned
  enemiesKilled: 0,        // How many have been killed
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
  roomTransitionTimer: 0,
  message: '',
};

// Action types
const ACTIONS = {
  START_GAME: 'START_GAME',
  PAUSE_GAME: 'PAUSE_GAME',
  RESUME_GAME: 'RESUME_GAME',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY',
  UPDATE_PLAYER: 'UPDATE_PLAYER',
  DAMAGE_PLAYER: 'DAMAGE_PLAYER',
  UPDATE_ENEMIES: 'UPDATE_ENEMIES',
  SPAWN_ENEMY: 'SPAWN_ENEMY',
  DAMAGE_ENEMY: 'DAMAGE_ENEMY',
  REMOVE_ENEMY: 'REMOVE_ENEMY',
  NEXT_ROOM: 'NEXT_ROOM',
  START_ROOM_TRANSITION: 'START_ROOM_TRANSITION',
  SET_KEYS_PRESSED: 'SET_KEYS_PRESSED',
  UPDATE_GAME_TIME: 'UPDATE_GAME_TIME',
  UPDATE_COOLDOWNS: 'UPDATE_COOLDOWNS',
  ADD_SCORE: 'ADD_SCORE',
  SET_MESSAGE: 'SET_MESSAGE',
  TICK: 'TICK',
  RESET_GAME: 'RESET_GAME',
};

// Reducer function
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.START_GAME: {
      const player = createPlayer();
      const enemyCount = getEnemyCountForRoom(1);
      
      console.log('Starting game - Room 1, Enemies to spawn:', enemyCount);
      
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
      return {
        ...state,
        gameState: GAME_STATES.PAUSED,
        isPaused: true,
      };
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

    case ACTIONS.GAME_OVER: {
      return {
        ...state,
        gameState: GAME_STATES.GAME_OVER,
        message: 'Game Over!',
      };
    }

    case ACTIONS.VICTORY: {
      return {
        ...state,
        gameState: GAME_STATES.VICTORY,
        message: 'Victory! You defeated the boss!',
      };
    }

    case ACTIONS.UPDATE_PLAYER: {
      return {
        ...state,
        player: action.payload,
      };
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
      
      return {
        ...state,
        player: damagedPlayer,
      };
    }

    case ACTIONS.UPDATE_ENEMIES: {
      return {
        ...state,
        enemies: action.payload,
      };
    }

    case ACTIONS.SPAWN_ENEMY: {
      if (!state.player) {
        console.log('Cannot spawn - no player');
        return state;
      }
      
      // Check if we've already spawned all enemies for this room
      if (state.enemiesSpawned >= state.totalEnemiesInRoom) {
        console.log('Cannot spawn - all enemies spawned:', state.enemiesSpawned, '/', state.totalEnemiesInRoom);
        return state;
      }

      let newEnemy;
      if (isBossRoom(state.currentRoom)) {
        newEnemy = createBoss(state.player.x, state.player.y);
        console.log('Spawning BOSS at:', newEnemy.x, newEnemy.y);
      } else {
        newEnemy = createEnemy(state.player.x, state.player.y, state.currentRoom);
        console.log('Spawning enemy', state.enemiesSpawned + 1, 'at:', newEnemy.x, newEnemy.y);
      }

      return {
        ...state,
        enemies: [...state.enemies, newEnemy],
        enemiesSpawned: state.enemiesSpawned + 1,
      };
    }

    case ACTIONS.DAMAGE_ENEMY: {
      const { enemyId, damage } = action.payload;
      const updatedEnemies = state.enemies.map((enemy) => {
        if (enemy.id === enemyId) {
          return applyDamage(enemy, damage);
        }
        return enemy;
      });

      return {
        ...state,
        enemies: updatedEnemies,
      };
    }

    case ACTIONS.REMOVE_ENEMY: {
      const enemyToRemove = state.enemies.find((e) => e.id === action.payload);
      if (!enemyToRemove) return state;

      const scoreValue = enemyToRemove.type === 'boss' ? 500 : 100;
      const newEnemies = state.enemies.filter((e) => e.id !== action.payload);
      const newEnemiesKilled = state.enemiesKilled + 1;

      console.log('Enemy killed. Total killed:', newEnemiesKilled, '/', state.totalEnemiesInRoom);

      // Check if room is cleared (all enemies spawned AND killed)
      if (newEnemiesKilled >= state.totalEnemiesInRoom) {
        // Check if this was the boss room
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

        // Start room transition
        console.log('Room cleared! Transitioning...');
        return {
          ...state,
          enemies: newEnemies,
          enemiesKilled: newEnemiesKilled,
          score: state.score + scoreValue,
          gameState: GAME_STATES.ROOM_TRANSITION,
          roomTransitionTimer: 2000,
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
        return {
          ...state,
          gameState: GAME_STATES.VICTORY,
          message: 'Victory!',
        };
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
        roomTransitionTimer: 0,
        message: roomMessage,
      };
    }

    case ACTIONS.START_ROOM_TRANSITION: {
      return {
        ...state,
        gameState: GAME_STATES.ROOM_TRANSITION,
        roomTransitionTimer: action.payload || 2000,
      };
    }

    case ACTIONS.SET_KEYS_PRESSED: {
      return {
        ...state,
        keysPressed: {
          ...state.keysPressed,
          ...action.payload,
        },
      };
    }

    case ACTIONS.UPDATE_GAME_TIME: {
      return {
        ...state,
        gameTime: state.gameTime + action.payload,
      };
    }

    case ACTIONS.UPDATE_COOLDOWNS: {
      const deltaTime = action.payload;
      return {
        ...state,
        attackCooldown: Math.max(0, state.attackCooldown - deltaTime),
        roomTransitionTimer: Math.max(0, state.roomTransitionTimer - deltaTime),
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
      return {
        ...state,
        score: state.score + action.payload,
      };
    }

    case ACTIONS.SET_MESSAGE: {
      return {
        ...state,
        message: action.payload,
      };
    }

    case ACTIONS.TICK: {
      // Main game loop tick - handles movement, collisions, spawning
      if (state.gameState !== GAME_STATES.PLAYING || !state.player) {
        return state;
      }

      const now = Date.now();
      const deltaTime = now - state.lastFrameTime;

      // Update player position based on keys pressed
      let updatedPlayer = calculatePlayerMovement(state.player, state.keysPressed);

      // Update enemy positions (move towards player)
      let updatedEnemies = state.enemies.map((enemy) =>
        moveTowardsPlayer(enemy, updatedPlayer.x, updatedPlayer.y)
      );

      // Check for enemy collisions with player (enemy attacks)
      updatedEnemies.forEach((enemy) => {
        if (checkCircleCollision(updatedPlayer, enemy)) {
          const canAttack = now - enemy.lastAttackTime > (enemy.type === 'boss' ? BOSS.ATTACK_COOLDOWN : ENEMY.ATTACK_COOLDOWN);
          if (canAttack) {
            updatedPlayer = applyDamage(updatedPlayer, enemy.damage);
            enemy.lastAttackTime = now;
          }
        }
      });

      // Check for player death
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

      // Handle player attack
      if (state.keysPressed.attack && state.attackCooldown <= 0) {
        updatedPlayer = {
          ...updatedPlayer,
          isAttacking: true,
          attackTimer: 10,
        };

        // Check for hits on enemies
        updatedEnemies = updatedEnemies.map((enemy) => {
          if (checkAttackHit(updatedPlayer, enemy)) {
            return applyDamage(enemy, updatedPlayer.damage);
          }
          return enemy;
        });

        // Update attack cooldown
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
      return {
        ...initialState,
      };
    }

    default:
      return state;
  }
}

// Create context
const GameContext = createContext(null);

// Provider component
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Action creators
  const actions = {
    startGame: useCallback(() => {
      dispatch({ type: ACTIONS.START_GAME });
    }, []),

    pauseGame: useCallback(() => {
      dispatch({ type: ACTIONS.PAUSE_GAME });
    }, []),

    resumeGame: useCallback(() => {
      dispatch({ type: ACTIONS.RESUME_GAME });
    }, []),

    togglePause: useCallback(() => {
      if (state.gameState === GAME_STATES.PLAYING) {
        dispatch({ type: ACTIONS.PAUSE_GAME });
      } else if (state.gameState === GAME_STATES.PAUSED) {
        dispatch({ type: ACTIONS.RESUME_GAME });
      }
    }, [state.gameState]),

    gameOver: useCallback(() => {
      dispatch({ type: ACTIONS.GAME_OVER });
    }, []),

    victory: useCallback(() => {
      dispatch({ type: ACTIONS.VICTORY });
    }, []),

    updatePlayer: useCallback((player) => {
      dispatch({ type: ACTIONS.UPDATE_PLAYER, payload: player });
    }, []),

    damagePlayer: useCallback((damage) => {
      dispatch({ type: ACTIONS.DAMAGE_PLAYER, payload: damage });
    }, []),

    spawnEnemy: useCallback(() => {
      dispatch({ type: ACTIONS.SPAWN_ENEMY });
    }, []),

    damageEnemy: useCallback((enemyId, damage) => {
      dispatch({ type: ACTIONS.DAMAGE_ENEMY, payload: { enemyId, damage } });
    }, []),

    removeEnemy: useCallback((enemyId) => {
      dispatch({ type: ACTIONS.REMOVE_ENEMY, payload: enemyId });
    }, []),

    nextRoom: useCallback(() => {
      dispatch({ type: ACTIONS.NEXT_ROOM });
    }, []),

    setKeysPressed: useCallback((keys) => {
      dispatch({ type: ACTIONS.SET_KEYS_PRESSED, payload: keys });
    }, []),

    updateCooldowns: useCallback((deltaTime) => {
      dispatch({ type: ACTIONS.UPDATE_COOLDOWNS, payload: deltaTime });
    }, []),

    addScore: useCallback((points) => {
      dispatch({ type: ACTIONS.ADD_SCORE, payload: points });
    }, []),

    setMessage: useCallback((message) => {
      dispatch({ type: ACTIONS.SET_MESSAGE, payload: message });
    }, []),

    tick: useCallback(() => {
      dispatch({ type: ACTIONS.TICK });
    }, []),

    resetGame: useCallback(() => {
      dispatch({ type: ACTIONS.RESET_GAME });
    }, []),
  };

  return (
    <GameContext.Provider value={{ state, actions, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook to use game context
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Export action types for external use if needed
export { ACTIONS };