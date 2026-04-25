import { CODON_KEYS, CODON_TABLE, DIFFICULTY_PROFILES, GAME_CONFIG, getAnticodon } from './data'

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`

const randomCodon = () => CODON_KEYS[Math.floor(Math.random() * CODON_KEYS.length)]

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

const makeSequence = () => {
  const sequence = ['AUG']
  for (let i = 0; i < GAME_CONFIG.sequenceLength - 1; i += 1) {
    sequence.push(randomCodon())
  }
  return sequence
}

const makeCard = (anticodon, isCorrect = false) => {
  const codon = anticodon.split('').map((base) => getAnticodon(base)).join('')
  const aminoData = CODON_TABLE[codon] || CODON_TABLE.AUG

  return {
    id: createId('trna'),
    anticodon,
    amino: aminoData.amino,
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

const nextStateForCodon = (state, nextIndex) => {
  if (nextIndex >= state.sequence.length) {
    return {
      ...state,
      isRunning: false,
      currentCodon: null,
      currentCodonIndex: nextIndex,
      remainingMs: 0,
      trnaPool: [],
    }
  }

  const profile = DIFFICULTY_PROFILES[state.difficulty]
  const currentCodon = state.sequence[nextIndex]

  return {
    ...state,
    currentCodon,
    currentCodonIndex: nextIndex,
    remainingMs: profile.timerMs,
    trnaPool: buildPool(currentCodon, profile.poolSize),
  }
}

const resolveAttempt = (state, card, reason) => {
  if (!state.isRunning || !state.currentCodon) {
    return state
  }

  const profile = DIFFICULTY_PROFILES[state.difficulty]
  const expectedAnti = getAnticodon(state.currentCodon)
  const expectedData = CODON_TABLE[state.currentCodon]
  const success = Boolean(card && card.anticodon === expectedAnti)

  let nextState = state

  if (success) {
    const gained = Math.round((90 + state.combo * 25) * profile.scoreMult)
    const aPayload = {
      amino: expectedData.amino,
      color: expectedData.color,
      anticodon: expectedAnti,
      codon: state.currentCodon,
    }

    nextState = {
      ...nextState,
      score: nextState.score + gained,
      combo: nextState.combo + 1,
      bestCombo: Math.max(nextState.bestCombo, nextState.combo + 1),
      chain: [...nextState.chain, aPayload],
      slots: translocateSlots(nextState.slots, aPayload),
    }
    nextState = addToast(nextState, 'success', `Correcto +${gained}`)
    nextState = withFeedback(nextState, 'success', `+${nextState.combo} combo`)
  } else {
    const penalty = reason === 'timeout' ? Math.round(profile.missPenalty * 1.2) : profile.missPenalty
    nextState = {
      ...nextState,
      score: Math.max(0, nextState.score - penalty),
      combo: 0,
      slots: translocateSlots(nextState.slots, null),
    }

    if (reason === 'timeout') {
      nextState = addToast(nextState, 'warn', `Timeout en ${state.currentCodon}`)
      nextState = withFeedback(nextState, 'timeout', 'Tiempo agotado')
    } else {
      nextState = addToast(nextState, 'error', 'Anticodon incorrecto')
      nextState = withFeedback(nextState, 'error', '-combo')
    }
  }

  nextState = nextStateForCodon(nextState, state.currentCodonIndex + 1)

  if (!nextState.isRunning) {
    nextState = addToast(nextState, 'info', `Fin de ronda. Score ${nextState.score}`)
    nextState = withFeedback(nextState, 'idle', 'Ronda completa')
  }

  return nextState
}

export const createInitialGameState = () => ({
  isRunning: false,
  difficulty: 'normal',
  sequence: [],
  currentCodon: null,
  currentCodonIndex: 0,
  remainingMs: DIFFICULTY_PROFILES.normal.timerMs,
  trnaPool: [],
  slots: {
    e: null,
    p: null,
    a: null,
  },
  chain: [],
  score: 0,
  combo: 0,
  bestCombo: 0,
  manualOpen: false,
  toasts: [],
  feedback: {
    type: 'idle',
    message: '',
    token: 0,
  },
})

export const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DIFFICULTY': {
      const nextDifficulty = DIFFICULTY_PROFILES[action.payload] ? action.payload : 'normal'
      const profile = DIFFICULTY_PROFILES[nextDifficulty]
      return addToast({
        ...state,
        difficulty: nextDifficulty,
        remainingMs: profile.timerMs,
      }, 'info', `${profile.label}: ${Math.floor(profile.timerMs / 1000)}s, pool ${profile.poolSize}`)
    }

    case 'START_GAME': {
      const profile = DIFFICULTY_PROFILES[state.difficulty]
      const sequence = makeSequence()
      const currentCodon = sequence[0]

      let nextState = {
        ...state,
        isRunning: true,
        sequence,
        currentCodon,
        currentCodonIndex: 0,
        remainingMs: profile.timerMs,
        trnaPool: buildPool(currentCodon, profile.poolSize),
        slots: {
          e: null,
          p: null,
          a: null,
        },
        chain: [],
        score: 0,
        combo: 0,
        bestCombo: 0,
      }

      nextState = addToast(nextState, 'success', `Inicia ronda ${profile.label}`)
      return withFeedback(nextState, 'success', 'Traduccion iniciada')
    }

    case 'TICK': {
      if (!state.isRunning || !state.currentCodon) {
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
      if (!state.isRunning || !state.currentCodon) {
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
            amino: card.amino,
            color: card.color,
            anticodon: card.anticodon,
            codon: state.currentCodon,
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
