
export function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function plural(n: number, word: string) {
  return `${n} ${word}${n !== 1 ? 's' : ''}`
}

export const sanitize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
