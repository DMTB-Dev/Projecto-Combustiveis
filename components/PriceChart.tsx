import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import type { PriceHistoryPoint } from '@/lib/types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/lib/constants';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface PriceChartProps {
  data: PriceHistoryPoint[];
  title?: string;
}

type TimeRange = '7D' | '30D' | '90D' | '1A';

const RANGE_DAYS: Record<TimeRange, number> = {
  '7D': 7,
  '30D': 30,
  '90D': 90,
  '1A': 365,
};

export function PriceChart({ data, title }: PriceChartProps) {
  const [range, setRange] = useState<TimeRange>('30D');

  const days = RANGE_DAYS[range];
  const filtered = data.slice(-days);

  if (filtered.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Dados insuficientes para o gráfico</Text>
      </View>
    );
  }

  const prices = filtered.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

  // Show ~6 labels on the X axis
  const step = Math.max(1, Math.floor(filtered.length / 6));
  const labels = filtered.map((p, i) => {
    if (i % step === 0 || i === filtered.length - 1) {
      const d = new Date(p.date);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }
    return '';
  });

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      {/* Time range selector */}
      <View style={styles.rangeRow}>
        {(Object.keys(RANGE_DAYS) as TimeRange[]).map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRange(r)}
            style={[styles.rangeButton, range === r && styles.rangeButtonActive]}
          >
            <Text style={[styles.rangeText, range === r && styles.rangeTextActive]}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <LineChart
        data={{
          labels,
          datasets: [{ data: prices }],
        }}
        width={SCREEN_WIDTH - Spacing.lg * 2 - Spacing.lg * 2}
        height={180}
        chartConfig={{
          backgroundColor: Colors.surface,
          backgroundGradientFrom: Colors.surface,
          backgroundGradientTo: Colors.surface,
          decimalPlaces: 3,
          color: () => Colors.primary,
          labelColor: () => Colors.textMuted,
          propsForDots: {
            r: '2',
            strokeWidth: '1',
            stroke: Colors.primary,
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: Colors.border,
            strokeWidth: 0.5,
          },
        }}
        bezier
        withInnerLines={true}
        withOuterLines={false}
        withShadow={false}
        style={styles.chart}
      />

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Mínimo</Text>
          <Text style={[styles.statValue, { color: Colors.secondary }]}>
            {minPrice.toFixed(3)}€
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Média</Text>
          <Text style={styles.statValue}>{avgPrice.toFixed(3)}€</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Máximo</Text>
          <Text style={[styles.statValue, { color: Colors.priceUp }]}>
            {maxPrice.toFixed(3)}€
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  rangeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.background,
  },
  rangeButtonActive: {
    backgroundColor: Colors.primary,
  },
  rangeText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  rangeTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.semibold,
  },
  chart: {
    borderRadius: BorderRadius.md,
    marginLeft: -Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  statValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  empty: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
});
