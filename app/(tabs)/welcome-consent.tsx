import { Link, useRouter } from 'expo-router';
import React from 'react';
import { Animated, Easing, Platform, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/nativewindui/Button';
import { Icon } from '@/components/nativewindui/Icon';
import { Text } from '@/components/nativewindui/Text';
import { useColorScheme } from '@/lib/useColorScheme';
import { withOpacity } from '@/theme/with-opacity';

const SF_SYMBOL_PROPS = { type: 'hierarchical' } as const;

export default function WelcomeConsentScreen() {
  const { colors } = useColorScheme();
  const router = useRouter();

  const headerAnim = React.useRef(new Animated.Value(0)).current;
  const buttonScale = React.useRef(new Animated.Value(0.96)).current;
  const featureAnims = React.useRef(FEATURES.map(() => new Animated.Value(0))).current;

  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.stagger(
        110,
        featureAnims.map((fa) => Animated.timing(fa, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }))
      ),
      Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true, friction: 6, tension: 80 }),
    ]).start();
  }, [headerAnim, featureAnims, buttonScale]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [
                { translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
              ],
            },
          ]}>
          <Text variant="largeTitle" style={[styles.titlePrimary, { fontSize: 28, color: colors.text }]}>Welcome to</Text>
          <Text
            variant="largeTitle"
            style={[
              styles.titlePrimary,
              { color: colors.primary, fontWeight: '800', fontSize: 36, marginTop: 6 },
            ]}>
            NativewindUI
          </Text>
        </Animated.View>

        <View style={styles.features}>
          {FEATURES.map((feature, idx) => (
            <Animated.View
              key={feature.title}
              style={[
                styles.featureRow,
                { backgroundColor: withOpacity(colors.primary, 0.03) },
                {
                  opacity: featureAnims[idx],
                  transform: [
                    { translateX: featureAnims[idx].interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
                  ],
                },
              ]}>
              <View style={[styles.iconCircle, { backgroundColor: withOpacity(colors.primary, 0.12) }]}> 
                <Icon name={feature.icon} size={20} color={colors.primary} sfSymbol={SF_SYMBOL_PROPS} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text variant="callout" style={styles.featureTitle}>
                  {feature.title}
                </Text>
                <Text variant="subhead" style={styles.featureDesc}>
                  {feature.description}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <View style={styles.footer}>
          <View style={styles.infoRow}>
            <Icon name="info.circle" color={colors.primary} sfSymbol={SF_SYMBOL_PROPS} />
            <Text variant="caption2" style={styles.infoText}>
              By pressing continue, you agree to our{' '}
              <Link href="../">
                <Text variant="caption2" style={{ color: colors.primary }}>
                  Terms of Service
                </Text>
              </Link>{' '}
              and that you have read our{' '}
              <Link href="../">
                <Text variant="caption2" style={{ color: colors.primary }}>
                  Privacy Policy
                </Text>
              </Link>
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
              <Button
                size={Platform.select({ ios: 'lg', default: 'md' })}
                onPress={() => router.push('../')}
                style={[
                  styles.button,
                  { backgroundColor: colors.primary, shadowColor: colors.primary },
                ]}>
                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Continue</Text>
              </Button>
            </Animated.View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: { padding: 20, maxWidth: 560, alignSelf: 'center', flexGrow: 1, justifyContent: 'space-between' },
  header: { paddingTop: Platform.OS === 'ios' ? 32 : 24 },
  titlePrimary: { textAlign: 'center', fontWeight: '700' },
  features: { gap: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 6 },
  featureIconContainer: { paddingTop: 1 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  featureTextContainer: { flex: 1 },
  featureTitle: { fontWeight: '600', fontSize: 16 },
  featureDesc: { color: '#6b7280', lineHeight: 20 },
  footer: { gap: 12, marginTop: 12 },
  infoRow: { alignItems: 'center' },
  infoText: { paddingTop: 6, textAlign: 'center', maxWidth: 480, color: '#9ca3af' },
  buttonRow: { marginTop: 16, alignItems: 'center', width: '100%' },
  button: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 12,
    elevation: 4,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
});

const FEATURES = [
  {
    title: 'Build beautiful apps',
    description: 'A collection of components and flows that are easy to use and customize.',
    icon: 'wrench.and.screwdriver.fill',
  },
  {
    title: 'Documentation',
    description: 'A comprehensive guide to help you get started.',
    icon: 'doc.on.doc.fill',
  },
  {
    title: 'Community',
    description: 'Join our community to get help and support.',
    icon: 'ellipsis.message.fill',
  },
] as const;