import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BrandLogo } from './BrandLogo';
import type { StationWithPrice } from '@/lib/types';
import { formatPrice, formatDistance } from '@/lib/location';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/lib/constants';

interface StationCardProps {
  station: StationWithPrice;
  isCheapest?: boolean;
  isFavorite?: boolean;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  nationalAverage?: number;
}

export function StationCard({
  station,
  isCheapest,
  isFavorite,
  onPress,
  onToggleFavorite,
  nationalAverage,
}: StationCardProps) {
  const priceDiff = nationalAverage
    ? Math.round((station.price - nationalAverage) * 1000) / 10
    : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, isCheapest && styles.cardCheapest]}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        <BrandLogo brand={station.brand} size={44} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{station.name}</Text>
            {isCheapest && (
              <View style={styles.cheapestBadge}>
                <Text style={styles.cheapestText}>Mais barato</Text>
              </View>
            )}
          </View>
          <Text style={styles.address} numberOfLines={1}>{station.address}</Text>
          {station.distance !== undefined && (
            <Text style={styles.distance}>{formatDistance(station.distance)}</Text>
          )}
        </View>
        <View style={styles.priceSection}>
          <Text style={styles.price}>{station.price.toFixed(3)}€</Text>
          <Text style={styles.perLiter}>/L</Text>
          {priceDiff !== null && (
            <Text
              style={[
                styles.priceDiff,
                { color: priceDiff <= 0 ? Colors.secondary : Colors.priceUp },
              ]}
            >
              {priceDiff <= 0 ? '' : '+'}{priceDiff.toFixed(1)} cênt
            </Text>
          )}
        </View>
      </View>
      {onToggleFavorite && (
        <TouchableOpacity onPress={onToggleFavorite} style={styles.favButton} hitSlop={8}>
          <Text style={styles.favIcon}>{isFavorite ? '★' : '☆'}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardCheapest: {
    borderColor: Colors.secondary,
    borderWidth: 1.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
    marginRight: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    flexShrink: 1,
  },
  cheapestBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.pill,
  },
  cheapestText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  address: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  distance: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.text,
  },
  perLiter: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: -2,
  },
  priceDiff: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  favButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  favIcon: {
    fontSize: 20,
    color: Colors.tertiary,
  },
});
