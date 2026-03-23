import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FUEL_TYPES, Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/lib/constants';
import type { FuelType } from '@/lib/types';

interface FuelTypeSelectorProps {
  selected: FuelType;
  onSelect: (type: FuelType) => void;
  compact?: boolean;
}

export function FuelTypeSelector({ selected, onSelect, compact }: FuelTypeSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FUEL_TYPES.map((fuel) => {
        const isActive = fuel.slug === selected;
        return (
          <TouchableOpacity
            key={fuel.slug}
            onPress={() => onSelect(fuel.slug)}
            style={[
              styles.pill,
              isActive && styles.pillActive,
            ]}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.pillText,
              isActive && styles.pillTextActive,
            ]}>
              {compact ? fuel.short : fuel.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.semibold,
  },
});
