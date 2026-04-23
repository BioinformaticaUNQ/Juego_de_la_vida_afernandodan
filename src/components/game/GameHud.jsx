function GameHud({ level, score, lives }) {
  const lifeState = lives > 0 ? `${lives}/3` : '0/3';

  return (
    <header className="hud hand-drawn-border inky-borders">
      <h1 className="title">Traduccion Ribosomica</h1>
      <div className="hud-row">
        <p>
          Nivel <span>{level}</span>
        </p>
        <p>
          Vidas <span>{lifeState}</span>
        </p>
        <p>
          Puntaje <span>{score}</span>
        </p>
      </div>
    </header>
  );
}

export default GameHud;
