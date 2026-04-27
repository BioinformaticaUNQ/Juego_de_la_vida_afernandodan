import { Fragment, useEffect, useMemo, useReducer, useRef } from 'react'
import './App.css'
import ToastStack from './components/ToastStack'
import { BASE_COLORS, CODON_TABLE, DIFFICULTY_PROFILES, GAME_CONFIG, GENETIC_CODE, getAnticodon } from './game/data'
import { createInitialGameState, gameReducer } from './game/engine'

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
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)
const codonOrder = ['U', 'C', 'A', 'G']

const qualityTheme = {
  perfecta: 'quality-perfecta',
  funcional: 'quality-funcional',
  defectuosa: 'quality-defectuosa',
  degradada: 'quality-degradada',
}

function App() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialGameState)
  const audioContextRef = useRef(null)

  useEffect(() => {
    if (!state.isRunning || state.isPaused) {
      return undefined
    }

    const timer = window.setInterval(() => {
      dispatch({ type: 'TICK', deltaMs: GAME_CONFIG.tickRateMs })
    }, GAME_CONFIG.tickRateMs)

    return () => {
      window.clearInterval(timer)
    }
  }, [state.isRunning, state.isPaused])

  useEffect(() => {
    if (state.toasts.length === 0) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      dispatch({ type: 'DISMISS_TOAST', payload: state.toasts[0].id })
    }, 1550)

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
  const timerCap = Math.max(difficulty.timerMaxMs, 1)
  const remainingPercent = Math.max(0, Math.min(100, (state.remainingMs / timerCap) * 100))

  const codonWindow = useMemo(() => {
    if (!state.sequence.length) {
      return []
    }

    const windowSize = difficulty.incomingCodonWindow
    const half = Math.floor(windowSize / 2)
    return Array.from({ length: windowSize }, (_, offset) => {
      const index = state.currentCodonIndex + offset - half
      const codon = state.sequence[index]

      return {
        codon: codon || null,
        index,
        isActive: index === state.currentCodonIndex,
        isEmpty: !codon,
      }
    })
  }, [state.sequence, state.currentCodonIndex, difficulty.incomingCodonWindow])

  const manualMatrix = useMemo(
    () => codonOrder.map((first) => ({
      first,
      columns: codonOrder.map((second) => ({
        second,
        entries: codonOrder.map((third) => {
          const codon = `${first}${second}${third}`
          const info = GENETIC_CODE[codon]
          return {
            codon,
            anticodon: getAnticodon(codon),
            amino: info?.amino || '---',
            color: CODON_TABLE[codon]?.color || '#808080',
            isStop: Boolean(info?.isStop),
          }
        }),
      })),
    })),
    [],
  )

  const chainPreview = useMemo(() => {
    const previewSize = difficulty.chainGuideElements
    const visibles = state.chain.slice(-previewSize)
    const ghostCount = Math.max(0, previewSize - visibles.length)
    return {
      visibles,
      ghostCount,
    }
  }, [state.chain])

  const nextCodon = state.sequence[state.currentCodonIndex + 1] || '---'
  const resultQualityClass = state.levelResult ? qualityTheme[state.levelResult.quality] || 'quality-degradada' : ''

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
        <div className="site-empty">{isDropZone ? 'Insertar ANRT' : 'vacio'}</div>
      )}
    </article>
  )

  return (
    <main className={`ribosome-game ${feedbackClass}`.trim()}>
      <header className="hud-top">
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
                  {profile.label} ({profile.timerMinMs / 1000}-{profile.timerMaxMs / 1000}s / {profile.poolSize} cartas / entrada {profile.incomingCodonWindow})
                </option>
              ))}
            </select>
            <button type="button" className="btn primary" onClick={() => dispatch({ type: 'START_GAME' })}>
              {state.isRunning ? 'Reiniciar' : 'Iniciar'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => dispatch({ type: 'TOGGLE_PAUSE' })}
              disabled={!state.isRunning}
            >
              {state.isPaused ? 'Reanudar' : 'Pausar'}
            </button>
            <button type="button" className="btn" onClick={() => dispatch({ type: 'TOGGLE_MANUAL' })}>
              Código genético 🧬
            </button>
          </div>
        </article>

        <article className="hud-score">
          <span className="level-chip">Nivel {state.level}</span>
          <h2>Puntos</h2>
          <strong>{formatNumber(state.score)}</strong>
          <p>Combo x{state.combo}</p>
          <small>Max x{state.bestCombo}</small>
        </article>
      </header>

      <section className="stage-board">
        <section className="chain-over-ribosome">
          <h3>Cadena polipeptidica resultante</h3>
          <div className="chain-track chain-track-top">
            {chainPreview.visibles.map((node, index) => (
              <div
                key={`${node.aminoacid}-${index}`}
                className={`chain-node ${node.isError ? 'error' : ''}`.trim()}
                style={{ backgroundColor: node.color }}
              />
            ))}
            {Array.from({ length: chainPreview.ghostCount }).map((_, index) => (
              <div key={`ghost-${index}`} className="chain-node ghost" />
            ))}
          </div>
          <div className="chain-origin" aria-hidden="true" />
        </section>

        <div className="ribosome-shell">

          {state.isPaused && <div className="paused-overlay">PAUSA</div>}

          <div className="sites-row">
            {renderSite('E', 'e', state.slots.e)}
            {renderSite('P', 'p', state.slots.p)}
            {renderSite('A', 'a', state.slots.a, true)}
          </div>

          <ToastStack toasts={state.toasts} />

          <div className="mrna-track" aria-label="Flujo de ARNm 5 a 3">
            <span className="mrna-end">5'</span>
            <div className="mrna-strip" style={{ gridTemplateColumns: `repeat(${codonWindow.length || 1}, minmax(0, 1fr))` }}>
              {codonWindow.map((entry) => (
                <div
                  key={`${entry.index}-${entry.codon || 'empty'}`}
                  className={`mrna-codon ${entry.isActive ? 'active' : ''} ${entry.isEmpty ? 'empty' : ''}`.trim()}
                >
                  {entry.isEmpty ? <span className="mrna-empty">---</span> : renderCodon(entry.codon)}
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
              <div className="trna-amino-top">
                <span className="amino-dot" style={{ backgroundColor: card.color }} />
                <span className="trna-amino-label">{card.amino}</span>
              </div>
              <div className="trna-icon">tRNA</div>
              <div className="trna-codon-label">{card.anticodon}</div>
            </article>
          ))}
        </div>
      </section>

      {state.manualOpen && (
        <div className="manual-backdrop" onClick={() => dispatch({ type: 'TOGGLE_MANUAL' })}>
          <section className="manual-sheet" onClick={(event) => event.stopPropagation()}>
            <header className="manual-header-compact">
              <div>
                <h2>Código Genético 🧬</h2>
                <p>Guía rápida de traducción y codones.</p>
              </div>
              <button type="button" className="btn" onClick={() => dispatch({ type: 'TOGGLE_MANUAL' })}>Cerrar</button>
            </header>

            <div className="manual-quickref">
              <span><strong>AUG</strong> → <strong>UAC</strong> → Met</span>
              <span><strong>STOP</strong> → UAA / UAG / UGA</span>
              <span><strong>A / P / E</strong> → A es el unico drop</span>
            </div>

            <div className="manual-matrix">
              <div className="manual-matrix-corner">1ra / 2da / 3ra</div>
              {codonOrder.map((second) => (
                <div key={`head-${second}`} className="manual-matrix-head">{second}</div>
              ))}

              {manualMatrix.map((row) => (
                <Fragment key={row.first}>
                  <div className="manual-matrix-rowhead">{row.first}</div>
                  {row.columns.map((column) => (
                    <div key={`cell-${row.first}-${column.second}`} className="manual-matrix-cell">
                      {column.entries.map((entry) => (
                        <div key={entry.codon} className={`manual-matrix-entry ${entry.isStop ? 'manual-stop' : ''}`.trim()}>
                          <span className="matrix-codon">{entry.codon}</span>
                          <span className="matrix-aa">
                            <span className="amino-dot" style={{ backgroundColor: entry.color }} />
                            {entry.amino}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </Fragment>
              ))}
            </div>
          </section>
        </div>
      )}

      {state.levelResult && (
        <div className="result-backdrop">
          <section className={`result-sheet ${resultQualityClass}`.trim()}>
            {state.levelResult.success && (
              <div className="victory-burst" aria-hidden="true">
                {Array.from({ length: 18 }).map((_, index) => (
                  <span key={`burst-${index}`} style={{ '--i': index }} />
                ))}
              </div>
            )}

            <h2>Resultado del nivel</h2>

            <div className="result-hero">
              {state.levelResult.success ? (
                <div className="victory-banner" aria-label="Victoria">
                  <div className="victory-stars" aria-hidden="true">
                    <span>★</span>
                    <span>★</span>
                    <span>★</span>
                  </div>
                  <div className="victory-ribbon">Victoria</div>
                </div>
              ) : (
                <strong className="success-pill">Nivel fallido</strong>
              )}

              <span className={`quality-badge ${resultQualityClass}`.trim()}>
                {capitalize(state.levelResult.quality)}
              </span>
            </div>

            <p className="result-meta-title">Metadatos de traduccion</p>

            <div className="result-grid">
              <article>
                <span>Longitud</span>
                <strong>{state.levelResult.length}</strong>
              </article>
              <article>
                <span>Errores</span>
                <strong>{state.levelResult.errors}</strong>
              </article>
              <article>
                <span>Tasa de error</span>
                <strong>{(state.levelResult.errorRate * 100).toFixed(1)}%</strong>
              </article>
              <article>
                <span>Calidad</span>
                <strong>{capitalize(state.levelResult.quality)}</strong>
              </article>
              <article>
                <span>Puntaje</span>
                <strong>{formatNumber(state.levelResult.score)}</strong>
              </article>
              <article>
                <span>Exito</span>
                <strong>{state.levelResult.success ? 'Si' : 'No'}</strong>
              </article>
            </div>

            <div className="result-chain" aria-label="Cadena final">
              {state.chain.map((node, index) => (
                <div
                  key={`${node.aminoacid}-${index}`}
                  className={`result-node ${node.isError ? 'error' : ''}`.trim()}
                  style={{ backgroundColor: node.color }}
                />
              ))}
            </div>

            <div className="result-actions">
              {state.levelResult.success ? (
                <button type="button" className="btn primary" onClick={() => dispatch({ type: 'START_NEXT_LEVEL' })}>
                  Siguiente nivel
                </button>
              ) : (
                <button type="button" className="btn primary" onClick={() => dispatch({ type: 'START_GAME' })}>
                  Reintentar
                </button>
              )}
            </div>
          </section>
        </div>
      )}

    </main>
  )
}

export default App
