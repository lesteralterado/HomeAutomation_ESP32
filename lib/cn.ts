/**
 * Very small className joiner used in the project.
 * Keeps parity with common `cn` helpers used with nativewind/tailwind.
 */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export default cn;
