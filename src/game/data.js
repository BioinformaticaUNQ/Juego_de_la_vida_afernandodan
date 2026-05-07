export const BASE_PAIRS = {
  A: 'U',
  U: 'A',
  G: 'C',
  C: 'G',
}

export const GENETIC_CODE = {
  UUU: { amino: 'Phe', name: 'Fenilalanina' }, UUC: { amino: 'Phe', name: 'Fenilalanina' }, UUA: { amino: 'Leu', name: 'Leucina' }, UUG: { amino: 'Leu', name: 'Leucina' },
  UCU: { amino: 'Ser', name: 'Serina' }, UCC: { amino: 'Ser', name: 'Serina' }, UCA: { amino: 'Ser', name: 'Serina' }, UCG: { amino: 'Ser', name: 'Serina' },
  UAU: { amino: 'Tyr', name: 'Tirosina' }, UAC: { amino: 'Tyr', name: 'Tirosina' }, UAA: { amino: 'STOP', name: 'Codón de parada', isStop: true }, UAG: { amino: 'STOP', name: 'Codón de parada', isStop: true },
  UGU: { amino: 'Cys', name: 'Cisteína' }, UGC: { amino: 'Cys', name: 'Cisteína' }, UGA: { amino: 'STOP', name: 'Codón de parada', isStop: true }, UGG: { amino: 'Trp', name: 'Triptófano' },

  CUU: { amino: 'Leu', name: 'Leucina' }, CUC: { amino: 'Leu', name: 'Leucina' }, CUA: { amino: 'Leu', name: 'Leucina' }, CUG: { amino: 'Leu', name: 'Leucina' },
  CCU: { amino: 'Pro', name: 'Prolina' }, CCC: { amino: 'Pro', name: 'Prolina' }, CCA: { amino: 'Pro', name: 'Prolina' }, CCG: { amino: 'Pro', name: 'Prolina' },
  CAU: { amino: 'His', name: 'Histidina' }, CAC: { amino: 'His', name: 'Histidina' }, CAA: { amino: 'Gln', name: 'Glutamina' }, CAG: { amino: 'Gln', name: 'Glutamina' },
  CGU: { amino: 'Arg', name: 'Arginina' }, CGC: { amino: 'Arg', name: 'Arginina' }, CGA: { amino: 'Arg', name: 'Arginina' }, CGG: { amino: 'Arg', name: 'Arginina' },

  AUU: { amino: 'Ile', name: 'Isoleucina' }, AUC: { amino: 'Ile', name: 'Isoleucina' }, AUA: { amino: 'Ile', name: 'Isoleucina' }, AUG: { amino: 'Met', name: 'Metionina' },
  ACU: { amino: 'Thr', name: 'Treonina' }, ACC: { amino: 'Thr', name: 'Treonina' }, ACA: { amino: 'Thr', name: 'Treonina' }, ACG: { amino: 'Thr', name: 'Treonina' },
  AAU: { amino: 'Asn', name: 'Asparagina' }, AAC: { amino: 'Asn', name: 'Asparagina' }, AAA: { amino: 'Lys', name: 'Lisina' }, AAG: { amino: 'Lys', name: 'Lisina' },
  AGU: { amino: 'Ser', name: 'Serina' }, AGC: { amino: 'Ser', name: 'Serina' }, AGA: { amino: 'Arg', name: 'Arginina' }, AGG: { amino: 'Arg', name: 'Arginina' },

  GUU: { amino: 'Val', name: 'Valina' }, GUC: { amino: 'Val', name: 'Valina' }, GUA: { amino: 'Val', name: 'Valina' }, GUG: { amino: 'Val', name: 'Valina' },
  GCU: { amino: 'Ala', name: 'Alanina' }, GCC: { amino: 'Ala', name: 'Alanina' }, GCA: { amino: 'Ala', name: 'Alanina' }, GCG: { amino: 'Ala', name: 'Alanina' },
  GAU: { amino: 'Asp', name: 'Ácido aspártico' }, GAC: { amino: 'Asp', name: 'Ácido aspártico' }, GAA: { amino: 'Glu', name: 'Ácido glutámico' }, GAG: { amino: 'Glu', name: 'Ácido glutámico' },
  GGU: { amino: 'Gly', name: 'Glicina' }, GGC: { amino: 'Gly', name: 'Glicina' }, GGA: { amino: 'Gly', name: 'Glicina' }, GGG: { amino: 'Gly', name: 'Glicina' },
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
    sequenceBaseLength: 7,
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
    sequenceBaseLength: 14,
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
    sequenceBaseLength: 21,
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

export const getQualityByErrorRate = (errorRate, threshold = 0.15) => {
  // Retorna 'valida' si los errores están bajo el umbral, 'truncada' si no
  return errorRate <= threshold ? 'valida' : 'truncada'
}
