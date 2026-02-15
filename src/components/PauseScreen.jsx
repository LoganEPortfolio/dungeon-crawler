// src/components/PauseScreen.jsx

function PauseScreen({ currentRoom, score, onResume, onQuit }) {
  return (
    <div className="game-screen pause-screen">

      <h2>⏸️ Paused</h2>

      <div className="pause-info">
        <p>Room {currentRoom} / 5</p>
        <p>Score: {score}</p>
      </div>

      <div className="pause-hint">
        <p>Press <span className="key-hint">P</span> or <span className="key-hint">ESC</span> to resume</p>
      </div>

      <div className="screen-buttons">
        <button className="btn-primary" onClick={onResume}>
          ▶️ Resume
        </button>
        <button className="btn-secondary" onClick={onQuit}>
          🏠 Quit to Menu
        </button>
      </div>

    </div>
  );
}

export default PauseScreen;