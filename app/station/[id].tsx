import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BrandLogo } from '@/components/BrandLogo';
import { PriceChart } from '@/components/PriceChart';
import { FuelTypeSelector } from '@/components/FuelTypeSelector';
import { usePreferences } from '@/stores/usePreferences';
import { getMockStations, getMockPriceHistory, MOCK_NATIONAL_AVERAGES } from '@/lib/mock-data';
import { formatPrice, formatDistance, calculateDistance } from '@/lib/location';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, FUEL_TYPES } from '@/lib/constants';
import type { FuelType } from '@/lib/types';

export default function StationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fuelType, setFuelType, favorites, toggleFavorite } = usePreferences();

  // Find station across all fuel types
  const station = useMemo(() => {
    const stations = getMockStations(fuelType);
    return stations.find((s) => s.id === id) ?? null;
  }, [id, fuelType]);

  const priceHistory = useMemo(
    () => (station ? getMockPriceHistory(station.id, fuelType, 90) : []),
    [station, fuelType],
  );

  // All fuel prices for this station
  const allPrices = useMemo(() => {
    return FUEL_TYPES.map((ft) => {
      const stationsForFuel = getMockStations(ft.slug);
      const match = stationsForFuel.find((s) => s.id === id);
      return {
        ...ft,
        price: match?.price ?? 0,
        reported_at: match?.reported_at ?? '',
      };
    });
  }, [id]);

  const nationalAvg = MOCK_NATIONAL_AVERAGES[fuelType];

  if (!station) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>Posto não encontrado</Text>
      </View>
    );
  }

  const isFav = favorites.includes(station.id);
  const priceDiff = nationalAvg
    ? Math.round((station.price - nationalAvg) * 1000) / 10
    : null;

  const openDirections = () => {
    const scheme = Platform.select({
      ios: `maps:0,0?q=${station.latitude},${station.longitude}`,
      android: `geo:${station.latitude},${station.longitude}?q=${station.latitude},${station.longitude}(${station.name})`,
    });
    if (scheme) Linking.openURL(scheme);
  };

  const lastUpdated = new Date(station.reported_at).toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <BrandLogo brand={station.brand} size={56} />
          <View style={styles.headerInfo}>
            <Text style={styles.stationName}>{station.name}</Text>
            <Text style={styles.brand}>{station.brand}</Text>
            <Text style={styles.address}>{station.address}</Text>
            {station.distance !== undefined && (
              <Text style={styles.distance}>{formatDistance(station.distance)}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(station.id)} hitSlop={12}>
            <Text style={styles.favIcon}>{isFav ? '★' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        {/* Services */}
        {station.services && station.services.length > 0 && (
          <View style={styles.servicesRow}>
            {station.services.map((service) => (
              <View key={service} style={styles.serviceBadge}>
                <Text style={styles.serviceText}>{service}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Opening hours & directions */}
        <View style={styles.actionsRow}>
          {station.opening_hours && (
            <View style={styles.openingHours}>
              <Text style={styles.openingLabel}>Horário:</Text>
              <Text style={styles.openingValue}>{station.opening_hours}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.directionsButton} onPress={openDirections}>
            <Text style={styles.directionsText}>Como chegar →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* All fuel prices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preços atuais</Text>
        <Text style={styles.updatedAt}>Atualizado: {lastUpdated}</Text>
        <View style={styles.pricesGrid}>
          {allPrices.map((fp) => {
            const isSelected = fp.slug === fuelType;
            return (
              <TouchableOpacity
                key={fp.slug}
                style={[styles.priceCard, isSelected && styles.priceCardSelected]}
                onPress={() => setFuelType(fp.slug)}
                activeOpacity={0.7}
              >
                <Text style={styles.priceCardLabel}>{fp.short}</Text>
                <Text style={[styles.priceCardValue, isSelected && styles.priceCardValueSelected]}>
                  {fp.price.toFixed(3)}€
                </Text>
                <Text style={styles.priceCardUnit}>/L</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Price vs average */}
      {priceDiff !== null && (
        <View style={styles.section}>
          <View style={styles.avgComparison}>
            <Text style={styles.avgLabel}>Média nacional:</Text>
            <Text style={styles.avgValue}>{nationalAvg.toFixed(3)} €/L</Text>
            <View
              style={[
                styles.diffBadge,
                { backgroundColor: priceDiff <= 0 ? '#F0FDF4' : '#FEF2F2' },
              ]}
            >
              <Text
                style={[
                  styles.diffText,
                  { color: priceDiff <= 0 ? Colors.secondary : Colors.priceUp },
                ]}
              >
                {priceDiff <= 0 ? '' : '+'}{priceDiff.toFixed(1)} cênt {priceDiff <= 0 ? 'abaixo' : 'acima'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Price history chart */}
      <View style={styles.section}>
        <PriceChart data={priceHistory} title="Histórico de preços" />
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  notFound: {
    fontSize: FontSize.lg,
    color: Colors.textMuted,
  },
  header: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  brand: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  address: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  distance: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    marginTop: 4,
  },
  favIcon: {
    fontSize: 28,
    color: Colors.tertiary,
  },
  servicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  serviceBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.background,
  },
  serviceText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  openingHours: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  openingLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  openingValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  directionsButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
  },
  directionsText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: '#FFFFFF',
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  updatedAt: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  pricesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  priceCard: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    minWidth: 90,
  },
  priceCardSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  priceCardLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  priceCardValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.text,
  },
  priceCardValueSelected: {
    color: Colors.primary,
  },
  priceCardUnit: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  avgComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    flexWrap: 'wrap',
  },
  avgLabel: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  avgValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  diffBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.pill,
  },
  diffText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
