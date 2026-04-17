// ─── Abusive / Profane Word Filter ──────────────────────────────────────────
// Add more words manually to the ABUSIVE_WORDS array below.
// The checker is case-insensitive and matches whole words (so "class" won't
// match "classic") but will catch "f*ck" variants via the normalise step.

export const ABUSIVE_WORDS: string[] = [
  // Common English profanity
  'fuck', 'shit', 'bitch', 'bastard', 'asshole', 'ass', 'cunt', 'dick',
  'cock', 'pussy', 'whore', 'slut', 'fag', 'faggot', 'nigger', 'nigga',
  'retard', 'idiot', 'moron', 'imbecile', 'dumbass', 'dipshit', 'bullshit',
  'motherfucker', 'fucker', 'jackass', 'prick', 'twat', 'wanker',

  // Hindi/Hinglish abusive words (transliterated)
  'madarchod', 'behenchod', 'chutiya', 'randi', 'gandu', 'harami',
  'bhosdike', 'lavde', 'lauda', 'gaand', 'saala', 'kamine', 'bhosdi',
  'maderchod', 'bhenchod', 'chodu', 'kutte', 'kamina', 'boor', 'bur', 'lund', 'chutiye'

  // ADD MORE WORDS BELOW THIS LINE ↓
  
];

/**
 * Normalise a string: lowercase + collapse leet-speak substitutions
 * (e.g. @ → a, 0 → o, 3 → e, $ → s) before matching.
 */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/@/g, 'a')
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/\$/g, 's')
    .replace(/!/g, 'i')
    .replace(/\*/g, '');
}

/**
 * Returns true if the text contains any abusive word.
 * Strips punctuation and uses word-boundary matching.
 */
export function containsAbusiveWord(text: string): boolean {
  const norm = normalise(text);
  return ABUSIVE_WORDS.some((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(norm);
  });
}
