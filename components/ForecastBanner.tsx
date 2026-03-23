import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { WeeklyForecast } from '@/lib/types';
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  FontWeight,
  FUEL_TYPE_MAP,
  DIRECTION_COLORS,
  ADVICE_LABELS,
} from '@/lib/constants';
import { formatCentsChange } from '@/lib/location';

interface ForecastBannerProps {
  forecast: WeeklyForecast;
  tankSize: number;
}

export function ForecastBanner({ forecast, tankSize }: ForecastBannerProps) {
  const directionColor = DIRECTION_COLORS[forecast.direction];
  const fuelLabel = FUEL_TYPE_MAP[forecast.fuel_type];
  const adviceLabel = ADVICE_LABELS[forecast.advice];
  const savings = Math.abs((forecast.change_cents / 100) * tankSize);

  const effectiveDate = new Date(forecast.effective_date).toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const bgColor =
    forecast.direction === 'up'
      ? '#FEF2F2'
      : forecast.direction === 'down'
        ? '#F0FDF4'
        : '#F9FAFB';

  const borderColor =
    forecast.direction === 'up'
      ? '#FECACA'
      : forecast.direction === 'down'
        ? '#BBF7D0'
        : '#E5E7EB';

  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderColor }]}>
      <View style={styles.header}>
        <Text style={styles.fuelLabel}>{fuelLabel}</Text>
        <View style={[styles.directionBadge, { backgroundColor: directionColor }]}>
          <Text style={styles.directionText}>
            {forecast.direction === 'up' ? '↑' : forecast.direction === 'down' ? '↓' : '→'}{' '}
            {forecast.change_cents > 0 ? formatCentsChange(forecast.change_cents) : 'Estável'}
          </Text>
        </View>
      </View>

      <Text style={[styles.advice, { color: directionColor }]}>{adviceLabel}</Text>

      {forecast.change_cents > 0 && (
        <Text style={styles.savings}>
          Num depósito de {tankSize}L, {forecast.direction === 'up' ? 'poupa' : 'ganha'}{' '}
          <Text style={{ fontWeight: FontWeight.bold }}>€{savings.toFixed(2)}</Text>{' '}
          {forecast.direction === 'up' ? 'se atestar hoje' : 'se esperar'}
        </Text>
      )}

      <Text style={styles.effectiveDate}>
        Preços mudam {effectiveDate}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  fuelLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  directionBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
  },
  directionText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  advice: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    marginBottom: Spacing.sm,
  },
  savings: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
  effectiveDate: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
