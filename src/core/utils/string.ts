
export function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function plural(n: number, word: string) {
  return `${n} ${word}${n !== 1 ? 's' : ''}`
}
