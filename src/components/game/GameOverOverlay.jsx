function GameOverOverlay({ isVictory, reason, score, length, onRestart }) {
  return (
    <section className="overlay" role="dialog" aria-modal="true">
      <div className="overlay-card hand-drawn-border inky-borders">
        <h2 className="overlay-title">{isVictory ? 'Proteina completada' : 'Mutacion fatal'}</h2>
        <p className="overlay-text">{reason}</p>
        <p className="overlay-stats">Puntaje final: {score}</p>
        <p className="overlay-stats">Longitud de cadena: {length} aminoacidos</p>
        <button className="vintage-btn" type="button" onClick={onRestart}>
          Jugar de nuevo
        </button>
      </div>
    </section>
  );
}

export default GameOverOverlay;
