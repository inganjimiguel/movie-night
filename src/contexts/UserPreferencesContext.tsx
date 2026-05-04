import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getContentStorageKey, normalizeStoredContentItem, type MovieData } from '../services/movieService';

interface UserPreferencesContextType {
  favorites: MovieData[];
  watchLater: MovieData[];
  addToFavorites: (movie: MovieData) => void;
  removeFromFavorites: (movieId: number) => void;
  isFavorite: (movieId: number) => boolean;
  addToWatchLater: (movie: MovieData) => void;
  removeFromWatchLater: (movieId: number) => void;
  isWatchLater: (movieId: number) => boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const STORAGE_KEYS = {
  FAVORITES: 'movienight-favorites',
  WATCH_LATER: 'movienight-watchlater'
};

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<MovieData[]>([]);
  const [watchLater, setWatchLater] = useState<MovieData[]>([]);
  const matchesItem = (item: MovieData, target: MovieData) => getContentStorageKey(item) === getContentStorageKey(target);
  const matchesId = (item: MovieData, movieId: number) => item.id === movieId;

  // Load data from localStorage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedFavorites = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        const savedWatchLater = localStorage.getItem(STORAGE_KEYS.WATCH_LATER);

        if (savedFavorites) {
          const parsedFavorites: MovieData[] = JSON.parse(savedFavorites);
          const normalizedFavorites = await Promise.all(parsedFavorites.map(normalizeStoredContentItem));
          setFavorites(normalizedFavorites);
        }

        if (savedWatchLater) {
          const parsedWatchLater: MovieData[] = JSON.parse(savedWatchLater);
          const normalizedWatchLater = await Promise.all(parsedWatchLater.map(normalizeStoredContentItem));
          setWatchLater(normalizedWatchLater);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };

    void loadPreferences();
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);

  // Save watch later to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WATCH_LATER, JSON.stringify(watchLater));
    } catch (error) {
      console.error('Error saving watch later:', error);
    }
  }, [watchLater]);

  const addToFavorites = (movie: MovieData) => {
    setFavorites(prev => {
      const exists = prev.some(fav => matchesItem(fav, movie));
      if (exists) {
        return prev.filter(fav => !matchesItem(fav, movie));
      }
      return [...prev, movie];
    });
  };

  const removeFromFavorites = (movieId: number) => {
    setFavorites(prev => prev.filter(movie => movie.id !== movieId));
  };

  const isFavorite = (movieId: number) => {
    return favorites.some(movie => matchesId(movie, movieId));
  };

  const addToWatchLater = (movie: MovieData) => {
    setWatchLater(prev => {
      const exists = prev.some(item => matchesItem(item, movie));
      if (exists) {
        return prev.filter(item => !matchesItem(item, movie));
      }
      return [...prev, movie];
    });
  };

  const removeFromWatchLater = (movieId: number) => {
    setWatchLater(prev => prev.filter(movie => movie.id !== movieId));
  };

  const isWatchLater = (movieId: number) => {
    return watchLater.some(movie => matchesId(movie, movieId));
  };

  return (
    <UserPreferencesContext.Provider
      value={{
        favorites,
        watchLater,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        addToWatchLater,
        removeFromWatchLater,
        isWatchLater
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}
