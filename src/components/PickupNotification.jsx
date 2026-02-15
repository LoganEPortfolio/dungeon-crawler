// src/components/PickupNotification.jsx
import { useEffect, useState } from 'react';

function PickupNotification({ pickup, onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pickup) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [pickup, onComplete]);

  if (!visible || !pickup) return null;

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'healing': return '❤️';
      case 'powerup': return '⚡';
      case 'weapon': return '⚔️';
      default: return '✨';
    }
  };

  const getCategoryClass = (category) => {
    switch (category) {
      case 'healing': return 'pickup-healing';
      case 'powerup': return 'pickup-powerup';
      case 'weapon': return 'pickup-weapon';
      default: return '';
    }
  };

  return (
    <div className={`pickup-notification ${getCategoryClass(pickup.category)}`}>
      <span className="pickup-icon">{getCategoryIcon(pickup.category)}</span>
      <span className="pickup-name">{pickup.name}</span>
    </div>
  );
}

export default PickupNotification;