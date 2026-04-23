import { codons } from './geneticCode';

export const beadColors = [
  '#E32636',
  '#5BC0BE',
  '#FFDB58',
  '#D18F58',
  '#A4E8DA',
  '#F4E7D3',
  '#7A8CA5',
];

export function normalizeText(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function generateSequence(length = 25) {
  const sequence = ['AUG'];

  for (let i = 0; i < length - 1; i += 1) {
    sequence.push(codons[Math.floor(Math.random() * codons.length)]);
  }

  return sequence;
}

export function getLevelByIndex(index) {
  return Math.floor(index / 4) + 1;
}

export function getRoundDuration(level) {
  return Math.max(15000 - level * 2000, 5000);
}

export function generateHint(word, level) {
  const chars = word.split('');
  const visibleChars = chars.filter((char) => char !== ' ').length;
  let hiddenCount = visibleChars;

  if (level === 1) hiddenCount = Math.floor(chars.length * 0.2);
  else if (level === 2) hiddenCount = Math.floor(chars.length * 0.4);
  else if (level === 3) hiddenCount = Math.floor(chars.length * 0.6);
  else if (level === 4) hiddenCount = Math.floor(chars.length * 0.8);

  const indicesToHide = [];
  while (indicesToHide.length < hiddenCount) {
    const randomIndex = Math.floor(Math.random() * chars.length);

    if (chars[randomIndex] !== ' ' && !indicesToHide.includes(randomIndex)) {
      indicesToHide.push(randomIndex);
    }

    if (indicesToHide.length >= visibleChars) break;
  }

  indicesToHide.forEach((index) => {
    chars[index] = '_';
  });

  return chars.join(' ');
}
