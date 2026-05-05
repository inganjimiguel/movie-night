import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getContentStorageKey, normalizeStoredContentItem, type MovieData } from '../services/movieService';

interface UserPreferencesContextType {
  favorites: MovieData[];
  watchLater: MovieData[];
  addToFavorites: (movie: MovieData) => void;
  removeFromFavorites: (movie: MovieData | number) => void;
  isFavorite: (movie: MovieData | number) => boolean;
  addToWatchLater: (movie: MovieData) => void;
  removeFromWatchLater: (movie: MovieData | number) => void;
  isWatchLater: (movie: MovieData | number) => boolean;
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
  const matchesIdentifier = (item: MovieData, target: MovieData | number) => {
    if (typeof target === 'number') {
      return item.id === target;
    }

    return matchesItem(item, target);
  };

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

  const removeFromFavorites = (movie: MovieData | number) => {
    setFavorites(prev => prev.filter(item => !matchesIdentifier(item, movie)));
  };

  const isFavorite = (movie: MovieData | number) => {
    return favorites.some(item => matchesIdentifier(item, movie));
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

  const removeFromWatchLater = (movie: MovieData | number) => {
    setWatchLater(prev => prev.filter(item => !matchesIdentifier(item, movie)));
  };

  const isWatchLater = (movie: MovieData | number) => {
    return watchLater.some(item => matchesIdentifier(item, movie));
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
