export const CODON_TO_AA = {
  AUG: 'Metionina',
  UUA: 'Leucina',
  UCU: 'Serina',
  UAU: 'Tirosina',
  UGU: 'Cisteina',
  UGG: 'Triptofano',
  CCU: 'Prolina',
  CAU: 'Histidina',
  CAA: 'Glutamina',
  CGU: 'Arginina',
  AUU: 'Isoleucina',
  ACU: 'Treonina',
  AAU: 'Asparagina',
  AAA: 'Lisina',
  GUU: 'Valina',
  GCU: 'Alanina',
  GAU: 'Aspartico',
  GAA: 'Glutamico',
  GGU: 'Glicina',
}

export const DIFFICULTY_PROFILES = {
  easy: {
    label: 'Facil',
    timePerCodonMs: 60000,
    deckSize: 3,
    scoreFactor: 1,
  },
  normal: {
    label: 'Normal',
    timePerCodonMs: 40000,
    deckSize: 5,
    scoreFactor: 1.5,
  },
  hard: {
    label: 'Dificil',
    timePerCodonMs: 24000,
    deckSize: 7,
    scoreFactor: 2,
  },
}

export const GAME_CONFIG = {
  tickRateMs: 100,
  levelLength: 12,
  codonLives: 3,
  maxToasts: 4,
}
