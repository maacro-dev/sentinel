

export class Sanitizer {
  public static key(key: string, mappings: Record<string, string> = {}): string {
    const mapLower: Record<string, string> = {};
    for (const [raw, val] of Object.entries(mappings)) {
      mapLower[raw.toLowerCase()] = val;
    }

    const spaced = key
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ');

    const words = spaced.split(' ');

    const titleCased = words.map(w => {
      const lower = w.toLowerCase();
      if (mapLower[lower]) {
        return mapLower[lower];
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });

    return titleCased.join(' ');
  }

  public static value(value: any): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    if (typeof value === 'string') {
      const date = Date.parse(value);
      if (!isNaN(date)) {
        return Sanitizer.date(value);
      }
      return value;
    }
    if (value instanceof Date) {
      return Sanitizer.date(value);
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  }

  private static date(date: string | Date): string {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  }

  private constructor() {}
}
