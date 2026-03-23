import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import type { StationWithPrice } from '@/lib/types';
import { BRAND_COLORS, Colors, Spacing, BorderRadius, FontSize, FontWeight } from '@/lib/constants';
import type { Coordinates } from '@/lib/location';
import { BrandLogo } from './BrandLogo';

// react-native-maps does not support web
let MapView: any = null;
let Marker: any = null;
let Callout: any = null;
let PROVIDER_DEFAULT: any = null;

if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Callout = maps.Callout;
  PROVIDER_DEFAULT = maps.PROVIDER_DEFAULT;
}

interface StationMapProps {
  stations: StationWithPrice[];
  userLocation: Coordinates | null;
  onStationPress?: (station: StationWithPrice) => void;
}

const LISBON: Coordinates = { latitude: 38.7223, longitude: -9.1393 };

export function StationMap({ stations, userLocation, onStationPress }: StationMapProps) {
  const mapRef = useRef<any>(null);
  const center = userLocation || LISBON;

  const recenter = useCallback(() => {
    mapRef.current?.animateToRegion({
      ...center,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    });
  }, [center]);

  const prices = stations.map((s) => s.price);
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

  const getMarkerColor = (price: number): string => {
    if (price <= avgPrice * 0.98) return Colors.secondary;
    if (price >= avgPrice * 1.02) return Colors.priceUp;
    return Colors.tertiary;
  };

  // Web fallback: show a list-style map placeholder
  if (Platform.OS === 'web' || !MapView) {
    return (
      <View style={styles.container}>
        <View style={styles.webFallback}>
          <Text style={styles.webFallbackTitle}>🗺 Mapa</Text>
          <Text style={styles.webFallbackSubtitle}>
            O mapa nativo está disponível na app iOS/Android.
          </Text>
          <View style={styles.webStationList}>
            {stations.map((station) => (
              <TouchableOpacity
                key={station.id}
                style={[styles.webStation, { borderLeftColor: getMarkerColor(station.price) }]}
                onPress={() => onStationPress?.(station)}
                activeOpacity={0.7}
              >
                <BrandLogo brand={station.brand} size={32} />
                <View style={styles.webStationInfo}>
                  <Text style={styles.webStationName}>{station.name}</Text>
                  <Text style={styles.webStationAddr}>{station.address}</Text>
                </View>
                <Text style={styles.webStationPrice}>{station.price.toFixed(3)}€</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

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
  webFallback: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Spacing.xxl,
  },
  webFallbackTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  webFallbackSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  webStationList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  webStation: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    gap: Spacing.md,
  },
  webStationInfo: {
    flex: 1,
  },
  webStationName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  webStationAddr: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  webStationPrice: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: Colors.primary,
  },
});
