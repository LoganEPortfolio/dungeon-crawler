// src/App.jsx
import { useState } from 'react';
import StartScreen from './components/StartScreen';
import './App.css';

function App() {
  const [started, setStarted] = useState(false);

  return (
    <div className="game-container">
      {!started ? (
        <StartScreen onStart={() => setStarted(true)} />
      ) : (
        <div className="game-screen">
          <h2>Game would start here!</h2>
          <button onClick={() => setStarted(false)}>Back to Start</button>
        </div>
      )}
    </div>
  );
}

export default App;