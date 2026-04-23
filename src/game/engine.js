import { CODON_TO_AA, DIFFICULTY_PROFILES, GAME_CONFIG } from './data'

const BASE_PAIRS = {
  A: 'U',
  U: 'A',
  C: 'G',
  G: 'C',
}

const codonKeys = Object.keys(CODON_TO_AA)

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`

const randomCodon = () => codonKeys[Math.floor(Math.random() * codonKeys.length)]

export const getAnticodon = (codon) => codon.split('').map((base) => BASE_PAIRS[base]).join('')

const makeSequence = () => {
  const sequence = ['AUG']
  for (let i = 0; i < GAME_CONFIG.levelLength - 1; i += 1) {
    sequence.push(randomCodon())
  }
  return sequence
}

const createCard = (type, value) => ({
  id: createId('card'),
  type,
  value,
})

const makeDeck = (type, requiredValue, size) => {
  const deck = [createCard(type, requiredValue)]
  while (deck.length < size) {
    const random = randomCodon()
    const value = type === 'trna' ? getAnticodon(random) : CODON_TO_AA[random]
    deck.push(createCard(type, value))
  }

  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = deck[i]
    deck[i] = deck[j]
    deck[j] = temp
  }

  return deck
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

const setFeedback = (state, type) => ({
  ...state,
  feedback: {
    type,
    token: state.feedback.token + 1,
  },
})

const withNewDecks = (state, codon = state.currentCodon) => {
  if (!codon) {
    return state
  }

  const profile = DIFFICULTY_PROFILES[state.difficulty]
  return {
    ...state,
    trnaDeck: makeDeck('trna', getAnticodon(codon), profile.deckSize),
    aaDeck: makeDeck('aa', CODON_TO_AA[codon], profile.deckSize),
    selected: {
      trna: null,
      aa: null,
    },
  }
}

const advanceCodon = (state) => {
  const nextIndex = state.currentCodonIndex + 1
  if (nextIndex >= state.sequence.length) {
    return {
      ...state,
      currentCodonIndex: nextIndex,
      currentCodon: null,
      isRunning: false,
      trnaDeck: [],
      aaDeck: [],
      selected: {
        trna: null,
        aa: null,
      },
    }
  }

  const profile = DIFFICULTY_PROFILES[state.difficulty]
  const nextCodon = state.sequence[nextIndex]
  return withNewDecks({
    ...state,
    currentCodonIndex: nextIndex,
    currentCodon: nextCodon,
    remainingMs: profile.timePerCodonMs,
    codonLives: GAME_CONFIG.codonLives,
  }, nextCodon)
}

const isCraftCorrect = (state) => {
  if (!state.selected.trna || !state.selected.aa || !state.currentCodon) {
    return false
  }

  const requiredAnti = getAnticodon(state.currentCodon)
  const requiredAA = CODON_TO_AA[state.currentCodon]

  return state.selected.trna.value === requiredAnti && state.selected.aa.value === requiredAA
}

export const createInitialGameState = () => ({
  isRunning: false,
  difficulty: 'normal',
  score: 0,
  sequence: [],
  currentCodonIndex: 0,
  currentCodon: null,
  remainingMs: DIFFICULTY_PROFILES.normal.timePerCodonMs,
  codonLives: GAME_CONFIG.codonLives,
  trnaDeck: [],
  aaDeck: [],
  selected: {
    trna: null,
    aa: null,
  },
  manualOpen: false,
  toasts: [],
  feedback: {
    type: 'idle',
    token: 0,
  },
})

export const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DIFFICULTY': {
      const profile = DIFFICULTY_PROFILES[action.payload] || DIFFICULTY_PROFILES.normal
      const updated = {
        ...state,
        difficulty: action.payload,
        remainingMs: profile.timePerCodonMs,
      }
      return addToast(updated, 'info', `${profile.label}: ${Math.floor(profile.timePerCodonMs / 1000)}s, mazo ${profile.deckSize}`)
    }

    case 'START_GAME': {
      const profile = DIFFICULTY_PROFILES[state.difficulty]
      const sequence = makeSequence()
      const firstCodon = sequence[0]

      let nextState = {
        ...state,
        isRunning: true,
        score: 0,
        sequence,
        currentCodonIndex: 0,
        currentCodon: firstCodon,
        remainingMs: profile.timePerCodonMs,
        codonLives: GAME_CONFIG.codonLives,
        selected: {
          trna: null,
          aa: null,
        },
      }

      nextState = withNewDecks(nextState, firstCodon)
      nextState = addToast(nextState, 'success', `Ronda iniciada en ${profile.label}`)
      return setFeedback(nextState, 'success')
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

      let failed = addToast({
        ...state,
        remainingMs: 0,
      }, 'error', `Se agoto el tiempo del codon ${state.currentCodon}`)

      failed = setFeedback(failed, 'error')
      failed = advanceCodon(failed)

      if (!failed.isRunning) {
        return addToast(failed, 'warn', `Juego terminado. Puntaje final ${Math.round(failed.score)}`)
      }

      return addToast(failed, 'warn', `Siguiente codon: ${failed.currentCodon}`)
    }

    case 'DROP_CARD': {
      if (!state.isRunning || !state.currentCodon) {
        return state
      }

      const { sourceType, cardId, target } = action
      if (!['trna', 'aa'].includes(sourceType) || !['trna', 'aa'].includes(target)) {
        return state
      }

      const deck = sourceType === 'trna' ? state.trnaDeck : state.aaDeck
      const card = deck.find((entry) => entry.id === cardId)
      if (!card) {
        return state
      }

      if (card.type !== target) {
        const warned = addToast(state, 'warn', 'Tipo de carta incorrecto para ese espacio')
        return setFeedback(warned, 'error')
      }

      return {
        ...state,
        selected: {
          ...state.selected,
          [target]: card,
        },
      }
    }

    case 'CRAFT': {
      if (!state.isRunning || !state.currentCodon) {
        return state
      }

      if (!state.selected.trna || !state.selected.aa) {
        return addToast(state, 'warn', 'Arrastra un ARNt y un aminoacido al centro')
      }

      if (isCraftCorrect(state)) {
        const profile = DIFFICULTY_PROFILES[state.difficulty]
        const lifePercent = (state.remainingMs / profile.timePerCodonMs) * 100
        const gained = Math.round(lifePercent * profile.scoreFactor)

        let successState = {
          ...state,
          score: state.score + gained,
        }
        successState = addToast(successState, 'success', `Correcto +${gained} pts (${Math.round(lifePercent)}% vida)`)
        successState = setFeedback(successState, 'success')
        successState = advanceCodon(successState)

        if (!successState.isRunning) {
          return addToast(successState, 'success', `Juego terminado. Puntaje final ${Math.round(successState.score)}`)
        }

        return successState
      }

      const nextLives = state.codonLives - 1
      const halvedTime = Math.max(1000, Math.floor(state.remainingMs / 2))

      let failedState = {
        ...state,
        codonLives: nextLives,
        remainingMs: halvedTime,
      }

      failedState = withNewDecks(failedState)
      failedState = addToast(failedState, 'error', `Fallo de crafteo. Vidas restantes: ${Math.max(nextLives, 0)}`)
      failedState = setFeedback(failedState, 'error')

      if (nextLives > 0) {
        return failedState
      }

      let codonFailed = addToast(failedState, 'warn', `Perdiste el codon ${state.currentCodon}`)
      codonFailed = advanceCodon(codonFailed)

      if (!codonFailed.isRunning) {
        return addToast(codonFailed, 'warn', `Juego terminado. Puntaje final ${Math.round(codonFailed.score)}`)
      }

      return codonFailed
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
