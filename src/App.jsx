import { useEffect, useMemo, useReducer, useRef } from 'react'
import './App.css'
import ToastStack from './components/ToastStack'
import { BASE_COLORS, CODON_TABLE, DIFFICULTY_PROFILES, GAME_CONFIG, getAnticodon } from './game/data'
import { createInitialGameState, gameReducer } from './game/engine'

const CODON_WINDOW = 9

const toneByFeedback = {
  success: 660,
  error: 220,
  timeout: 180,
}

const renderCodon = (codon) => codon.split('').map((base, index) => (
  <span key={`${codon}-${index}`} className="base-chip" style={{ color: BASE_COLORS[base] }}>
    {base}
  </span>
))

const formatNumber = (value) => Intl.NumberFormat('en-US').format(Math.round(value))

function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState)
  const audioContextRef = useRef(null)

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
    if (state.toasts.length === 0) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      dispatch({ type: 'DISMISS_TOAST', payload: state.toasts[state.toasts.length - 1].id })
    }, 1700)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [state.toasts])

  useEffect(() => {
    if (state.feedback.token === 0) {
      return
    }

    const frequency = toneByFeedback[state.feedback.type]
    if (!frequency) {
      return
    }

    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) {
      return
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new Ctx()
    }

    const audioContext = audioContextRef.current
    if (!audioContext) {
      return
    }

    audioContext.resume().catch(() => {})
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()

    oscillator.type = state.feedback.type === 'success' ? 'triangle' : 'square'
    oscillator.frequency.value = frequency
    gain.gain.value = 0.0001

    oscillator.connect(gain)
    gain.connect(audioContext.destination)

    const startAt = audioContext.currentTime
    gain.gain.exponentialRampToValueAtTime(0.14, startAt + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.22)

    oscillator.start(startAt)
    oscillator.stop(startAt + 0.23)
  }, [state.feedback])

  useEffect(() => () => {
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {})
    }
  }, [])

  const difficulty = DIFFICULTY_PROFILES[state.difficulty]
  const remainingPercent = Math.max(0, Math.min(100, (state.remainingMs / difficulty.timerMs) * 100))

  const codonWindow = useMemo(() => {
    if (!state.sequence.length) {
      return []
    }

    const half = Math.floor(CODON_WINDOW / 2)
    let start = Math.max(0, state.currentCodonIndex - half)
    let end = start + CODON_WINDOW

    if (end > state.sequence.length) {
      end = state.sequence.length
      start = Math.max(0, end - CODON_WINDOW)
    }

    return state.sequence.slice(start, end).map((codon, offset) => {
      const index = start + offset
      return {
        codon,
        index,
        isActive: index === state.currentCodonIndex,
      }
    })
  }, [state.sequence, state.currentCodonIndex])

  const manualRows = useMemo(
    () => Object.keys(CODON_TABLE).slice(0, 8).map((codon) => ({
      codon,
      anticodon: getAnticodon(codon),
      amino: CODON_TABLE[codon].amino,
      color: CODON_TABLE[codon].color,
    })),
    [],
  )

  const chainPreview = useMemo(() => {
    const visibles = state.chain.slice(-GAME_CONFIG.chainPreviewLength)
    const ghostCount = Math.max(0, GAME_CONFIG.chainPreviewLength - visibles.length)
    return {
      visibles,
      ghostCount,
    }
  }, [state.chain])

  const handleDragStart = (event, cardId) => {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('text/plain', cardId)
  }

  const handleDropInA = (event) => {
    event.preventDefault()
    event.currentTarget.classList.remove('drag-over')

    const cardId = event.dataTransfer.getData('text/plain')
    if (!cardId) {
      return
    }

    dispatch({ type: 'DROP_TRNA', cardId })
  }

  const allowDrop = (event) => {
    event.preventDefault()
    event.currentTarget.classList.add('drag-over')
  }

  const removeDropHighlight = (event) => {
    event.currentTarget.classList.remove('drag-over')
  }

  const feedbackClass = state.feedback.type === 'error' ? 'fx-shake' : state.feedback.type === 'timeout' ? 'fx-timeout' : ''

  const renderSite = (label, key, payload, isDropZone = false) => (
    <article
      className={`site site-${key} ${isDropZone ? 'site-drop' : ''}`.trim()}
      onDragOver={isDropZone ? allowDrop : undefined}
      onDragLeave={isDropZone ? removeDropHighlight : undefined}
      onDrop={isDropZone ? handleDropInA : undefined}
    >
      <span className="site-label">{label}</span>
      {payload ? (
        <div className="site-payload">
          <strong>{payload.anticodon}</strong>
          <small>{payload.amino}</small>
        </div>
      ) : (
        <div className="site-empty">{isDropZone ? 'Drop ARNt' : 'vacio'}</div>
      )}
    </article>
  )

  return (
    <main className={`ribosome-game ${feedbackClass}`.trim()}>
      <header className="hud-top">
        <article className="hud-codon">
          <h1>Codon actual</h1>
          <div className="codon-value">
            {state.currentCodon ? renderCodon(state.currentCodon) : '---'}
          </div>
          <p>
            Anti: <strong>{state.currentCodon ? getAnticodon(state.currentCodon) : '---'}</strong>
          </p>
        </article>

        <article className="hud-timer">
          <div className="hud-title-row">
            <span>Timer</span>
            <span>{Math.ceil(state.remainingMs / 1000)}s</span>
          </div>
          <div className="timer-bar">
            <div
              className={`timer-fill ${remainingPercent < 33 ? 'danger' : remainingPercent < 66 ? 'warn' : ''}`.trim()}
              style={{ width: `${remainingPercent}%` }}
            />
          </div>
          <div className="controls">
            <label htmlFor="difficulty">Dificultad</label>
            <select
              id="difficulty"
              value={state.difficulty}
              onChange={(event) => dispatch({ type: 'SET_DIFFICULTY', payload: event.target.value })}
            >
              {Object.entries(DIFFICULTY_PROFILES).map(([key, profile]) => (
                <option key={key} value={key}>
                  {profile.label} ({Math.floor(profile.timerMs / 1000)}s / {profile.poolSize} cartas)
                </option>
              ))}
            </select>
            <button type="button" className="btn primary" onClick={() => dispatch({ type: 'START_GAME' })}>
              {state.isRunning ? 'Reiniciar' : 'Iniciar'}
            </button>
            <button type="button" className="btn" onClick={() => dispatch({ type: 'TOGGLE_MANUAL' })}>
              Manual
            </button>
          </div>
        </article>

        <article className="hud-score">
          <h2>Puntos</h2>
          <strong>{formatNumber(state.score)}</strong>
          <p>Combo x{state.combo}</p>
          <small>Max x{state.bestCombo}</small>
        </article>
      </header>

      <section className="stage-board">
        <div className="ribosome-shell">
          <div className="sites-row">
            {renderSite('E', 'e', state.slots.e)}
            {renderSite('P', 'p', state.slots.p)}
            {renderSite('A', 'a', state.slots.a, true)}
          </div>

          <div className="mrna-track" aria-label="Flujo de ARNm 5 a 3">
            <span className="mrna-end">5'</span>
            <div className="mrna-strip">
              {codonWindow.map((entry) => (
                <div key={`${entry.codon}-${entry.index}`} className={`mrna-codon ${entry.isActive ? 'active' : ''}`.trim()}>
                  {renderCodon(entry.codon)}
                </div>
              ))}
            </div>
            <span className="mrna-end">3'</span>
          </div>
        </div>
      </section>

      <section className="pool-section">
        <h3>ARNt disponibles</h3>
        <div className="trna-pool">
          {state.trnaPool.map((card) => (
            <article
              key={card.id}
              className="trna-card"
              draggable
              onDragStart={(event) => handleDragStart(event, card.id)}
            >
              <header>{card.anticodon}</header>
              <div className="trna-icon">tRNA</div>
              <footer>
                <span className="amino-dot" style={{ backgroundColor: card.color }} />
                {card.amino}
              </footer>
            </article>
          ))}
        </div>
      </section>

      <section className="chain-section">
        <h3>Cadena polipeptidica</h3>
        <div className="chain-track">
          {chainPreview.visibles.map((node, index) => (
            <div key={`${node.amino}-${index}`} className="chain-node" style={{ backgroundColor: node.color }} />
          ))}
          {Array.from({ length: chainPreview.ghostCount }).map((_, index) => (
            <div key={`ghost-${index}`} className="chain-node ghost" />
          ))}
        </div>
      </section>

      <section className="feedback-panel" aria-live="polite">
        <article className="feedback-item ok">
          <strong>Correcto</strong>
          <p>Entra al sitio A, suma combo y avanza.</p>
        </article>
        <article className="feedback-item bad">
          <strong>Incorrecto</strong>
          <p>Rebota, resta puntos y corta combo.</p>
        </article>
        <article className="feedback-item time">
          <strong>Tiempo agotado</strong>
          <p>El ribosoma avanza y cuenta error.</p>
        </article>
      </section>

      {state.manualOpen && (
        <div className="manual-backdrop" onClick={() => dispatch({ type: 'TOGGLE_MANUAL' })}>
          <section className="manual-sheet" onClick={(event) => event.stopPropagation()}>
            <header>
              <h2>Manual</h2>
              <button type="button" className="btn" onClick={() => dispatch({ type: 'TOGGLE_MANUAL' })}>Cerrar</button>
            </header>

            <ol>
              <li>1 codon = 1 decision. Arrastra el ARNt correcto al sitio A.</li>
              <li>El anticodon debe complementar al codon activo.</li>
              <li>Si fallas o se agota el tiempo, penaliza y transloca.</li>
            </ol>

            <table>
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
                    <td>
                      <span className="amino-dot" style={{ backgroundColor: row.color }} />
                      {row.amino}
                    </td>
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
