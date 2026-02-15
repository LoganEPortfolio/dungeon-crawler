// src/components/RoomTransition.jsx
import { useEffect, useState } from 'react';
import { isBossRoom } from '../utils/helpers';
import { ROOMS } from '../utils/constants';
import { getEnemySpriteByDifficulty } from '../utils/sprites';
import { BOSS } from '../utils/constants';

function RoomTransition({ currentRoom, message }) {
  const [countdown, setCountdown] = useState(2);
  const nextRoom = currentRoom + 1;
  const nextIsBoss = isBossRoom(nextRoom);
  const isLastRoom = currentRoom >= ROOMS.TOTAL;

  useEffect(() => {
    if (isLastRoom) return;

    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isLastRoom]);

  return (
    <div className="game-screen transition-screen">

      {/* Cleared message */}
      <div className="transition-cleared">
        <h2>✨ {message} ✨</h2>
      </div>

      {/* Next room preview */}
      {!isLastRoom && (
        <div className="transition-next">

          <p className="transition-label">Next Up</p>

          <div className={`transition-preview ${nextIsBoss ? 'boss-preview' : ''}`}>
            {nextIsBoss ? (
              <>
                <div
                  className="transition-sprite boss-incoming"
                  dangerouslySetInnerHTML={{ __html: BOSS.SPRITE }}
                />
                <div className="transition-room-info">
                  <span className="transition-room-num">Room {nextRoom}</span>
                  <span className="transition-room-type boss-type">
                    👑 BOSS FIGHT
                  </span>
                </div>
              </>
            ) : (
              <>
                <div
                  className="transition-sprite"
                  dangerouslySetInnerHTML={{
                    __html: getEnemySpriteByDifficulty(nextRoom),
                  }}
                />
                <div className="transition-room-info">
                  <span className="transition-room-num">Room {nextRoom}</span>
                  <span className="transition-room-type">
                    👹 Enemy Wave
                  </span>
                </div>
              </>
            )}
          </div>

          {nextIsBoss && (
            <p className="boss-warning">🐉 Prepare yourself! 🐉</p>
          )}

          <div className="transition-countdown">
            <span>Starting in </span>
            <span className="countdown-num">{countdown}</span>
          </div>

        </div>
      )}

    </div>
  );
}

export default RoomTransition;