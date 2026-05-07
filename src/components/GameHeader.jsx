import './GameHeader.css'

const GameHeader = ({
  difficultyKey,
  difficultyProfiles,
  remainingMs,
  timerCap,
  isRunning,
  isPaused,
  level,
  score,
  combo,
  bestCombo,
  onDifficultyChange,
  onPrimaryAction,
  onPauseToggle,
  onToggleManual,
  onToggleGuide,
}) => {
  const difficulty = difficultyProfiles[difficultyKey]
  const remainingPercent = Math.max(0, Math.min(100, (remainingMs / timerCap) * 100))

  return (
    <header className="game-header">
      <section className="game-header__timer-card">
        <div className="game-header__topline">
          <div>
            <span className="game-header__eyebrow">Timer</span>
            <strong>{Math.ceil(remainingMs / 1000)}s</strong>
          </div>
          <span className="game-header__difficulty-pill">{difficulty.label}</span>
        </div>

        <div className="game-header__bar">
          <div
            className={`game-header__fill ${remainingPercent < 33 ? 'is-danger' : remainingPercent < 66 ? 'is-warn' : ''}`.trim()}
            style={{ width: `${remainingPercent}%` }}
          />
        </div>

        <div className="game-header__controls">
          <label htmlFor="difficulty">Dificultad</label>
          <select
            id="difficulty"
            value={difficultyKey}
            onChange={(event) => onDifficultyChange(event.target.value)}
          >
            {Object.entries(difficultyProfiles).map(([key, profile]) => (
              <option key={key} value={key}>
                {profile.label} ({profile.timerMinMs / 1000}-{profile.timerMaxMs / 1000}s / {profile.poolSize} ARNt's / entrada {profile.incomingCodonWindow})
              </option>
            ))}
          </select>

          <button type="button" className="game-btn game-btn--primary" onClick={onPrimaryAction}>
            {isRunning ? 'Reiniciar' : 'Iniciar'}
          </button>

          <button type="button" className="game-btn" onClick={onPauseToggle} disabled={!isRunning}>
            {isPaused ? 'Reanudar' : 'Pausar'}
          </button>

          <button type="button" className="game-btn" onClick={onToggleManual}>
            Código genético 🧬
          </button>

          <button type="button" className="game-btn" onClick={onToggleGuide}>
            Manual básico
          </button>
        </div>
      </section>

      <section className="game-header__score-card">
        <span className="game-header__level-chip">Nivel {level}</span>
        <h2>Puntos</h2>
        <strong>{Intl.NumberFormat('en-US').format(Math.round(score))}</strong>
        <p>Combo x{combo}</p>
        <small>Max x{bestCombo}</small>
      </section>
    </header>
  )
}

export default GameHeader