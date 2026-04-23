function StartOverlay({ onStart }) {
  return (
    <section className="overlay" role="dialog" aria-modal="true">
      <div className="overlay-card hand-drawn-border inky-borders">
        <h2 className="overlay-title">Sintetiza la Proteina</h2>
        <p className="overlay-text">
          El ARNm avanzara por el ribosoma. Veras el aminoacido con letras ocultas y debes
          escribir el nombre completo antes de que se acabe el tiempo.
        </p>
        <p className="overlay-note">No importa si escribes con o sin acentos.</p>
        <button className="vintage-btn" type="button" onClick={onStart}>
          Comenzar traduccion
        </button>
      </div>
    </section>
  );
}

export default StartOverlay;
