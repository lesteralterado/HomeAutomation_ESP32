import { Colors } from '@/constants/theme';
import { useColorScheme as useRNColorScheme } from '@/hooks/use-color-scheme';

/**
 * A small adapter that returns the color scheme and a colors object.
 * Many components in this repo expect `useColorScheme()` to return
 * an object like { colorScheme, colors } rather than the raw string.
 */
export function useColorScheme() {
	const colorScheme = useRNColorScheme() ?? 'light';
	const colors = Colors[colorScheme as 'light' | 'dark'];
	return { colorScheme, colors } as const;
}

