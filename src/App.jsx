import { useEffect, useMemo, useReducer } from 'react'
import './App.css'
import ToastStack from './components/ToastStack'
import VintageButton from './components/VintageButton'
import { CODON_TO_AA, DIFFICULTY_PROFILES, GAME_CONFIG } from './game/data'
import { createInitialGameState, gameReducer, getAnticodon } from './game/engine'

const livesToIcons = (lives) => {
  const icons = []
  for (let i = 0; i < GAME_CONFIG.codonLives; i += 1) {
    icons.push(i < lives ? '●' : '○')
  }
  return icons.join(' ')
}

function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState)

  useEffect(() => {
    if (!state.isRunning) {
      return undefined
    }

    const timer = window.setInterval(() => {
      dispatch({ type: 'TICK', deltaMs: GAME_CONFIG.tickRateMs })
    }, GAME_CONFIG.tickRateMs)

    return () => {
      window.clearInterval(timer)
    }
  }, [state.isRunning])

  useEffect(() => {
    if (!state.selected.trna || !state.selected.aa) {
      return
    }

    dispatch({ type: 'CRAFT' })
  }, [state.selected.trna, state.selected.aa])

  useEffect(() => {
    if (state.toasts.length === 0) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      dispatch({ type: 'DISMISS_TOAST', payload: state.toasts[state.toasts.length - 1].id })
    }, 2200)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [state.toasts])

  const difficulty = DIFFICULTY_PROFILES[state.difficulty]
  const remainingPercent = Math.max(0, Math.min(100, (state.remainingMs / difficulty.timePerCodonMs) * 100))

  const belt = useMemo(() => {
    if (!state.currentCodon) {
      return {
        previous: null,
        current: null,
        next: null,
      }
    }

    return {
      previous: state.sequence[state.currentCodonIndex - 1] || null,
      current: state.currentCodon,
      next: state.sequence[state.currentCodonIndex + 1] || null,
    }
  }, [state.sequence, state.currentCodonIndex, state.currentCodon])

  const manualRows = useMemo(
    () => Object.keys(CODON_TO_AA).map((codon) => ({
      codon,
      anticodon: getAnticodon(codon),
      amino: CODON_TO_AA[codon],
    })),
    [],
  )

  const handleDragStart = (event, payload) => {
    event.dataTransfer.setData('application/json', JSON.stringify(payload))
  }

  const handleCenterDrop = (event, target) => {
    event.preventDefault()
    event.currentTarget.classList.remove('drag-over')

    const raw = event.dataTransfer.getData('application/json')
    if (!raw) {
      return
    }

    const payload = JSON.parse(raw)
    dispatch({
      type: 'DROP_CARD',
      sourceType: payload.sourceType,
      cardId: payload.cardId,
      target,
    })
  }

  const allowDrop = (event) => {
    event.preventDefault()
    event.currentTarget.classList.add('drag-over')
  }

  const removeDropHighlight = (event) => {
    event.currentTarget.classList.remove('drag-over')
  }

  return (
    <main className={`minimal-game ${state.feedback.type === 'error' ? 'fx-shake' : ''}`.trim()}>
      <header className="top-controls">
        <h1 className="headline">Apurada Ribosomica</h1>
        <div className="control-pack">
          <label htmlFor="difficulty" className="control-label">Dificultad</label>
          <select
            id="difficulty"
            className="difficulty-select"
            value={state.difficulty}
            onChange={(event) => dispatch({ type: 'SET_DIFFICULTY', payload: event.target.value })}
          >
            {Object.entries(DIFFICULTY_PROFILES).map(([key, profile]) => (
              <option key={key} value={key}>
                {profile.label}: {Math.floor(profile.timePerCodonMs / 1000)}s | mazo {profile.deckSize}
              </option>
            ))}
          </select>
          <VintageButton variant="primary" onClick={() => dispatch({ type: 'START_GAME' })}>
            Iniciar
          </VintageButton>
          <VintageButton variant="secondary" onClick={() => dispatch({ type: 'TOGGLE_MANUAL' })}>
            Manual
          </VintageButton>
          <span className="score-chip">Score: {Math.round(state.score)}</span>
        </div>
      </header>

      <section className="ribosome-belt">
        <div className="belt-track">
          <article className="belt-card side-card">
            <span className="belt-label">Previo</span>
            <strong>{belt.previous || '---'}</strong>
          </article>

          <article className="belt-card current-card">
            <span className="belt-label">Codon actual</span>
            <strong>{belt.current || '---'}</strong>
            {belt.current && (
              <small>
                anti {getAnticodon(belt.current)}
              </small>
            )}
          </article>

          <article className="belt-card side-card">
            <span className="belt-label">Siguiente</span>
            <strong>{belt.next || '---'}</strong>
          </article>
        </div>
      </section>

      <section className="life-strip">
        <article className="life-box">
          <span className="life-label">Vida del codon</span>
          <div className="life-bar-bg">
            <div className="life-bar" style={{ width: `${remainingPercent}%` }} />
          </div>
          <div className="life-row">
            <span>{Math.ceil(state.remainingMs / 1000)}s</span>
            <span>{livesToIcons(state.codonLives)}</span>
          </div>
        </article>
      </section>

      <section className="cards-stage">
        <article className="deck-column">
          <h2 className="deck-title">Cartas ARNt</h2>
          <div className="deck-grid">
            {state.trnaDeck.map((card) => (
              <button
                key={card.id}
                type="button"
                className="game-card trna"
                draggable
                onDragStart={(event) => handleDragStart(event, { sourceType: 'trna', cardId: card.id })}
              >
                {card.value}
              </button>
            ))}
          </div>
        </article>

        <article className="craft-center">
          <div
            className="drop-target"
            onDragOver={allowDrop}
            onDragLeave={removeDropHighlight}
            onDrop={(event) => handleCenterDrop(event, 'trna')}
          >
            <span className="drop-label">Tira ARNt al centro</span>
            <strong>{state.selected.trna?.value || 'Drop'}</strong>
          </div>
          <div className="plus">+</div>
          <div
            className="drop-target"
            onDragOver={allowDrop}
            onDragLeave={removeDropHighlight}
            onDrop={(event) => handleCenterDrop(event, 'aa')}
          >
            <span className="drop-label">Tira Aminoacido</span>
            <strong>{state.selected.aa?.value || 'Drop'}</strong>
          </div>
          <p className="craft-hint">Cuando ambos slots estan completos, el crafteo se evalua automaticamente.</p>
        </article>

        <article className="deck-column">
          <h2 className="deck-title">Cartas Aminoacido</h2>
          <div className="deck-grid">
            {state.aaDeck.map((card) => (
              <button
                key={card.id}
                type="button"
                className="game-card aa"
                draggable
                onDragStart={(event) => handleDragStart(event, { sourceType: 'aa', cardId: card.id })}
              >
                {card.value}
              </button>
            ))}
          </div>
        </article>
      </section>

      {state.manualOpen && (
        <div className="manual-modal-backdrop" onClick={() => dispatch({ type: 'TOGGLE_MANUAL' })}>
          <section className="manual-modal" onClick={(event) => event.stopPropagation()}>
            <header className="manual-header">
              <h2 className="headline">Carta del chef genetico</h2>
              <VintageButton variant="danger" onClick={() => dispatch({ type: 'TOGGLE_MANUAL' })}>
                Cerrar
              </VintageButton>
            </header>
            <table className="manual-table">
              <thead>
                <tr>
                  <th>Codon</th>
                  <th>Anticodon</th>
                  <th>Aminoacido</th>
                </tr>
              </thead>
              <tbody>
                {manualRows.map((row) => (
                  <tr key={row.codon}>
                    <td>{row.codon}</td>
                    <td>{row.anticodon}</td>
                    <td>{row.amino}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      )}

      <ToastStack toasts={state.toasts} />
    </main>
  )
}

export default App
