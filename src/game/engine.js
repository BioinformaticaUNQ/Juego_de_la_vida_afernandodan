import {
  CODON_KEYS,
  CODON_TABLE,
  DIFFICULTY_PROFILES,
  GAME_CONFIG,
  GENETIC_CODE,
  STOP_CODONS,
  getAnticodon,
  getQualityByErrorRate,
} from './data'

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`

const randomCodon = () => CODON_KEYS[Math.floor(Math.random() * CODON_KEYS.length)]
const randomStopCodon = () => STOP_CODONS[Math.floor(Math.random() * STOP_CODONS.length)]

const shuffle = (items) => {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j]
    copy[j] = temp
  }
  return copy
}

const makeSequence = (profile, level = 1) => {
  const codingLength = profile.sequenceBaseLength + Math.max(0, (level - 1) * GAME_CONFIG.levelLengthStep)
  const sequence = ['AUG']
  for (let i = 0; i < codingLength - 1; i += 1) {
    sequence.push(randomCodon())
  }
  sequence.push(randomStopCodon())
  return sequence
}

const makeCard = (anticodon, isCorrect = false) => {
  const codon = anticodon.split('').map((base) => getAnticodon(base)).join('')
  const geneticInfo = GENETIC_CODE[codon]
  const aminoData = CODON_TABLE[codon] || CODON_TABLE.AUG

  return {
    id: createId('trna'),
    anticodon,
    amino: aminoData.amino,
    name: geneticInfo?.name || 'Unknown',
    color: aminoData.color,
    isCorrect,
  }
}

const buildPool = (codon, poolSize) => {
  const requiredAnti = getAnticodon(codon)
  const seen = new Set([requiredAnti])
  const cards = [makeCard(requiredAnti, true)]

  while (cards.length < poolSize) {
    const distractor = getAnticodon(randomCodon())
    if (seen.has(distractor)) {
      continue
    }
    seen.add(distractor)
    cards.push(makeCard(distractor, false))
  }

  return shuffle(cards)
}

const createToast = (type, message) => ({
  id: createId('toast'),
  type,
  message,
})

const addToast = (state, type, message) => ({
  ...state,
  toasts: [createToast(type, message), ...state.toasts].slice(0, GAME_CONFIG.maxToasts),
})

const withFeedback = (state, type, message) => ({
  ...state,
  feedback: {
    type,
    message,
    token: state.feedback.token + 1,
  },
})

const translocateSlots = (slots, aPayload) => ({
  e: slots.p,
  p: aPayload,
  a: null,
})

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const getTimerForProgress = (state) => {
  const profile = DIFFICULTY_PROFILES[state.difficulty]
  const total = Math.max(1, state.sequence.length - 1)
  const progress = clamp(state.translatedCodons / total, 0, 1)
  return Math.round(profile.timerMaxMs + (profile.timerMinMs - profile.timerMaxMs) * progress)
}

const evaluateLevel = (state) => {
  const length = state.chain.length
  const totalLength = Math.max(1, state.translatedCodons)
  const errors = state.errors
  const errorRate = errors / totalLength
  const success = errorRate <= GAME_CONFIG.successThreshold
  const quality = getQualityByErrorRate(errorRate)

  return {
    length,
    errors,
    errorRate,
    quality,
    score: state.score,
    success,
  }
}

const finishTranslation = (state) => {
  const result = evaluateLevel(state)
  const summary = result.success ? 'Cadena polipeptídica válida' : 'Errores excesivos → síntesis abortada: péptido truncado.'

  let nextState = {
    ...state,
    isRunning: false,
    isPaused: false,
    currentCodon: null,
    remainingMs: 0,
    trnaPool: [],
    levelResult: result,
  }

  nextState = addToast(nextState, result.success ? 'success' : 'error', summary)
  nextState = withFeedback(nextState, result.success ? 'success' : 'error', summary)
  return nextState
}

const moveToIndex = (state, nextIndex) => {
  if (nextIndex >= state.sequence.length) {
    return finishTranslation(state)
  }

  const nextCodon = state.sequence[nextIndex]
  if (STOP_CODONS.includes(nextCodon)) {
    return finishTranslation({
      ...state,
      currentCodonIndex: nextIndex,
      currentCodon: nextCodon,
    })
  }

  return {
    ...state,
    currentCodon: nextCodon,
    currentCodonIndex: nextIndex,
    remainingMs: getTimerForProgress(state),
    trnaPool: buildPool(nextCodon, DIFFICULTY_PROFILES[state.difficulty].poolSize),
  }
}

const applyCorrect = (state, expectedAnti, expectedData) => {
  const profile = DIFFICULTY_PROFILES[state.difficulty]
  const baseValue = 100
  const comboBonus = state.combo * 15
  const gained = Math.round((baseValue + comboBonus) * profile.scoreMult)

  const payload = {
    aminoacid: expectedData.amino,
    color: expectedData.color,
    isError: false,
    codon: state.currentCodon,
    anticodon: expectedAnti,
  }

  let nextState = {
    ...state,
    score: state.score + gained,
    combo: state.combo + 1,
    bestCombo: Math.max(state.bestCombo, state.combo + 1),
    chain: [...state.chain, payload],
    slots: translocateSlots(state.slots, payload),
    translatedCodons: state.translatedCodons + 1,
  }

  nextState = addToast(nextState, 'success', 'Acierto')
  nextState = withFeedback(nextState, 'success', '+combo')
  return nextState
}

const applyTimeout = (state) => {
  const profile = DIFFICULTY_PROFILES[state.difficulty]

  let nextState = {
    ...state,
    score: Math.max(0, state.score - profile.missPenalty),
    combo: 0,
    errors: state.errors + 1,
    misses: state.misses + 1,
    translatedCodons: state.translatedCodons + 1,
    slots: translocateSlots(state.slots, null),
  }

  nextState = addToast(nextState, 'warn', 'Timeout')
  nextState = withFeedback(nextState, 'timeout', 'Tiempo agotado')
  return nextState
}

const applyIncorrect = (state, card) => {
  const profile = DIFFICULTY_PROFILES[state.difficulty]
  const rejected = Math.random() < profile.rejectRate

  if (rejected) {
    let nextState = {
      ...state,
      score: Math.max(0, state.score - Math.round(profile.errorPenalty * 0.7)),
      combo: 0,
      errors: state.errors + 1,
      rejections: state.rejections + 1,
      translatedCodons: state.translatedCodons + 1,
      slots: translocateSlots(state.slots, null),
    }

    nextState = addToast(nextState, 'error', 'Rechazo')
    nextState = withFeedback(nextState, 'error', 'Rechazo')
    return nextState
  }

  const wrongPayload = {
    aminoacid: card.amino,
    color: card.color,
    isError: true,
    codon: state.currentCodon,
    anticodon: card.anticodon,
  }

  let nextState = {
    ...state,
    score: Math.max(0, state.score - profile.errorPenalty),
    combo: 0,
    errors: state.errors + 1,
    misincorporations: state.misincorporations + 1,
    translatedCodons: state.translatedCodons + 1,
    chain: [...state.chain, wrongPayload],
    slots: translocateSlots(state.slots, wrongPayload),
  }

  nextState = addToast(nextState, 'error', 'Misincorporacion')
  nextState = withFeedback(nextState, 'error', 'Error')
  return nextState
}

const resolveAttempt = (state, card, reason) => {
  if (!state.isRunning || !state.currentCodon) {
    return state
  }

  const expectedAnti = getAnticodon(state.currentCodon)
  const expectedData = CODON_TABLE[state.currentCodon]
  const success = Boolean(card && card.anticodon === expectedAnti)

  let nextState = state

  if (reason === 'timeout') {
    nextState = applyTimeout(nextState)
  } else if (success) {
    nextState = applyCorrect(nextState, expectedAnti, expectedData)
  } else {
    nextState = applyIncorrect(nextState, card)
  }

  return moveToIndex(nextState, state.currentCodonIndex + 1)
}

const createCoreState = () => ({
  sequence: [],
  currentCodon: null,
  currentCodonIndex: 0,
  remainingMs: DIFFICULTY_PROFILES.normal.timerMaxMs,
  trnaPool: [],
  slots: {
    e: null,
    p: null,
    a: null,
  },
  chain: [],
  translatedCodons: 0,
  errors: 0,
  misses: 0,
  rejections: 0,
  misincorporations: 0,
  score: 0,
  combo: 0,
  bestCombo: 0,
  levelResult: null,
})

export const createInitialGameState = () => ({
  isRunning: false,
  isPaused: false,
  difficulty: 'normal',
  level: 1,
  manualOpen: false,
  gameGuideOpen: false,
  toasts: [],
  feedback: {
    type: 'idle',
    message: '',
    token: 0,
  },
  ...createCoreState(),
})

const startLevel = (state, level = state.level) => {
  const profile = DIFFICULTY_PROFILES[state.difficulty]
  const sequence = makeSequence(profile, level)
  const firstCodon = sequence[0]

  let nextState = {
    ...state,
    ...createCoreState(),
    isRunning: true,
    isPaused: false,
    level,
    sequence,
    currentCodon: firstCodon,
    currentCodonIndex: 0,
    remainingMs: profile.timerMaxMs,
    trnaPool: buildPool(firstCodon, profile.poolSize),
  }

  nextState = addToast(nextState, 'success', `Nivel ${level}`)
  nextState = withFeedback(nextState, 'success', 'Inicio')
  return nextState
}

export const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DIFFICULTY': {
      const nextDifficulty = DIFFICULTY_PROFILES[action.payload] ? action.payload : 'normal'
      const profile = DIFFICULTY_PROFILES[nextDifficulty]
      // Resetear todo al estado inicial con la nueva dificultad, sin iniciar el juego
      const initialState = createInitialGameState()
      initialState.difficulty = nextDifficulty
      initialState.remainingMs = profile.timerMaxMs
      return addToast(initialState, 'info', `Dificultad: ${profile.label}`)
    }

    case 'START_GAME': {
      return startLevel(state, state.level)
    }

    case 'RESTART_GAME': {
      // Reiniciar completamente al estado inicial sin iniciar el juego
      const initialState = createInitialGameState()
      initialState.difficulty = state.difficulty
      return initialState
    }

    case 'START_NEXT_LEVEL': {
      return startLevel(state, state.level + 1)
    }

    case 'TICK': {
      if (!state.isRunning || state.isPaused || !state.currentCodon) {
        return state
      }

      const remainingMs = Math.max(0, state.remainingMs - action.deltaMs)
      if (remainingMs > 0) {
        return {
          ...state,
          remainingMs,
        }
      }

      return resolveAttempt({
        ...state,
        remainingMs: 0,
      }, null, 'timeout')
    }

    case 'DROP_TRNA': {
      if (!state.isRunning || state.isPaused || !state.currentCodon) {
        return state
      }

      const card = state.trnaPool.find((entry) => entry.id === action.cardId)
      if (!card) {
        return state
      }

      const staged = {
        ...state,
        slots: {
          ...state.slots,
          a: {
            aminoacid: card.amino,
            color: card.color,
            isError: !card.isCorrect,
            codon: state.currentCodon,
            anticodon: card.anticodon,
          },
        },
      }

      return resolveAttempt(staged, card, 'drop')
    }

    case 'TOGGLE_MANUAL': {
      return {
        ...state,
        manualOpen: !state.manualOpen,
      }
    }

    case 'TOGGLE_GAME_GUIDE': {
      return {
        ...state,
        gameGuideOpen: !state.gameGuideOpen,
      }
    }

    case 'TOGGLE_PAUSE': {
      if (!state.isRunning) {
        return state
      }

      const paused = !state.isPaused
      let nextState = {
        ...state,
        isPaused: paused,
      }

      nextState = addToast(nextState, 'info', paused ? 'Pausa' : 'Reanudado')
      nextState = withFeedback(nextState, 'info', paused ? 'Pausa' : 'Reanudado')
      return nextState
    }

    case 'DISMISS_TOAST': {
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload),
      }
    }

    default:
      return state
  }
}
