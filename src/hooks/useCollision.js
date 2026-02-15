// src/hooks/useCollision.js
import { useCallback } from 'react';
import {
  checkCollision,
  checkCircleCollision,
  checkAttackHit,
  getDistance,
} from '../utils/helpers';

/**
 * Custom hook that provides collision detection utilities
 */
export function useCollision() {
  /**
   * Check if player is colliding with any enemies
   * Returns array of colliding enemy IDs
   */
  const getPlayerEnemyCollisions = useCallback((player, enemies) => {
    if (!player || !enemies.length) return [];

    return enemies
      .filter((enemy) => checkCircleCollision(player, enemy))
      .map((enemy) => enemy.id);
  }, []);

  /**
   * Check which enemies are within player's attack range
   * Returns array of enemy IDs in range
   */
  const getEnemiesInAttackRange = useCallback((player, enemies, attackRange) => {
    if (!player || !enemies.length) return [];

    return enemies
      .filter((enemy) => checkAttackHit(player, enemy, attackRange))
      .map((enemy) => enemy.id);
  }, []);

  /**
   * Get the closest enemy to the player
   * Returns enemy object or null
   */
  const getClosestEnemy = useCallback((player, enemies) => {
    if (!player || !enemies.length) return null;

    let closest = null;
    let closestDistance = Infinity;

    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;

    enemies.forEach((enemy) => {
      const enemyCenterX = enemy.x + enemy.size / 2;
      const enemyCenterY = enemy.y + enemy.size / 2;
      const distance = getDistance(playerCenterX, playerCenterY, enemyCenterX, enemyCenterY);

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = enemy;
      }
    });

    return closest;
  }, []);

  /**
   * Check if two entities are colliding (rectangle collision)
   */
  const areColliding = useCallback((entity1, entity2) => {
    return checkCollision(entity1, entity2);
  }, []);

  /**
   * Check if two entities are colliding (circle collision)
   */
  const areCollidingCircle = useCallback((entity1, entity2) => {
    return checkCircleCollision(entity1, entity2);
  }, []);

  /**
   * Get distance between two entities (center to center)
   */
  const getEntityDistance = useCallback((entity1, entity2) => {
    const x1 = entity1.x + entity1.size / 2;
    const y1 = entity1.y + entity1.size / 2;
    const x2 = entity2.x + entity2.size / 2;
    const y2 = entity2.y + entity2.size / 2;
    return getDistance(x1, y1, x2, y2);
  }, []);

  /**
   * Check if entity is within range of a point
   */
  const isInRange = useCallback((entity, x, y, range) => {
    const entityCenterX = entity.x + entity.size / 2;
    const entityCenterY = entity.y + entity.size / 2;
    return getDistance(entityCenterX, entityCenterY, x, y) <= range;
  }, []);

  /**
   * Get all enemies within a certain range of a point
   */
  const getEnemiesInRange = useCallback((enemies, x, y, range) => {
    return enemies.filter((enemy) => isInRange(enemy, x, y, range));
  }, [isInRange]);

  return {
    getPlayerEnemyCollisions,
    getEnemiesInAttackRange,
    getClosestEnemy,
    areColliding,
    areCollidingCircle,
    getEntityDistance,
    isInRange,
    getEnemiesInRange,
  };
}

export default useCollision;