
export function formatDate(date: string | Date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

export const toIso = (val?: string) => {
  if (!val) return val;
  return new Date(val).toISOString();
};

export const isAtLeastAge = (dateStr: string | Date, minAge: number = 16) => {
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const age = Math.floor((Date.now() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  return age >= minAge;
};

export function isValidDate(str: string): boolean {
  const d = new Date(str);
  return !isNaN(d.getTime()) && d.toDateString() !== "Invalid Date";
};

export const parseDate = (dateStr: string): string | null => {
  if (!dateStr) return null;
  const months: Record<string, string> = {
    'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
    'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
    'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
  };
  const match = dateStr.match(/(\w+)\.?\s+(\d{1,2}),?\s+(\d{4})/i);
  if (match) {
    const monthAbbr = match[1].toLowerCase().substring(0, 3);
    const month = months[monthAbbr];
    const day = match[2].padStart(2, '0');
    const year = match[3];
    if (month) return `${year}-${month}-${day}`;
  }

  // fallback: try javascript date parsing (less reliable)
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return null;
};
