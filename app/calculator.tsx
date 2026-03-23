import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
// Slider doesn't support web — conditionally imported
const SliderNative = Platform.OS !== 'web' ? require('@react-native-community/slider').default : null;
import { TankCalculator } from '@/components/TankCalculator';
import { FuelTypeSelector } from '@/components/FuelTypeSelector';
import { BrandLogo } from '@/components/BrandLogo';
import { usePreferences } from '@/stores/usePreferences';
import { getMockStations, MOCK_FORECASTS } from '@/lib/mock-data';
import type { StationWithPrice } from '@/lib/types';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, FUEL_TYPE_MAP } from '@/lib/constants';

export default function CalculatorScreen() {
  const { fuelType, setFuelType, tankSize, setTankSize, fillupsPerMonth, setFillupsPerMonth } =
    usePreferences();

  const stations = useMemo(() => {
    const all = getMockStations(fuelType);
    return all.sort((a, b) => a.price - b.price);
  }, [fuelType]);

  const [stationA, setStationA] = useState<StationWithPrice | null>(null);
  const [stationB, setStationB] = useState<StationWithPrice | null>(null);
  const [showPicker, setShowPicker] = useState<'A' | 'B' | null>(null);

  // Auto-populate cheapest and second-cheapest
  useEffect(() => {
    if (stations.length >= 2) {
      setStationA(stations[0]);
      setStationB(stations[1]);
    }
  }, [stations]);

  const forecast = MOCK_FORECASTS.find((f) => f.fuel_type === fuelType);
  const forecastSavings = forecast
    ? Math.abs((forecast.change_cents / 100) * tankSize)
    : 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Fuel type selector */}
      <View style={styles.section}>
        <FuelTypeSelector selected={fuelType} onSelect={setFuelType} compact />
      </View>

      {/* Tank size slider */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tamanho do depósito</Text>
        <Text style={styles.tankValue}>{tankSize} L</Text>
        {Platform.OS === 'web' ? (
          <View style={styles.webSliderRow}>
            {[30, 40, 50, 60, 70, 80, 100].map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.frequencyPill, tankSize === size && styles.frequencyPillActive]}
                onPress={() => setTankSize(size)}
              >
                <Text style={[styles.frequencyText, tankSize === size && styles.frequencyTextActive]}>
                  {size}L
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <>
            <SliderNative
              style={styles.slider}
              minimumValue={20}
              maximumValue={200}
              step={5}
              value={tankSize}
              onValueChange={setTankSize}
              minimumTrackTintColor={Colors.primary}
              maximumTrackTintColor={Colors.border}
              thumbTintColor={Colors.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>20L</Text>
              <Text style={styles.sliderLabel}>200L</Text>
            </View>
          </>
        )}
      </View>

      {/* Fill-up frequency */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Frequência de abastecimento</Text>
        <View style={styles.frequencyRow}>
          {[2, 4, 6, 8].map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.frequencyPill,
                fillupsPerMonth === count && styles.frequencyPillActive,
              ]}
              onPress={() => setFillupsPerMonth(count)}
            >
              <Text
                style={[
                  styles.frequencyText,
                  fillupsPerMonth === count && styles.frequencyTextActive,
                ]}
              >
                {count}x/mês
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Station selection (tap to change) */}
      <View style={styles.pickRow}>
        <StationPicker
          label="Posto A"
          station={stationA}
          onPress={() => setShowPicker(showPicker === 'A' ? null : 'A')}
        />
        <StationPicker
          label="Posto B"
          station={stationB}
          onPress={() => setShowPicker(showPicker === 'B' ? null : 'B')}
        />
      </View>

      {/* Station picker dropdown */}
      {showPicker && (
        <View style={styles.pickerDropdown}>
          <Text style={styles.pickerTitle}>
            Selecionar {showPicker === 'A' ? 'Posto A' : 'Posto B'}
          </Text>
          <ScrollView style={styles.pickerList} nestedScrollEnabled>
            {stations.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={styles.pickerItem}
                onPress={() => {
                  if (showPicker === 'A') setStationA(s);
                  else setStationB(s);
                  setShowPicker(null);
                }}
              >
                <BrandLogo brand={s.brand} size={28} />
                <View style={styles.pickerItemInfo}>
                  <Text style={styles.pickerItemName}>{s.name}</Text>
                  <Text style={styles.pickerItemPrice}>{s.price.toFixed(3)} €/L</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Calculator comparison */}
      <TankCalculator
        stationA={stationA}
        stationB={stationB}
        tankSize={tankSize}
        fillupsPerMonth={fillupsPerMonth}
      />

      {/* Forecast tie-in */}
      {forecast && forecast.change_cents > 0 && (
        <View style={styles.forecastTip}>
          <Text style={styles.forecastTipText}>
            💡 {forecast.direction === 'up' ? 'Se atestar hoje' : 'Se esperar até segunda'},{' '}
            poupa <Text style={{ fontWeight: FontWeight.bold }}>€{forecastSavings.toFixed(2)}</Text>{' '}
            em {FUEL_TYPE_MAP[fuelType]}
          </Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function StationPicker({
  label,
  station,
  onPress,
}: {
  label: string;
  station: StationWithPrice | null;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.stationPicker} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.stationPickerLabel}>{label}</Text>
      {station ? (
        <View style={styles.stationPickerContent}>
          <BrandLogo brand={station.brand} size={24} />
          <Text style={styles.stationPickerName} numberOfLines={1}>
            {station.name}
          </Text>
        </View>
      ) : (
        <Text style={styles.stationPickerPlaceholder}>Selecionar...</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  section: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  tankValue: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  webSliderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  frequencyPill: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  frequencyPillActive: {
    backgroundColor: Colors.primary,
  },
  frequencyText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  frequencyTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.semibold,
  },
  pickRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  stationPicker: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stationPickerLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  stationPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stationPickerName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    flex: 1,
  },
  stationPickerPlaceholder: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  pickerDropdown: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
    maxHeight: 250,
    overflow: 'hidden',
  },
  pickerTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerList: {
    maxHeight: 200,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerItemInfo: {
    flex: 1,
  },
  pickerItemName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.text,
  },
  pickerItemPrice: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  forecastTip: {
    backgroundColor: '#FFF7ED',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  forecastTipText: {
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 20,
  },
});
