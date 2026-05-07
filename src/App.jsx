import { Fragment, useEffect, useMemo, useReducer, useRef } from 'react'
import './App.css'
import GameBoard from './components/GameBoard'
import GameHeader from './components/GameHeader'
import ManualModal from './components/ManualModal'
import ResultModal from './components/ResultModal'
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

const codonOrder = ['U', 'C', 'A', 'G']

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
    const visibles = state.chain // Sin reverse: nuevos van a la derecha
    return { visibles }
  }, [state.chain])

  const feedbackClass = state.feedback.type === 'error' ? 'fx-shake' : state.feedback.type === 'timeout' ? 'fx-timeout' : ''

  return (
    <main className={`ribosome-game ${feedbackClass}`.trim()}>
      <GameHeader
        difficultyKey={state.difficulty}
        difficultyProfiles={DIFFICULTY_PROFILES}
        remainingMs={state.remainingMs}
        timerCap={timerCap}
        isRunning={state.isRunning}
        isPaused={state.isPaused}
        level={state.level}
        score={state.score}
        combo={state.combo}
        bestCombo={state.bestCombo}
        onDifficultyChange={(difficultyKey) => dispatch({ type: 'SET_DIFFICULTY', payload: difficultyKey })}
        onPrimaryAction={() => dispatch({ type: state.isRunning ? 'RESTART_GAME' : 'START_GAME' })}
        onPauseToggle={() => dispatch({ type: 'TOGGLE_PAUSE' })}
        onToggleManual={() => dispatch({ type: 'TOGGLE_MANUAL' })}
        onToggleGuide={() => dispatch({ type: 'TOGGLE_GAME_GUIDE' })}
      />

      <GameBoard
        isPaused={state.isPaused}
        chainPreview={chainPreview}
        slots={state.slots}
        trnaPool={state.trnaPool}
        codonWindow={codonWindow}
        renderCodon={renderCodon}
        onDropCard={(cardId) => dispatch({ type: 'DROP_TRNA', cardId })}
        toasts={state.toasts}
      />

      {state.manualOpen && (
        <ManualModal title="Código Genético 🧬" subtitle="Guía rápida de traducción y codones." onClose={() => dispatch({ type: 'TOGGLE_MANUAL' })}>
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
        </ManualModal>
      )}

      {state.gameGuideOpen && (
        <ManualModal title="¿Cómo Jugar?" subtitle="Reglas y objetivo principal." onClose={() => dispatch({ type: 'TOGGLE_GAME_GUIDE' })}>
          <section className="manual-guide-body">
            <p><strong>Objetivo:</strong> completar la traduccion de la cadena hasta un codon STOP antes de que se agote el tiempo, con la menor cantidad de errores posible.</p>
            La dificultad afecta el tiempo disponible para traducir cada codon, la cantidad de ARNt's entre los disponibles, la ventana de codones entrantes.
            <h3>Como jugar</h3>
            <ul>
              <li>Arrastra el ARNt correcto al sitio A.</li>
              <li>El anticodon debe coincidir con el codon activo.</li>
              <li>Cada acierto suma cadena y puntos.</li>
              <li>Evita errores: bajan calidad y puntaje.</li>
              <li>Objetivo: llegar al STOP antes del tiempo.</li>
            </ul>
          </section>
          <p />
        </ManualModal>
      )}

      {state.levelResult && (
        <ResultModal
          result={state.levelResult}
          chain={state.chain}
          onPrimaryAction={() => dispatch({ type: state.levelResult.success ? 'START_NEXT_LEVEL' : 'START_GAME' })}
        />
      )}
    </main>
  )
}

export default App
