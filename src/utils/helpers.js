// src/utils/helpers.js
import { ARENA, PLAYER, ENEMY, BOSS, ROOMS, ITEMS, ITEM_TYPES, OBSTACLES, OBSTACLE_TYPES, OBSTACLES_PER_ROOM } from './constants';
import { getEnemySpriteByDifficulty, ITEM_SPRITES, OBSTACLE_SPRITES } from './sprites';

// ─── EXISTING HELPERS (keep all existing code) ────────────────────

/**
 * Generate a unique ID for game entities
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Clamp a value between min and max
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Calculate distance between two points
 */
export const getDistance = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Check if two rectangular entities are colliding
 */
export const checkCollision = (entity1, entity2) => {
  return (
    entity1.x < entity2.x + entity2.size &&
    entity1.x + entity1.size > entity2.x &&
    entity1.y < entity2.y + entity2.size &&
    entity1.y + entity1.size > entity2.y
  );
};

/**
 * Check if two circular entities are colliding
 */
export const checkCircleCollision = (entity1, entity2) => {
  const centerX1 = entity1.x + entity1.size / 2;
  const centerY1 = entity1.y + entity1.size / 2;
  const centerX2 = entity2.x + entity2.size / 2;
  const centerY2 = entity2.y + entity2.size / 2;
  
  const distance = getDistance(centerX1, centerY1, centerX2, centerY2);
  const minDistance = (entity1.size + entity2.size) / 2;
  
  return distance < minDistance;
};

/**
 * Check if player attack hits an enemy
 */
export const checkAttackHit = (player, enemy, attackRange = PLAYER.ATTACK_RANGE) => {
  const playerCenterX = player.x + player.size / 2;
  const playerCenterY = player.y + player.size / 2;
  const enemyCenterX = enemy.x + enemy.size / 2;
  const enemyCenterY = enemy.y + enemy.size / 2;
  
  const distance = getDistance(playerCenterX, playerCenterY, enemyCenterX, enemyCenterY);
  
  return distance <= attackRange + enemy.size / 2;
};

/**
 * Keep entity within arena bounds
 */
export const keepInBounds = (entity) => {
  return {
    ...entity,
    x: clamp(entity.x, 0, ARENA.WIDTH - entity.size),
    y: clamp(entity.y, 0, ARENA.HEIGHT - entity.size),
  };
};

/**
 * Get a random spawn position along arena edges (away from player)
 */
export const getRandomSpawnPosition = (playerX, playerY, entitySize, minDistanceFromPlayer = 150) => {
  let x, y;
  let attempts = 0;
  const maxAttempts = 50;
  
  do {
    const edge = Math.floor(Math.random() * 4);
    
    switch (edge) {
      case 0: // Top
        x = Math.random() * (ARENA.WIDTH - entitySize);
        y = 0;
        break;
      case 1: // Right
        x = ARENA.WIDTH - entitySize;
        y = Math.random() * (ARENA.HEIGHT - entitySize);
        break;
      case 2: // Bottom
        x = Math.random() * (ARENA.WIDTH - entitySize);
        y = ARENA.HEIGHT - entitySize;
        break;
      case 3: // Left
        x = 0;
        y = Math.random() * (ARENA.HEIGHT - entitySize);
        break;
      default:
        x = 0;
        y = 0;
    }
    
    attempts++;
  } while (
    getDistance(x, y, playerX, playerY) < minDistanceFromPlayer &&
    attempts < maxAttempts
  );
  
  return { x, y };
};

/**
 * Get random position anywhere in arena (for items, etc.)
 */
export const getRandomArenaPosition = (entitySize, padding = 50) => {
  return {
    x: padding + Math.random() * (ARENA.WIDTH - entitySize - padding * 2),
    y: padding + Math.random() * (ARENA.HEIGHT - entitySize - padding * 2),
  };
};

/**
 * Calculate enemy stats based on room number
 */
export const getEnemyStatsForRoom = (room) => {
  const multiplier = 1 + (room - 1) * ROOMS.DIFFICULTY_MULTIPLIER;
  
  return {
    health: Math.round(ENEMY.BASE_HEALTH * multiplier),
    damage: Math.round(ENEMY.BASE_DAMAGE * multiplier),
    speed: ENEMY.BASE_SPEED + (room - 1) * 0.3,
  };
};

/**
 * Create a new enemy entity
 */
export const createEnemy = (playerX, playerY, room) => {
  const stats = getEnemyStatsForRoom(room);
  const position = getRandomSpawnPosition(playerX, playerY, ENEMY.SIZE);
  const sprite = getEnemySpriteByDifficulty(room);
  
  return {
    id: generateId(),
    type: 'enemy',
    x: position.x,
    y: position.y,
    size: ENEMY.SIZE,
    health: stats.health,
    maxHealth: stats.health,
    damage: stats.damage,
    speed: stats.speed,
    baseSpeed: stats.speed,
    sprite: sprite,
    lastAttackTime: 0,
    isHit: false,
    hitTimer: 0,
    // Status effects
    statusEffects: [],
  };
};

/**
 * Create the boss entity
 */
export const createBoss = (playerX, playerY) => {
  const position = getRandomSpawnPosition(playerX, playerY, BOSS.SIZE, 200);
  
  return {
    id: generateId(),
    type: 'boss',
    x: position.x,
    y: position.y,
    size: BOSS.SIZE,
    health: BOSS.HEALTH,
    maxHealth: BOSS.HEALTH,
    damage: BOSS.DAMAGE,
    speed: BOSS.SPEED,
    baseSpeed: BOSS.SPEED,
    sprite: BOSS.SPRITE,
    lastAttackTime: 0,
    isHit: false,
    hitTimer: 0,
    statusEffects: [],
  };
};

/**
 * Create initial player state
 */
export const createPlayer = () => {
  return {
    id: generateId(),
    type: 'player',
    x: ARENA.WIDTH / 2 - PLAYER.SIZE / 2,
    y: ARENA.HEIGHT / 2 - PLAYER.SIZE / 2,
    size: PLAYER.SIZE,
    health: PLAYER.MAX_HEALTH,
    maxHealth: PLAYER.MAX_HEALTH,
    damage: PLAYER.ATTACK_DAMAGE,
    baseDamage: PLAYER.ATTACK_DAMAGE,
    speed: PLAYER.SPEED,
    baseSpeed: PLAYER.SPEED,
    sprite: PLAYER.SPRITE,
    lastAttackTime: 0,
    isAttacking: false,
    attackTimer: 0,
    direction: 'right',
    isHit: false,
    hitTimer: 0,
    // Equipment and buffs
    weapon: null,
    activeBuffs: [],
  };
};

/**
 * Move enemy towards player
 */
export const moveTowardsPlayer = (enemy, playerX, playerY) => {
  const enemyCenterX = enemy.x + enemy.size / 2;
  const enemyCenterY = enemy.y + enemy.size / 2;
  const playerCenterX = playerX + PLAYER.SIZE / 2;
  const playerCenterY = playerY + PLAYER.SIZE / 2;
  
  const dx = playerCenterX - enemyCenterX;
  const dy = playerCenterY - enemyCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return enemy;
  
  // Use current speed (may be affected by status effects)
  const normalizedX = dx / distance;
  const normalizedY = dy / distance;
  
  const newX = enemy.x + normalizedX * enemy.speed;
  const newY = enemy.y + normalizedY * enemy.speed;
  
  return keepInBounds({
    ...enemy,
    x: newX,
    y: newY,
  });
};

/**
 * Calculate player movement based on pressed keys
 */
export const calculatePlayerMovement = (player, keysPressed) => {
  let dx = 0;
  let dy = 0;
  let direction = player.direction;
  
  if (keysPressed.up) {
    dy -= player.speed;
    direction = 'up';
  }
  if (keysPressed.down) {
    dy += player.speed;
    direction = 'down';
  }
  if (keysPressed.left) {
    dx -= player.speed;
    direction = 'left';
  }
  if (keysPressed.right) {
    dx += player.speed;
    direction = 'right';
  }
  
  // Normalize diagonal movement
  if (dx !== 0 && dy !== 0) {
    const normalizer = 1 / Math.sqrt(2);
    dx *= normalizer;
    dy *= normalizer;
  }
  
  return keepInBounds({
    ...player,
    x: player.x + dx,
    y: player.y + dy,
    direction,
  });
};

/**
 * Apply damage to an entity
 */
export const applyDamage = (entity, damage) => {
  const newHealth = Math.max(0, entity.health - damage);
  return {
    ...entity,
    health: newHealth,
    isHit: true,
    hitTimer: 10,
  };
};

/**
 * Check if entity is dead
 */
export const isDead = (entity) => {
  return entity.health <= 0;
};

/**
 * Get number of enemies for a specific room
 */
export const getEnemyCountForRoom = (room) => {
  if (room < 1 || room > ROOMS.TOTAL) return 0;
  return ROOMS.ENEMIES_PER_ROOM[room];
};

/**
 * Check if current room is the boss room
 */
export const isBossRoom = (room) => {
  return room === ROOMS.BOSS_ROOM;
};

/**
 * Format time in MM:SS
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate health bar percentage
 */
export const getHealthPercentage = (current, max) => {
  return Math.max(0, Math.min(100, (current / max) * 100));
};

/**
 * Determine health bar color based on percentage
 */
export const getHealthBarColor = (percentage) => {
  if (percentage > 60) return '#22c55e';
  if (percentage > 30) return '#eab308';
  return '#ef4444';
};


// ─── ITEM HELPERS ─────────────────────────────────────────────────

/**
 * Get all item types as an array
 */
export const getAllItemTypes = () => Object.values(ITEM_TYPES);

/**
 * Roll for item drop on enemy kill
 */
export const rollForItemDrop = () => {
  const roll = Math.random();
  let cumulative = 0;
  
  // Sort items by drop chance (rarest first to check)
  const itemTypes = getAllItemTypes();
  
  for (const itemType of itemTypes) {
    const item = ITEMS[itemType];
    cumulative += item.dropChance;
    if (roll < cumulative) {
      return itemType;
    }
  }
  
  return null; // No drop
};

/**
 * Create an item entity
 */
export const createItem = (x, y, itemType) => {
  const itemConfig = ITEMS[itemType];
  if (!itemConfig) return null;
  
  return {
    id: generateId(),
    ...itemConfig,
    x,
    y,
    sprite: ITEM_SPRITES[itemType],
    createdAt: Date.now(),
    // Items disappear after 15 seconds
    expiresAt: Date.now() + 15000,
  };
};

/**
 * Create random item at position
 */
export const createRandomItem = (x, y) => {
  const itemType = rollForItemDrop();
  if (!itemType) return null;
  return createItem(x, y, itemType);
};

/**
 * Check if player can pick up item
 */
export const canPickupItem = (player, item) => {
  return checkCircleCollision(player, item);
};

/**
 * Apply item effect to player
 */
export const applyItemToPlayer = (player, item) => {
  let updatedPlayer = { ...player };
  
  switch (item.category) {
    case 'healing': {
      const newHealth = Math.min(player.maxHealth, player.health + item.healAmount);
      updatedPlayer = {
        ...updatedPlayer,
        health: newHealth,
      };
      break;
    }
    
    case 'powerup': {
      // Add buff to active buffs
      const newBuff = {
        id: generateId(),
        type: item.type,
        stat: item.stat,
        multiplier: item.multiplier,
        expiresAt: Date.now() + item.duration,
        name: item.name,
      };
      
      // Remove existing buff of same type
      const filteredBuffs = player.activeBuffs.filter(b => b.stat !== item.stat);
      
      updatedPlayer = {
        ...updatedPlayer,
        activeBuffs: [...filteredBuffs, newBuff],
      };
      
      // Apply stat changes
      updatedPlayer = recalculatePlayerStats(updatedPlayer);
      break;
    }
    
    case 'weapon': {
      updatedPlayer = {
        ...updatedPlayer,
        weapon: {
          type: item.type,
          name: item.name,
          baseDamage: item.baseDamage,
          effect: item.effect,
          effectDamage: item.effectDamage,
          effectDuration: item.effectDuration,
          effectMultiplier: item.effectMultiplier,
          chainRange: item.chainRange,
          chainDamage: item.chainDamage,
          maxChains: item.maxChains,
        },
        baseDamage: item.baseDamage,
      };
      
      // Recalculate with new weapon
      updatedPlayer = recalculatePlayerStats(updatedPlayer);
      break;
    }
    
    default:
      break;
  }
  
  return updatedPlayer;
};

/**
 * Recalculate player stats based on buffs
 */
export const recalculatePlayerStats = (player) => {
  let speed = player.baseSpeed;
  let damage = player.baseDamage;
  let defense = 1; // 1 = no reduction
  
  // Apply buffs
  for (const buff of player.activeBuffs) {
    switch (buff.stat) {
      case 'speed':
        speed *= buff.multiplier;
        break;
      case 'damage':
        damage *= buff.multiplier;
        break;
      case 'defense':
        defense *= buff.multiplier;
        break;
      default:
        break;
    }
  }
  
  return {
    ...player,
    speed,
    damage: Math.round(damage),
    defense,
  };
};

/**
 * Update player buffs (remove expired)
 */
export const updatePlayerBuffs = (player) => {
  const now = Date.now();
  const activeBuffs = player.activeBuffs.filter(buff => buff.expiresAt > now);
  
  // If buffs changed, recalculate stats
  if (activeBuffs.length !== player.activeBuffs.length) {
    return recalculatePlayerStats({
      ...player,
      activeBuffs,
    });
  }
  
  return player;
};

/**
 * Apply weapon effect to enemy
 */
export const applyWeaponEffect = (enemy, weapon) => {
  if (!weapon || !weapon.effect) return enemy;
  
  const now = Date.now();
  let updatedEnemy = { ...enemy };
  
  switch (weapon.effect) {
    case 'burn': {
      // Add burn status effect
      const burnEffect = {
        id: generateId(),
        type: 'burn',
        damage: weapon.effectDamage,
        tickInterval: 500,
        lastTick: now,
        expiresAt: now + weapon.effectDuration,
      };
      
      // Remove existing burn, add new
      const filteredEffects = enemy.statusEffects.filter(e => e.type !== 'burn');
      updatedEnemy = {
        ...updatedEnemy,
        statusEffects: [...filteredEffects, burnEffect],
      };
      break;
    }
    
    case 'slow': {
      // Add slow status effect
      const slowEffect = {
        id: generateId(),
        type: 'slow',
        multiplier: weapon.effectMultiplier,
        expiresAt: now + weapon.effectDuration,
      };
      
      const filteredEffects = enemy.statusEffects.filter(e => e.type !== 'slow');
      updatedEnemy = {
        ...updatedEnemy,
        statusEffects: [...filteredEffects, slowEffect],
        speed: enemy.baseSpeed * weapon.effectMultiplier,
      };
      break;
    }
    
    // Chain effect is handled separately in combat
    default:
      break;
  }
  
  return updatedEnemy;
};

/**
 * Update enemy status effects
 */
export const updateEnemyStatusEffects = (enemy) => {
  const now = Date.now();
  let updatedEnemy = { ...enemy };
  let damageFromEffects = 0;
  
  // Process each effect
  const activeEffects = [];
  
  for (const effect of enemy.statusEffects) {
    // Check if expired
    if (effect.expiresAt <= now) {
      // Reset stat if it was a slow
      if (effect.type === 'slow') {
        updatedEnemy.speed = updatedEnemy.baseSpeed;
      }
      continue;
    }
    
    // Process tick damage (burn)
    if (effect.type === 'burn' && now - effect.lastTick >= effect.tickInterval) {
      damageFromEffects += effect.damage;
      effect.lastTick = now;
    }
    
    activeEffects.push(effect);
  }
  
  updatedEnemy.statusEffects = activeEffects;
  
  // Apply damage from effects
  if (damageFromEffects > 0) {
    updatedEnemy = applyDamage(updatedEnemy, damageFromEffects);
  }
  
  return updatedEnemy;
};

/**
 * Get enemies in chain range for lightning staff
 */
export const getEnemiesInChainRange = (sourceEnemy, allEnemies, chainRange, excludeIds = []) => {
  const sourceCenterX = sourceEnemy.x + sourceEnemy.size / 2;
  const sourceCenterY = sourceEnemy.y + sourceEnemy.size / 2;
  
  return allEnemies.filter(enemy => {
    if (enemy.id === sourceEnemy.id || excludeIds.includes(enemy.id)) return false;
    
    const enemyCenterX = enemy.x + enemy.size / 2;
    const enemyCenterY = enemy.y + enemy.size / 2;
    const distance = getDistance(sourceCenterX, sourceCenterY, enemyCenterX, enemyCenterY);
    
    return distance <= chainRange;
  });
};


// ─── OBSTACLE HELPERS ─────────────────────────────────────────────

/**
 * Get number of obstacles for a room
 */
export const getObstacleCountForRoom = (room) => {
  if (room < 0 || room >= OBSTACLES_PER_ROOM.length) return 0;
  return OBSTACLES_PER_ROOM[room];
};

/**
 * Get random obstacle type
 */
export const getRandomObstacleType = () => {
  const types = Object.values(OBSTACLE_TYPES);
  return types[Math.floor(Math.random() * types.length)];
};

/**
 * Create an obstacle entity
 */
export const createObstacle = (existingObstacles = [], existingItems = [], playerX, playerY) => {
  const obstacleType = getRandomObstacleType();
  const obstacleConfig = OBSTACLES[obstacleType];
  
  // Find position that doesn't overlap with other obstacles, items, or player
  let position;
  let attempts = 0;
  const maxAttempts = 30;
  const minDistFromPlayer = 100;
  const minDistFromOthers = 80;
  
  do {
    position = getRandomArenaPosition(obstacleConfig.size, 60);
    attempts++;
    
    // Check distance from player
    const distFromPlayer = getDistance(position.x, position.y, playerX, playerY);
    if (distFromPlayer < minDistFromPlayer) continue;
    
    // Check distance from other obstacles
    const tooCloseToObstacle = existingObstacles.some(obs => {
      const dist = getDistance(position.x, position.y, obs.x, obs.y);
      return dist < minDistFromOthers;
    });
    if (tooCloseToObstacle) continue;
    
    // Position is valid
    break;
  } while (attempts < maxAttempts);
  
  return {
    id: generateId(),
    ...obstacleConfig,
    x: position.x,
    y: position.y,
    sprite: OBSTACLE_SPRITES[obstacleType],
    lastDamageTime: {},
  };
};

/**
 * Create all obstacles for a room
 */
export const createObstaclesForRoom = (room, playerX, playerY) => {
  const count = getObstacleCountForRoom(room);
  const obstacles = [];
  
  for (let i = 0; i < count; i++) {
    const obstacle = createObstacle(obstacles, [], playerX, playerY);
    obstacles.push(obstacle);
  }
  
  return obstacles;
};

/**
 * Check if entity is on obstacle
 */
export const isOnObstacle = (entity, obstacle) => {
  return checkCircleCollision(entity, obstacle);
};

/**
 * Apply obstacle effect to entity
 */
export const applyObstacleEffect = (entity, obstacle, isPlayer = true) => {
  // Check if obstacle affects this entity type
  if (isPlayer && !obstacle.affectsPlayer) return { entity, damaged: false };
  if (!isPlayer && !obstacle.affectsEnemies) return { entity, damaged: false };
  
  const now = Date.now();
  const entityKey = entity.id;
  const lastDamage = obstacle.lastDamageTime[entityKey] || 0;
  
  // Check if enough time passed since last damage
  if (now - lastDamage < obstacle.damageInterval) {
    return { entity, damaged: false, obstacle };
  }
  
  // Apply damage
  let updatedEntity = applyDamage(entity, obstacle.damage);
  
  // Apply slow if poison pool
  if (obstacle.type === OBSTACLE_TYPES.POISON_POOL && obstacle.slowMultiplier) {
    updatedEntity = {
      ...updatedEntity,
      speed: (updatedEntity.baseSpeed || updatedEntity.speed) * obstacle.slowMultiplier,
    };
  }
  
  // Update last damage time
  const updatedObstacle = {
    ...obstacle,
    lastDamageTime: {
      ...obstacle.lastDamageTime,
      [entityKey]: now,
    },
  };
  
  return { entity: updatedEntity, damaged: true, obstacle: updatedObstacle };
};