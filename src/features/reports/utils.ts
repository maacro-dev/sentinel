import { ReportBuilder } from "./builder";

export function addKeyValueTable(
  builder: ReportBuilder,
  title: string,
  rows: Array<[string, string | number]>
) {
  builder.addTable(['Metric', 'Value'], rows, title);
}

export function safeNumber(value: any, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}


export function topAndBottom<T>(items: T[], score: (item: T) => number, count = 5) {
  const sorted = [...items].sort((a, b) => score(b) - score(a));
  return {
    top: sorted.slice(0, count),
    bottom: sorted.slice(-count).reverse(),
  };
}

export async function loadLogoBase64(logoPath = '/logo.png'): Promise<string | undefined> {
  try {
    const response = await fetch(logoPath);
    if (response.ok) {
      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result ?? ''));
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (err) {
    console.warn('Could not load logo', err);
  }
  return undefined;
}
