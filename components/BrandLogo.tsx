import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BRAND_COLORS } from '@/lib/constants';

interface BrandLogoProps {
  brand: string;
  size?: number;
}

/**
 * Text-based brand badge placeholder.
 * Replace with actual brand logo images when available.
 */
export function BrandLogo({ brand, size = 40 }: BrandLogoProps) {
  const bgColor = BRAND_COLORS[brand] || '#6B7280';
  const initials = brand
    .split(/[\s.]/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
      <Text style={[styles.text, { fontSize: size * 0.36 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
