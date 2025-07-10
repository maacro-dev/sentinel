export function get<T>(key: string): T | null {
  const v = localStorage.getItem(key);
  return v ? JSON.parse(v) : null;
}

export function store<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function remove(key: string) {
  localStorage.removeItem(key);
}