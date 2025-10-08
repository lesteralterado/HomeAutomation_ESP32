/**
 * Returns an rgba string from a hex color and an opacity value (0-1).
 */
export function withOpacity(hex: string, opacity: number) {
  // naive hex to rgba
  const cleaned = hex.replace('#', '');
  const bigint = parseInt(cleaned, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default withOpacity;
