import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { StationMap } from '@/components/StationMap';
import { FuelTypeSelector } from '@/components/FuelTypeSelector';
import { usePreferences } from '@/stores/usePreferences';
import { getCurrentLocation, type Coordinates } from '@/lib/location';
import { getMockStations } from '@/lib/mock-data';
import type { StationWithPrice } from '@/lib/types';
import { Colors, Spacing } from '@/lib/constants';

export default function MapScreen() {
  const router = useRouter();
  const { fuelType, setFuelType } = usePreferences();
  const [stations, setStations] = useState<StationWithPrice[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  const loadData = useCallback(async () => {
    const location = await getCurrentLocation();
    if (location) setUserLocation(location);
    setStations(getMockStations(fuelType));
  }, [fuelType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStationPress = (station: StationWithPrice) => {
    router.push(`/station/${station.id}`);
  };

  return (
    <View style={styles.container}>
      <StationMap
        stations={stations}
        userLocation={userLocation}
        onStationPress={handleStationPress}
      />
      {/* Fuel type selector overlay */}
      <View style={styles.selectorOverlay}>
        <FuelTypeSelector selected={fuelType} onSelect={setFuelType} compact />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  selectorOverlay: {
    position: 'absolute',
    top: Spacing.md,
    left: 0,
    right: 0,
  },
});
