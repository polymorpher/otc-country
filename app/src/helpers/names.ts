import list from '~/assets/words.json'

export const randomWord = (numWords = 1, delim = '-'): string => {
  const words = []
  for (let i = 0; i < numWords; i += 1) {
    const word = list[Math.floor(Math.random() * list.length)]
    // word = word.charAt(0).toUpperCase() + word.slice(1)
    words.push(word)
  }

  return words.join(delim)
}

export const newName = (): string => {
  return `${randomWord()}-${randomWord()}`
}
