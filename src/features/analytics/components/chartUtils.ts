

interface ResponsiveFontSizeOptions {
  width: number | undefined
  minFont: number
  maxFont: number
  startDecreaseWidth: number
}

export function getResponsiveFontSize({
  width,
  minFont,
  maxFont,
  startDecreaseWidth,
}: ResponsiveFontSizeOptions) {
  if (!width) return maxFont;

  if (width >= startDecreaseWidth) return maxFont;

  const ratio = width / startDecreaseWidth;
  return Math.round(minFont + ratio * (maxFont - minFont));
}
