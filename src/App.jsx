// src/App.jsx
import { GameProvider } from './context/GameContext';
import { Game } from './components';
import './App.css';

function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}

export default App;