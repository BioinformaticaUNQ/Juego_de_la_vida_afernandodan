import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import GameHud from './components/game/GameHud'
import ProteinChain from './components/game/ProteinChain'
import RibosomePanel from './components/game/RibosomePanel'
import TimerBar from './components/game/TimerBar'
import StartOverlay from './components/game/StartOverlay'
import GameOverOverlay from './components/game/GameOverOverlay'
import { geneticCode } from './game/geneticCode'
import {
  beadColors,
  generateHint,
  generateSequence,
  getLevelByIndex,
  getRoundDuration,
  normalizeText,
} from './game/helpers'

function App() {
  const [status, setStatus] = useState('intro')
  const [sequence, setSequence] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [targetAA, setTargetAA] = useState('')
  const [hint, setHint] = useState('_ _ _')
  const [hintIsError, setHintIsError] = useState(false)
  const [answer, setAnswer] = useState('')
  const [beads, setBeads] = useState([])
  const [timerPct, setTimerPct] = useState(100)
  const [isShaking, setIsShaking] = useState(false)
  const [endState, setEndState] = useState({
    isVictory: false,
    reason: '',
  })

  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const timeLeftRef = useRef(0)
  const roundDurationRef = useRef(0)

  const codonTrack = useMemo(() => [' ', ' ', ...sequence, ' ', ' '], [sequence])
  const codonOffset = -(currentIndex * 88)

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  function finishGame(isVictory, reason) {
    clearTimer()
    setStatus('ended')
    setEndState({ isVictory, reason })
  }

  function addBead(label, isError = false) {
    setBeads((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${prev.length}`,
        label,
        isError,
        color: isError ? '#555555' : beadColors[prev.length % beadColors.length],
      },
    ])
  }

  function handleMistake(reason) {
    clearTimer()
    setLives((prevLives) => {
      const nextLives = prevLives - 1

      if (nextLives <= 0) {
        finishGame(false, reason)
        return 0
      }

      setHint(targetAA.split('').join(' '))
      setHintIsError(true)
      addBead('ERR', true)

      window.setTimeout(() => {
        setHintIsError(false)
        setCurrentIndex((prev) => prev + 1)
      }, 1400)

      return nextLives
    })
  }

  function handleSuccess() {
    clearTimer()

    const bonus = Math.floor((timeLeftRef.current / roundDurationRef.current) * 100)
    setScore((prev) => prev + level * 100 + bonus)
    addBead(targetAA.slice(0, 3).toUpperCase())

    window.setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
    }, 320)
  }

  function handleSubmit(event) {
    event.preventDefault()

    const typed = normalizeText(answer)
    const expected = normalizeText(targetAA)

    if (typed === expected) {
      handleSuccess()
      setAnswer('')
      return
    }

    setIsShaking(true)
    setAnswer('')
    window.setTimeout(() => setIsShaking(false), 360)
  }

  function startGame() {
    setSequence(generateSequence(25))
    setCurrentIndex(0)
    setScore(0)
    setLives(3)
    setLevel(1)
    setTargetAA('')
    setHint('_ _ _')
    setHintIsError(false)
    setAnswer('')
    setBeads([])
    setTimerPct(100)
    setStatus('playing')
    setEndState({ isVictory: false, reason: '' })
  }

  useEffect(() => {
    if (status !== 'playing') {
      clearTimer()
      return
    }

    if (!sequence.length) {
      return
    }

    if (currentIndex >= sequence.length) {
      finishGame(true, 'Has traducido toda la cadena de ARNm con exito.')
      return
    }

    const codon = sequence[currentIndex]
    const aminoAcid = geneticCode[codon]
    const nextLevel = getLevelByIndex(currentIndex)
    const duration = getRoundDuration(nextLevel)

    setAnswer('')
    setLevel(nextLevel)
    setTargetAA(aminoAcid)
    setHint(generateHint(aminoAcid, nextLevel))
    setHintIsError(false)
    setTimerPct(100)

    roundDurationRef.current = duration
    timeLeftRef.current = duration

    window.setTimeout(() => {
      inputRef.current?.focus()
    }, 0)

    timerRef.current = window.setInterval(() => {
      timeLeftRef.current -= 50
      const pct = Math.max((timeLeftRef.current / duration) * 100, 0)
      setTimerPct(pct)

      if (timeLeftRef.current <= 0) {
        handleMistake('Se acabo el tiempo para traducir este codon.')
      }
    }, 50)

    return () => {
      clearTimer()
    }
  }, [currentIndex, sequence, status])

  useEffect(() => () => clearTimer(), [])

  return (
    <>
      <svg width="0" height="0" className="svg-filter" aria-hidden="true">
        <defs>
          <filter id="wobble-ink">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <main className="game-page" onClick={() => inputRef.current?.focus()}>
        <GameHud level={level} score={score} lives={lives} />

        <section className="game-area">
          <ProteinChain beads={beads} />

          <RibosomePanel
            hint={hint}
            hintIsError={hintIsError}
            inputValue={answer}
            onInputChange={(event) => setAnswer(event.target.value)}
            onSubmit={handleSubmit}
            isInputDisabled={status !== 'playing'}
            inputRef={inputRef}
            isShaking={isShaking}
            codonTrack={codonTrack}
            codonOffset={codonOffset}
          />
        </section>

        <TimerBar percentage={timerPct} />
      </main>

      {status === 'intro' && <StartOverlay onStart={startGame} />}

      {status === 'ended' && (
        <GameOverOverlay
          isVictory={endState.isVictory}
          reason={endState.reason}
          score={score}
          length={beads.length}
          onRestart={startGame}
        />
      )}
    </>
  )
}

export default App
