export class Sanitizer {
  public static key(key?: string | null, mappings: Record<string, string> = {}): string {
    if (key === null || key === undefined) {
      return 'N/A';
    }

    const mapLower: Record<string, string> = {};
    for (const [raw, val] of Object.entries(mappings)) {
      mapLower[raw.toLowerCase()] = val;
    }

    const spaced = key
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .trim();

    const words = spaced.split(/\s+/).filter(Boolean);

    const titleCased = words.map(w => {
      const lower = w.toLowerCase();
      if (mapLower[lower]) {
        return mapLower[lower];
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });

    let result = titleCased.join(' ');
    for (const [raw, val] of Object.entries(mappings)) {
      if (!raw.includes(' ')) continue;
      const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      result = result.replace(regex, val);
    }

    console.log(`Sanitizing ${key} to ${result}`)
    return result;
  }

  public static value(value: any): string {
    if (value === null || value === undefined) {
      return 'N/A';
    }

    if (typeof value === 'object') {
      if (value.name && value.email) {
        return `${value.name}`;
      }
      if (value.name) {
        return value.name;
      }
      if (value.label || value.title) {
        return value.label || value.title;
      }
      if (value.id && value.code) {
        return `${value.code} (${value.id})`;
      }
      const str = JSON.stringify(value);
      return str.length > 50 ? str.slice(0, 47) + '...' : str;
    }

    if (typeof value === 'string') {
      const isLikelyDate =
        /^\d{4}-\d{2}-\d{2}/.test(value) ||
        /^\d{4}\/\d{2}\/\d{2}/.test(value) ||
        /^\d{4}-\d{2}-\d{2}T/.test(value);

      if (isLikelyDate) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return Sanitizer.date(date);
        }
      }
      return value;
    }
    if (value instanceof Date) {
      return Sanitizer.date(value);
    }
    if (Array.isArray(value)) {
      return value.map(v => Sanitizer.value(v)).join(', ');
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

  private constructor() { }
}
