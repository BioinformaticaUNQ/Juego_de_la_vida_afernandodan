export const BASE_PAIRS = {
  A: 'U',
  U: 'A',
  G: 'C',
  C: 'G',
}

export const GENETIC_CODE = {
  UUU: { amino: 'Phe' }, UUC: { amino: 'Phe' }, UUA: { amino: 'Leu' }, UUG: { amino: 'Leu' },
  UCU: { amino: 'Ser' }, UCC: { amino: 'Ser' }, UCA: { amino: 'Ser' }, UCG: { amino: 'Ser' },
  UAU: { amino: 'Tyr' }, UAC: { amino: 'Tyr' }, UAA: { amino: 'STOP', isStop: true }, UAG: { amino: 'STOP', isStop: true },
  UGU: { amino: 'Cys' }, UGC: { amino: 'Cys' }, UGA: { amino: 'STOP', isStop: true }, UGG: { amino: 'Trp' },

  CUU: { amino: 'Leu' }, CUC: { amino: 'Leu' }, CUA: { amino: 'Leu' }, CUG: { amino: 'Leu' },
  CCU: { amino: 'Pro' }, CCC: { amino: 'Pro' }, CCA: { amino: 'Pro' }, CCG: { amino: 'Pro' },
  CAU: { amino: 'His' }, CAC: { amino: 'His' }, CAA: { amino: 'Gln' }, CAG: { amino: 'Gln' },
  CGU: { amino: 'Arg' }, CGC: { amino: 'Arg' }, CGA: { amino: 'Arg' }, CGG: { amino: 'Arg' },

  AUU: { amino: 'Ile' }, AUC: { amino: 'Ile' }, AUA: { amino: 'Ile' }, AUG: { amino: 'Met' },
  ACU: { amino: 'Thr' }, ACC: { amino: 'Thr' }, ACA: { amino: 'Thr' }, ACG: { amino: 'Thr' },
  AAU: { amino: 'Asn' }, AAC: { amino: 'Asn' }, AAA: { amino: 'Lys' }, AAG: { amino: 'Lys' },
  AGU: { amino: 'Ser' }, AGC: { amino: 'Ser' }, AGA: { amino: 'Arg' }, AGG: { amino: 'Arg' },

  GUU: { amino: 'Val' }, GUC: { amino: 'Val' }, GUA: { amino: 'Val' }, GUG: { amino: 'Val' },
  GCU: { amino: 'Ala' }, GCC: { amino: 'Ala' }, GCA: { amino: 'Ala' }, GCG: { amino: 'Ala' },
  GAU: { amino: 'Asp' }, GAC: { amino: 'Asp' }, GAA: { amino: 'Glu' }, GAG: { amino: 'Glu' },
  GGU: { amino: 'Gly' }, GGC: { amino: 'Gly' }, GGA: { amino: 'Gly' }, GGG: { amino: 'Gly' },
}

export const STOP_CODONS = Object.keys(GENETIC_CODE).filter((codon) => GENETIC_CODE[codon].isStop)

const AMINO_COLORS = {
  Ala: '#3fa7ff', Arg: '#f7797d', Asn: '#ff9a33', Asp: '#ff6b6b',
  Cys: '#00d7c5', Gln: '#f7797d', Glu: '#ff6b6b', Gly: '#ff66b2',
  His: '#7bd88f', Ile: '#83d048', Leu: '#2ec4ff', Lys: '#c9a1ff',
  Met: '#9b6dff', Phe: '#ffd54f', Pro: '#00d7c5', Ser: '#82e0aa',
  Thr: '#5cb85c', Trp: '#e09f3e', Tyr: '#83d048', Val: '#7bd88f',
}

export const CODON_TABLE = Object.fromEntries(
  Object.entries(GENETIC_CODE)
    .filter(([, value]) => !value.isStop)
    .map(([codon, value]) => [
      codon,
      {
        amino: value.amino,
        color: AMINO_COLORS[value.amino] || '#9ad0ff',
      },
    ]),
)

export const CODON_KEYS = Object.keys(CODON_TABLE)

const SECONDS = 1000

export const DIFFICULTY_PROFILES = {
  easy: {
    label: 'Facil',
    timerMinMs: 30 * SECONDS,
    timerMaxMs: 35 * SECONDS,
    poolSize: 3,
    incomingCodonWindow: 7,
    scoreMult: 1.05,
    missPenalty: 18,
    errorPenalty: 14,
    rejectRate: 0.8,
    sequenceBaseLength: 18,
    chainGuideElements: 4,
  },
  normal: {
    label: 'Normal',
    timerMinMs: 20 * SECONDS,
    timerMaxMs: 25 * SECONDS,
    poolSize: 5,
    incomingCodonWindow: 5,
    scoreMult: 1.3,
    missPenalty: 24,
    errorPenalty: 18,
    rejectRate: 0.65,
    sequenceBaseLength: 26,
    chainGuideElements: 3,
  },
  hard: {
    label: 'Dificil',
    timerMinMs: 15 * SECONDS,
    timerMaxMs: 20 * SECONDS,
    poolSize: 7,
    incomingCodonWindow: 3,
    scoreMult: 1.7,
    missPenalty: 30,
    errorPenalty: 22,
    rejectRate: 0.5,
    sequenceBaseLength: 34,
    chainGuideElements: 2,
  },
}

export const GAME_CONFIG = {
  tickRateMs: 100,
  levelLengthStep: 2,
  maxToasts: 4,
  chainPreviewLength: 14,
  successThreshold: 0.1,
}

export const getAnticodon = (codon) => codon.split('').map((base) => BASE_PAIRS[base]).join('')

export const BASE_COLORS = {
  A: '#83d048',
  U: '#ff6b6b',
  G: '#ffd54f',
  C: '#3fa7ff',
}

export const getQualityByErrorRate = (errorRate) => {
  if (errorRate === 0) {
    return 'perfecta'
  }
  if (errorRate <= 0.1) {
    return 'funcional'
  }
  if (errorRate <= 0.3) {
    return 'defectuosa'
  }
  return 'degradada'
}
