import { IconSymbol as FallbackIconSymbol } from '@/components/ui/icon-symbol';
import { IconSymbol as IOSIconSymbol } from '@/components/ui/icon-symbol.ios';
import { Platform, type StyleProp, type TextStyle } from 'react-native';

type SFSymbolProps = {
  type?: 'hierarchical' | 'palette' | 'multicolor' | 'regular';
};

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  // Accept either text or view style because the underlying icon components
  // use TextStyle (MaterialIcons) or ViewStyle (SymbolView on iOS).
  style?: StyleProp<any>;
  sfSymbol?: SFSymbolProps;
};

/**
 * Nativewind-friendly Icon component.
 * Uses native SF Symbols on iOS via `expo-symbols`, and falls back to MaterialIcons on other platforms.
 */
function Icon({ name, size = 24, color = '#000', style, sfSymbol }: IconProps) {
  // iOS: use the native SymbolView
  if (Platform.OS === 'ios') {
    // Map incoming sfSymbol to the iOS weight prop where possible
  const weight = sfSymbol?.type === 'hierarchical' ? ('hierarchical' as any) : undefined;
    // @ts-expect-error - weight typing is handled inside the ios component
    return <IOSIconSymbol name={name} size={size} color={color} style={style} weight={weight} />;
  }

  // Android & web: use MaterialIcons fallback
  return <FallbackIconSymbol name={name as any} size={size} color={color} style={style as StyleProp<TextStyle>} />;
}

export { Icon };
export type { IconProps };

