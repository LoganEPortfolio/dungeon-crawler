// src/components/Obstacle.jsx
import { memo } from 'react';

const Obstacle = memo(function Obstacle({ obstacle }) {
  if (!obstacle) return null;

  const { x, y, size, sprite, type, name } = obstacle;

  return (
    <div
      className={`obstacle obstacle-${type.toLowerCase()}`}
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
      }}
      title={name}
    >
      <div
        className="obstacle-sprite"
        dangerouslySetInnerHTML={{ __html: sprite }}
      />
    </div>
  );
});

export default Obstacle;