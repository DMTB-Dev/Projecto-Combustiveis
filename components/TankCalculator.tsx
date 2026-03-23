import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StationWithPrice } from '@/lib/types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/lib/constants';
import { BrandLogo } from './BrandLogo';

interface TankCalculatorProps {
  stationA: StationWithPrice | null;
  stationB: StationWithPrice | null;
  tankSize: number;
  fillupsPerMonth: number;
}

export function TankCalculator({
  stationA,
  stationB,
  tankSize,
  fillupsPerMonth,
}: TankCalculatorProps) {
  if (!stationA || !stationB) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Selecione dois postos para comparar</Text>
      </View>
    );
  }

  const costA = stationA.price * tankSize;
  const costB = stationB.price * tankSize;
  const savingsPerFill = Math.abs(costA - costB);
  const cheaperStation = costA <= costB ? 'A' : 'B';
  const savingsMonthly = savingsPerFill * fillupsPerMonth;
  const savingsYearly = savingsMonthly * 12;

  return (
    <View style={styles.container}>
      {/* Station comparison */}
      <View style={styles.comparison}>
        <StationColumn
          label="Posto A"
          station={stationA}
          cost={costA}
          isCheaper={cheaperStation === 'A'}
        />
        <View style={styles.vs}>
          <Text style={styles.vsText}>VS</Text>
        </View>
        <StationColumn
          label="Posto B"
          station={stationB}
          cost={costB}
          isCheaper={cheaperStation === 'B'}
        />
      </View>

      {/* Savings */}
      {savingsPerFill > 0 && (
        <View style={styles.savingsCard}>
          <Text style={styles.savingsTitle}>Poupança</Text>
          <View style={styles.savingsRow}>
            <SavingsItem label="Por depósito" value={savingsPerFill} />
            <SavingsItem label="Por mês" value={savingsMonthly} />
            <SavingsItem label="Por ano" value={savingsYearly} highlight />
          </View>
        </View>
      )}
    </View>
  );
}

function StationColumn({
  label,
  station,
  cost,
  isCheaper,
}: {
  label: string;
  station: StationWithPrice;
  cost: number;
  isCheaper: boolean;
}) {
  return (
    <View style={[styles.stationCol, isCheaper && styles.stationColCheaper]}>
      <Text style={styles.stationLabel}>{label}</Text>
      <BrandLogo brand={station.brand} size={36} />
      <Text style={styles.stationName} numberOfLines={2}>
        {station.name}
      </Text>
      <Text style={styles.stationPrice}>{station.price.toFixed(3)} €/L</Text>
      <View style={styles.divider} />
      <Text style={styles.costLabel}>Depósito {station.price > 0 ? `${Math.round(cost / station.price)}L` : ''}:</Text>
      <Text style={[styles.cost, isCheaper && styles.costCheaper]}>
        €{cost.toFixed(2)}
      </Text>
      {isCheaper && (
        <View style={styles.cheaperBadge}>
          <Text style={styles.cheaperBadgeText}>Mais barato</Text>
        </View>
      )}
    </View>
  );
}

function SavingsItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <View style={styles.savingsItem}>
      <Text style={styles.savingsLabel}>{label}</Text>
      <Text
        style={[
          styles.savingsValue,
          highlight && styles.savingsValueHighlight,
        ]}
      >
        €{value.toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  comparison: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
  },
  stationCol: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stationColCheaper: {
    borderColor: Colors.secondary,
    borderWidth: 2,
  },
  stationLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
  },
  stationName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  stationPrice: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  costLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  cost: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  costCheaper: {
    color: Colors.secondary,
  },
  cheaperBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
    marginTop: Spacing.sm,
  },
  cheaperBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  vs: {
    justifyContent: 'center',
  },
  vsText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textMuted,
  },
  savingsCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  savingsTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  savingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savingsItem: {
    alignItems: 'center',
  },
  savingsLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
  },
  savingsValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.secondary,
  },
  savingsValueHighlight: {
    fontSize: FontSize.xxl,
    color: Colors.secondary,
  },
  empty: {
    padding: Spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
});
