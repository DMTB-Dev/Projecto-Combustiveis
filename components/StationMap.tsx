import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import type { StationWithPrice } from '@/lib/types';
import { BRAND_COLORS, Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/lib/constants';
import type { Coordinates } from '@/lib/location';

interface StationMapProps {
  stations: StationWithPrice[];
  userLocation: Coordinates | null;
  onStationPress?: (station: StationWithPrice) => void;
}

const LISBON: Coordinates = { latitude: 38.7223, longitude: -9.1393 };

export function StationMap({ stations, userLocation, onStationPress }: StationMapProps) {
  const mapRef = useRef<MapView>(null);

  const center = userLocation || LISBON;

  const recenter = useCallback(() => {
    mapRef.current?.animateToRegion({
      ...center,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    });
  }, [center]);

  // Color markers by price relative to average
  const prices = stations.map((s) => s.price);
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  const getMarkerColor = (price: number): string => {
    if (price <= avgPrice * 0.98) return Colors.secondary;
    if (price >= avgPrice * 1.02) return Colors.priceUp;
    return Colors.tertiary;
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          ...center,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={false}
      >
        {stations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
            pinColor={getMarkerColor(station.price)}
            onCalloutPress={() => onStationPress?.(station)}
          >
            <Callout tooltip={false}>
              <View style={styles.callout}>
                <Text style={styles.calloutBrand}>{station.brand}</Text>
                <Text style={styles.calloutName} numberOfLines={1}>
                  {station.name}
                </Text>
                <Text style={styles.calloutPrice}>
                  {station.price.toFixed(3)} €/L
                </Text>
                <Text style={styles.calloutAction}>Toque para ver detalhes</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Recenter button */}
      <TouchableOpacity style={styles.recenterButton} onPress={recenter} activeOpacity={0.8}>
        <Text style={styles.recenterIcon}>◎</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  callout: {
    minWidth: 160,
    padding: Spacing.sm,
  },
  calloutBrand: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  calloutName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginVertical: 2,
  },
  calloutPrice: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
  calloutAction: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  recenterButton: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  recenterIcon: {
    fontSize: 22,
    color: Colors.primary,
  },
});
