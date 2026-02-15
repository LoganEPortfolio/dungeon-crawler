// src/App.jsx
import { useState } from 'react';
import StartScreen from './components/StartScreen';
import GameOver from './components/GameOver';
import Victory from './components/Victory';
import RoomTransition from './components/RoomTransition';
import { useScreenSize } from './hooks';
import './App.css';

// Fake game stats for testing
const MOCK_STATS = {
  room: 3,
  score: 750,
  time: 187,
};

const SCREENS = ['start', 'gameover', 'victory', 'transition-normal', 'transition-boss'];

function App() {
  const [screen, setScreen] = useState('start');
  const { isMobile, arenaScale } = useScreenSize();

  const renderScreen = () => {
    switch (screen) {
      case 'start':
        return <StartScreen onStart={() => setScreen('gameover')} />;

      case 'gameover':
        return (
          <GameOver
            room={MOCK_STATS.room}
            score={MOCK_STATS.score}
            time={MOCK_STATS.time}
            onRetry={() => setScreen('start')}
            onMenu={() => setScreen('start')}
          />
        );

      case 'victory':
        return (
          <Victory
            score={MOCK_STATS.score + 500}
            time={MOCK_STATS.time}
            onPlayAgain={() => setScreen('start')}
            onMenu={() => setScreen('start')}
          />
        );

      case 'transition-normal':
        return (
          <RoomTransition
            currentRoom={2}
            message="Room 2 Cleared!"
          />
        );

      case 'transition-boss':
        return (
          <RoomTransition
            currentRoom={4}
            message="Room 4 Cleared!"
          />
        );

      default:
        return <StartScreen onStart={() => setScreen('gameover')} />;
    }
  };

  return (
    <div className="game-container">

      {/* Screen nav for testing */}
      <div className="test-nav">
        {SCREENS.map((s) => (
          <button
            key={s}
            className={`test-nav-btn ${screen === s ? 'active' : ''}`}
            onClick={() => setScreen(s)}
          >
            {s}
          </button>
        ))}
        <span className="test-device-info">
          {isMobile ? '📱 Mobile' : '🖥️ Desktop'} | Scale: {arenaScale.toFixed(2)}
        </span>
      </div>

      {renderScreen()}

    </div>
  );
}

export default App;