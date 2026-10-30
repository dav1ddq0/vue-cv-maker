/**
 * The two letters of the monogram: the first letter of the first name and of the last surname
 * ("Nadia Martín Reyes" → N, R). A single name gives one letter; an empty one gives none.
 */
export function monogramLetters(fullName: string): [string, string] {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  const letter = (word: string | undefined) => (word ? Array.from(word)[0]!.toLocaleUpperCase() : '')
  return [letter(words[0]), words.length > 1 ? letter(words.at(-1)) : '']
}
