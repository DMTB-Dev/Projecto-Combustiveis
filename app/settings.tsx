import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { FuelTypeSelector } from '@/components/FuelTypeSelector';
import { BrandLogo } from '@/components/BrandLogo';
import { usePreferences } from '@/stores/usePreferences';
import { getMockStations } from '@/lib/mock-data';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, FUEL_TYPE_MAP } from '@/lib/constants';

export default function SettingsScreen() {
  const {
    fuelType,
    setFuelType,
    tankSize,
    setTankSize,
    fillupsPerMonth,
    setFillupsPerMonth,
    favorites,
    toggleFavorite,
  } = usePreferences();

  const allStations = getMockStations(fuelType);
  const favoriteStations = allStations.filter((s) => favorites.includes(s.id));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Preferred fuel type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Combustível preferido</Text>
        <Text style={styles.sectionDesc}>
          Usado como filtro predefinido nas listas e mapa
        </Text>
        <FuelTypeSelector selected={fuelType} onSelect={setFuelType} />
      </View>

      {/* Tank size */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tamanho do depósito</Text>
        <View style={styles.tankRow}>
          {[30, 40, 50, 60, 70, 80].map((size) => (
            <TouchableOpacity
              key={size}
              style={[styles.tankPill, tankSize === size && styles.tankPillActive]}
              onPress={() => setTankSize(size)}
            >
              <Text style={[styles.tankText, tankSize === size && styles.tankTextActive]}>
                {size}L
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Fill-up frequency */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequência de abastecimento</Text>
        <View style={styles.tankRow}>
          {[2, 4, 6, 8].map((count) => (
            <TouchableOpacity
              key={count}
              style={[styles.tankPill, fillupsPerMonth === count && styles.tankPillActive]}
              onPress={() => setFillupsPerMonth(count)}
            >
              <Text
                style={[styles.tankText, fillupsPerMonth === count && styles.tankTextActive]}
              >
                {count}x/mês
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Favorites */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Postos favoritos</Text>
        {favoriteStations.length === 0 ? (
          <Text style={styles.emptyFavorites}>
            Nenhum posto favorito. Toque na ★ num posto para o adicionar.
          </Text>
        ) : (
          favoriteStations.map((station) => (
            <View key={station.id} style={styles.favoriteItem}>
              <BrandLogo brand={station.brand} size={32} />
              <View style={styles.favoriteInfo}>
                <Text style={styles.favoriteName}>{station.name}</Text>
                <Text style={styles.favoriteAddress}>{station.address}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(station.id)}>
                <Text style={styles.removeFav}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>Combustíveis v1.0.0</Text>
          <Text style={styles.aboutText}>
            Preços de combustíveis em Portugal Continental.{'\n'}
            Dados de API Aberta (DGEG).
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://apiaberta.pt')}
            style={styles.aboutLink}
          >
            <Text style={styles.aboutLinkText}>apiaberta.pt →</Text>
          </TouchableOpacity>
        </View>
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
  section: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  sectionDesc: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tankRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  tankPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tankPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tankText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  tankTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.semibold,
  },
  emptyFavorites: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    fontStyle: 'italic',
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  favoriteAddress: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  removeFav: {
    fontSize: FontSize.lg,
    color: Colors.textMuted,
    padding: Spacing.sm,
  },
  aboutCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aboutTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  aboutText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  aboutLink: {
    marginTop: Spacing.md,
  },
  aboutLinkText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
