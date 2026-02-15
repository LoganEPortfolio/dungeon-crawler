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
  // New helpers
  createRandomItem,
  canPickupItem,
  applyItemToPlayer,
  updatePlayerBuffs,
  applyWeaponEffect,
  updateEnemyStatusEffects,
  getEnemiesInChainRange,
  createObstaclesForRoom,
  isOnObstacle,
  applyObstacleEffect,
} from '../utils/helpers';

const initialState = {
  gameState: GAME_STATES.START,
  player: null,
  enemies: [],
  items: [], // NEW: items on ground
  obstacles: [], // NEW: obstacles in arena
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
  // NEW: track recent pickups for UI feedback
  recentPickup: null,
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
  // NEW actions
  SPAWN_ITEM: 'SPAWN_ITEM',
  PICKUP_ITEM: 'PICKUP_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_RECENT_PICKUP: 'CLEAR_RECENT_PICKUP',
};

function gameReducer(state, action) {
  switch (action.type) {

    case ACTIONS.START_GAME: {
      const player = createPlayer();
      const enemyCount = getEnemyCountForRoom(1);
      const obstacles = createObstaclesForRoom(1, player.x, player.y);
      
      console.log('Starting game - Room 1, Enemies:', enemyCount, 'Obstacles:', obstacles.length);
      
      return {
        ...initialState,
        gameState: GAME_STATES.PLAYING,
        player,
        currentRoom: 1,
        totalEnemiesInRoom: enemyCount,
        enemiesSpawned: 0,
        enemiesKilled: 0,
        enemies: [],
        items: [],
        obstacles,
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
      
      // Apply defense reduction if player has shield buff
      let damage = action.payload;
      if (state.player.defense && state.player.defense < 1) {
        damage = Math.round(damage * state.player.defense);
      }
      
      const damagedPlayer = applyDamage(state.player, damage);
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
      const { enemyId, damage, applyWeaponEffects } = action.payload;
      let updatedEnemies = state.enemies.map((enemy) => {
        if (enemy.id !== enemyId) return enemy;
        
        let updatedEnemy = applyDamage(enemy, damage);
        
        // Apply weapon effects if player has weapon
        if (applyWeaponEffects && state.player?.weapon) {
          updatedEnemy = applyWeaponEffect(updatedEnemy, state.player.weapon);
        }
        
        return updatedEnemy;
      });

      // Handle chain lightning
      if (applyWeaponEffects && state.player?.weapon?.effect === 'chain') {
        const targetEnemy = state.enemies.find(e => e.id === enemyId);
        if (targetEnemy) {
          const chainTargets = getEnemiesInChainRange(
            targetEnemy,
            state.enemies,
            state.player.weapon.chainRange,
            [enemyId]
          ).slice(0, state.player.weapon.maxChains);

          updatedEnemies = updatedEnemies.map(enemy => {
            if (chainTargets.find(t => t.id === enemy.id)) {
              return applyDamage(enemy, state.player.weapon.chainDamage);
            }
            return enemy;
          });
        }
      }

      return { ...state, enemies: updatedEnemies };
    }

    case ACTIONS.REMOVE_ENEMY: {
      const enemyToRemove = state.enemies.find((e) => e.id === action.payload);
      if (!enemyToRemove) return state;

      const scoreValue = enemyToRemove.type === 'boss' ? 500 : 100;
      const newEnemies = state.enemies.filter((e) => e.id !== action.payload);
      const newEnemiesKilled = state.enemiesKilled + 1;

      // Try to spawn an item where enemy died
      const droppedItem = createRandomItem(
        enemyToRemove.x + enemyToRemove.size / 2 - 10,
        enemyToRemove.y + enemyToRemove.size / 2 - 10
      );
      const newItems = droppedItem ? [...state.items, droppedItem] : state.items;

      console.log('Enemy removed. Killed:', newEnemiesKilled, '/', state.totalEnemiesInRoom);
      if (droppedItem) {
        console.log('Item dropped:', droppedItem.name);
      }

      // Room cleared check
      if (newEnemiesKilled >= state.totalEnemiesInRoom) {
        if (isBossRoom(state.currentRoom)) {
          console.log('BOSS DEFEATED - VICTORY!');
          return {
            ...state,
            enemies: newEnemies,
            items: newItems,
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
          items: newItems,
          enemiesKilled: newEnemiesKilled,
          score: state.score + scoreValue,
          gameState: GAME_STATES.ROOM_TRANSITION,
          message: `Room ${state.currentRoom} Cleared!`,
        };
      }

      return {
        ...state,
        enemies: newEnemies,
        items: newItems,
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

      // Create obstacles for new room
      const obstacles = createObstaclesForRoom(
        nextRoom,
        state.player?.x || PLAYER.SIZE,
        state.player?.y || PLAYER.SIZE
      );

      console.log('Entering Room', nextRoom, '- Enemies:', enemyCount, 'Obstacles:', obstacles.length);

      return {
        ...state,
        gameState: GAME_STATES.PLAYING,
        currentRoom: nextRoom,
        totalEnemiesInRoom: enemyCount,
        enemiesSpawned: 0,
        enemiesKilled: 0,
        enemies: [],
        items: [], // Clear items between rooms
        obstacles,
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
      
      // Update player buffs
      let updatedPlayer = state.player ? updatePlayerBuffs(state.player) : null;
      
      if (updatedPlayer) {
        updatedPlayer = {
          ...updatedPlayer,
          hitTimer: Math.max(0, updatedPlayer.hitTimer - 1),
          attackTimer: Math.max(0, updatedPlayer.attackTimer - 1),
          isHit: updatedPlayer.hitTimer > 1,
          isAttacking: updatedPlayer.attackTimer > 1,
        };
      }
      
      // Update enemy status effects
      const updatedEnemies = state.enemies.map(enemy => {
        let updated = updateEnemyStatusEffects(enemy);
        updated = {
          ...updated,
          hitTimer: Math.max(0, updated.hitTimer - 1),
          isHit: updated.hitTimer > 1,
        };
        return updated;
      });
      
      // Remove expired items
      const now = Date.now();
      const activeItems = state.items.filter(item => item.expiresAt > now);
      
      return {
        ...state,
        attackCooldown: Math.max(0, state.attackCooldown - deltaTime),
        player: updatedPlayer,
        enemies: updatedEnemies,
        items: activeItems,
      };
    }

    case ACTIONS.ADD_SCORE: {
      return { ...state, score: state.score + action.payload };
    }

    case ACTIONS.SET_MESSAGE: {
      return { ...state, message: action.payload };
    }

    case ACTIONS.SPAWN_ITEM: {
      const { x, y, itemType } = action.payload;
      const item = createRandomItem(x, y);
      if (!item) return state;
      return { ...state, items: [...state.items, item] };
    }

    case ACTIONS.PICKUP_ITEM: {
      const itemId = action.payload;
      const item = state.items.find(i => i.id === itemId);
      if (!item || !state.player) return state;

      const updatedPlayer = applyItemToPlayer(state.player, item);
      const remainingItems = state.items.filter(i => i.id !== itemId);

      return {
        ...state,
        player: updatedPlayer,
        items: remainingItems,
        recentPickup: { name: item.name, category: item.category, time: Date.now() },
      };
    }

    case ACTIONS.REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.payload),
      };
    }

    case ACTIONS.CLEAR_RECENT_PICKUP: {
      return { ...state, recentPickup: null };
    }

    case ACTIONS.TICK: {
      if (state.gameState !== GAME_STATES.PLAYING || !state.player) return state;

      const now = Date.now();
      const deltaTime = now - state.lastFrameTime;

      // Update player position
      let updatedPlayer = calculatePlayerMovement(state.player, state.keysPressed);

      // Update enemy positions and status effects
      let updatedEnemies = state.enemies.map((enemy) => {
        let updated = moveTowardsPlayer(enemy, updatedPlayer.x, updatedPlayer.y);
        return updated;
      });

      // ── Obstacle collisions ────────────────────────────────
      let updatedObstacles = [...state.obstacles];
      
      // Check player vs obstacles
      for (let i = 0; i < updatedObstacles.length; i++) {
        const obstacle = updatedObstacles[i];
        if (isOnObstacle(updatedPlayer, obstacle)) {
          const result = applyObstacleEffect(updatedPlayer, obstacle, true);
          updatedPlayer = result.entity;
          if (result.obstacle) {
            updatedObstacles[i] = result.obstacle;
          }
        }
      }

      // Check enemies vs obstacles
      for (let i = 0; i < updatedObstacles.length; i++) {
        const obstacle = updatedObstacles[i];
        updatedEnemies = updatedEnemies.map(enemy => {
          if (isOnObstacle(enemy, obstacle)) {
            const result = applyObstacleEffect(enemy, obstacle, false);
            if (result.obstacle) {
              updatedObstacles[i] = result.obstacle;
            }
            return result.entity;
          }
          return enemy;
        });
      }

      // ── Item pickups ───────────────────────────────────────
      let updatedItems = [...state.items];
      let pickedUpItem = null;
      
      for (const item of state.items) {
        if (canPickupItem(updatedPlayer, item)) {
          updatedPlayer = applyItemToPlayer(updatedPlayer, item);
          updatedItems = updatedItems.filter(i => i.id !== item.id);
          pickedUpItem = { name: item.name, category: item.category, time: now };
          console.log('Picked up:', item.name);
          break; // Only one pickup per frame
        }
      }

      // ── Enemy attacks player on collision ──────────────────
      updatedEnemies.forEach((enemy) => {
        if (checkCircleCollision(updatedPlayer, enemy)) {
          const cooldown = enemy.type === 'boss'
            ? BOSS.ATTACK_COOLDOWN
            : ENEMY.ATTACK_COOLDOWN;
          const canAttack = now - enemy.lastAttackTime > cooldown;
          if (canAttack) {
            // Apply defense
            let damage = enemy.damage;
            if (updatedPlayer.defense && updatedPlayer.defense < 1) {
              damage = Math.round(damage * updatedPlayer.defense);
            }
            updatedPlayer = applyDamage(updatedPlayer, damage);
            enemy.lastAttackTime = now;
          }
        }
      });

      // Check player death
      if (isDead(updatedPlayer)) {
        return {
          ...state,
          player: updatedPlayer,
          enemies: updatedEnemies,
          items: updatedItems,
          obstacles: updatedObstacles,
          gameState: GAME_STATES.GAME_OVER,
          message: 'Game Over!',
          lastFrameTime: now,
        };
      }

      // ── Player attacks ─────────────────────────────────────
      if (state.keysPressed.attack && state.attackCooldown <= 0) {
        updatedPlayer = {
          ...updatedPlayer,
          isAttacking: true,
          attackTimer: 10,
        };

        updatedEnemies = updatedEnemies.map((enemy) => {
          if (checkAttackHit(updatedPlayer, enemy)) {
            let damaged = applyDamage(enemy, updatedPlayer.damage);
            
            // Apply weapon effects
            if (updatedPlayer.weapon) {
              damaged = applyWeaponEffect(damaged, updatedPlayer.weapon);
            }
            
            return damaged;
          }
          return enemy;
        });

        // Handle chain lightning
        if (updatedPlayer.weapon?.effect === 'chain') {
          const hitEnemies = updatedEnemies.filter(e => 
            checkAttackHit(updatedPlayer, e) && e.isHit
          );
          
          for (const hitEnemy of hitEnemies) {
            const chainTargets = getEnemiesInChainRange(
              hitEnemy,
              updatedEnemies,
              updatedPlayer.weapon.chainRange,
              hitEnemies.map(e => e.id)
            ).slice(0, updatedPlayer.weapon.maxChains);

            updatedEnemies = updatedEnemies.map(enemy => {
              if (chainTargets.find(t => t.id === enemy.id)) {
                return applyDamage(enemy, updatedPlayer.weapon.chainDamage);
              }
              return enemy;
            });
          }
        }

        return {
          ...state,
          player: updatedPlayer,
          enemies: updatedEnemies,
          items: updatedItems,
          obstacles: updatedObstacles,
          attackCooldown: PLAYER.ATTACK_COOLDOWN,
          lastFrameTime: now,
          gameTime: state.gameTime + deltaTime / 1000,
          recentPickup: pickedUpItem || state.recentPickup,
        };
      }

      return {
        ...state,
        player: updatedPlayer,
        enemies: updatedEnemies,
        items: updatedItems,
        obstacles: updatedObstacles,
        lastFrameTime: now,
        gameTime: state.gameTime + deltaTime / 1000,
        recentPickup: pickedUpItem || state.recentPickup,
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
    damageEnemy:     (id, d, applyWeapon = true) => dispatch({ 
      type: ACTIONS.DAMAGE_ENEMY, 
      payload: { enemyId: id, damage: d, applyWeaponEffects: applyWeapon } 
    }),
    removeEnemy:     (id) => dispatch({ type: ACTIONS.REMOVE_ENEMY, payload: id }),
    nextRoom:        () => dispatch({ type: ACTIONS.NEXT_ROOM }),
    setKeysPressed:  (k) => dispatch({ type: ACTIONS.SET_KEYS_PRESSED, payload: k }),
    updateCooldowns: (dt) => dispatch({ type: ACTIONS.UPDATE_COOLDOWNS, payload: dt }),
    addScore:        (pts) => dispatch({ type: ACTIONS.ADD_SCORE, payload: pts }),
    setMessage:      (m) => dispatch({ type: ACTIONS.SET_MESSAGE, payload: m }),
    tick:            () => dispatch({ type: ACTIONS.TICK }),
    resetGame:       () => dispatch({ type: ACTIONS.RESET_GAME }),
    // New actions
    spawnItem:       (x, y, type) => dispatch({ type: ACTIONS.SPAWN_ITEM, payload: { x, y, itemType: type } }),
    pickupItem:      (id) => dispatch({ type: ACTIONS.PICKUP_ITEM, payload: id }),
    removeItem:      (id) => dispatch({ type: ACTIONS.REMOVE_ITEM, payload: id }),
    clearRecentPickup: () => dispatch({ type: ACTIONS.CLEAR_RECENT_PICKUP }),
  }), []);

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