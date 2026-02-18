
export function formatDate(date: string | Date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}


export function isValidDate(str: string): boolean {
  const d = new Date(str);
  return !isNaN(d.getTime()) && d.toDateString() !== "Invalid Date";
};
