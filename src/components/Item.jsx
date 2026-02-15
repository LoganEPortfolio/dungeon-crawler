// src/components/Item.jsx
import { memo } from 'react';

const Item = memo(function Item({ item }) {
  if (!item) return null;

  const { x, y, size, sprite, name, rarity, category } = item;

  const rarityClass = `item-${rarity}`;
  const categoryClass = `item-${category}`;

  return (
    <div
      className={`item ${rarityClass} ${categoryClass}`}
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
      }}
      title={name}
    >
      <div
        className="item-sprite"
        dangerouslySetInnerHTML={{ __html: sprite }}
      />
      <div className="item-glow" />
    </div>
  );
});

export default Item;