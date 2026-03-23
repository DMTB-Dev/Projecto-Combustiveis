import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FuelType } from '@/lib/types';
import { DEFAULT_FUEL_TYPE, DEFAULT_TANK_SIZE, DEFAULT_FILLUPS_PER_MONTH } from '@/lib/constants';

interface PreferencesState {
  fuelType: FuelType;
  tankSize: number;
  fillupsPerMonth: number;
  favorites: string[]; // station IDs
  sortBy: 'distance' | 'price';

  setFuelType: (type: FuelType) => void;
  setTankSize: (size: number) => void;
  setFillupsPerMonth: (count: number) => void;
  toggleFavorite: (stationId: string) => void;
  isFavorite: (stationId: string) => boolean;
  setSortBy: (sort: 'distance' | 'price') => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set, get) => ({
      fuelType: DEFAULT_FUEL_TYPE,
      tankSize: DEFAULT_TANK_SIZE,
      fillupsPerMonth: DEFAULT_FILLUPS_PER_MONTH,
      favorites: [],
      sortBy: 'distance',

      setFuelType: (type) => set({ fuelType: type }),
      setTankSize: (size) => set({ tankSize: size }),
      setFillupsPerMonth: (count) => set({ fillupsPerMonth: count }),

      toggleFavorite: (stationId) =>
        set((state) => ({
          favorites: state.favorites.includes(stationId)
            ? state.favorites.filter((id) => id !== stationId)
            : [...state.favorites, stationId],
        })),

      isFavorite: (stationId) => get().favorites.includes(stationId),
      setSortBy: (sort) => set({ sortBy: sort }),
    }),
    {
      name: 'combustiveis-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
