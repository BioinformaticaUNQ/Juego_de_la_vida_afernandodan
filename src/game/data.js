export const BASE_PAIRS = {
  A: 'U',
  U: 'A',
  G: 'C',
  C: 'G',
}

export const CODON_TABLE = {
  AUG: { amino: 'Met', color: '#9b6dff' },
  GCU: { amino: 'Ala', color: '#3fa7ff' },
  UAC: { amino: 'Tyr', color: '#83d048' },
  AAU: { amino: 'Asn', color: '#ff9a33' },
  GGA: { amino: 'Gly', color: '#ff66b2' },
  UUC: { amino: 'Phe', color: '#ffd54f' },
  CCU: { amino: 'Pro', color: '#00d7c5' },
  CAA: { amino: 'Gln', color: '#f7797d' },
  GUU: { amino: 'Val', color: '#7bd88f' },
  AAG: { amino: 'Lys', color: '#c9a1ff' },
  CUG: { amino: 'Leu', color: '#2ec4ff' },
  UGG: { amino: 'Trp', color: '#e09f3e' },
}

export const CODON_KEYS = Object.keys(CODON_TABLE)

const baseTime = 3000; // 3 segundos

export const DIFFICULTY_PROFILES = {
  easy: {
    label: 'Facil',
    timerMs: 7 * baseTime,
    poolSize: 3,
    scoreMult: 1,
    missPenalty: 35,
  },
  normal: {
    label: 'Normal',
    timerMs: 5.2 * baseTime,
    poolSize: 4,
    scoreMult: 1.3,
    missPenalty: 55,
  },
  hard: {
    label: 'Dificil',
    timerMs: 3.8 * baseTime,
    poolSize: 5,
    scoreMult: 1.7,
    missPenalty: 80,
  },
}

export const GAME_CONFIG = {
  tickRateMs: 100,
  sequenceLength: 24,
  maxToasts: 4,
  chainPreviewLength: 10,
}

export const getAnticodon = (codon) => codon.split('').map((base) => BASE_PAIRS[base]).join('')

export const BASE_COLORS = {
  A: '#83d048',
  U: '#ff6b6b',
  G: '#ffd54f',
  C: '#3fa7ff',
}
