import leven from "leven";

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december"
];


export function formatDate(date: string | Date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

export function formatDateShort(date: string | Date) {
  const dateObj = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
  }).format(dateObj);
}

export function getDateString(date: Date | string | undefined): string {
  if (!date) return '';
  if (date instanceof Date) return date.toISOString().split('T')[0];
  if (typeof date === 'string') return date;
  return '';
}


function normalizeMonth(input: string, maxDist = 2): string {
  const lower = input.toLowerCase();

  let best = input;// never null
  let bestDist = Infinity;

  for (const m of MONTHS) {
    const d = leven(lower, m);
    if (d < bestDist) {
      bestDist = d;
      best = m;
    }
  }

  return bestDist <= maxDist ? best : input;
}

function fixMonthTypos(str: string) {
  return str.replace(/[a-zA-Z]+/g, word => normalizeMonth(word));
}


export const toIso = (val?: string) => {
  if (!val) return val;

  const normalized = fixMonthTypos(val);

  const parsed = Date.parse(normalized);
  if (isNaN(parsed)) {
    throw new Error(`Invalid date: ${val}`);
  }

  return new Date(parsed).toISOString();
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


export function calculateAge(dateOfBirth: string): number {
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}


export function getDateYearsAgo(years: number): string {
  const date = new Date()
  date.setFullYear(date.getFullYear() - years)
  return date.toISOString().split("T")[0]
}
