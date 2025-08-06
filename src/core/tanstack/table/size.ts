
export type Size = "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export const SizeMap: Record<Size, string> = {
  '3xs': '6%',
  '2xs': '8%',
  xs: '10%',
  sm: '12%',
  md: '15%',
  lg: '20%',
  xl: '25%',
  '2xl': '30%'
};

export const getSizeClass = (size?: Size): string => {
  if (!size) return SizeMap['md'];
  return SizeMap[size] || SizeMap['md'];
}
