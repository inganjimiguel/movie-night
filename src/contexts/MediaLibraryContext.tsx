import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getContentStorageKey, normalizeStoredContentItem, type MovieData } from '../services/movieService';

interface MediaLibraryContextType {
  likedItems: MovieData[];
  queuedItems: MovieData[];
  toggleLikedItem: (movie: MovieData) => void;
  removeLikedItem: (movie: MovieData | number) => void;
  hasLikedItem: (movie: MovieData | number) => boolean;
  toggleQueuedItem: (movie: MovieData) => void;
  removeQueuedItem: (movie: MovieData | number) => void;
  hasQueuedItem: (movie: MovieData | number) => boolean;
}

const MediaLibraryContext = createContext<MediaLibraryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  LIKED: 'movienight-library-liked',
  QUEUED: 'movienight-library-queued',
};

const matchesItem = (item: MovieData, target: MovieData) => getContentStorageKey(item) === getContentStorageKey(target);

const matchesIdentifier = (item: MovieData, target: MovieData | number) => {
  if (typeof target === 'number') {
    return item.id === target;
  }

  return matchesItem(item, target);
};

export function MediaLibraryProvider({ children }: { children: ReactNode }) {
  const [likedItems, setLikedItems] = useState<MovieData[]>([]);
  const [queuedItems, setQueuedItems] = useState<MovieData[]>([]);

  useEffect(() => {
    const loadLibrary = async () => {
      try {
        const rawLiked = localStorage.getItem(STORAGE_KEYS.LIKED);
        const rawQueued = localStorage.getItem(STORAGE_KEYS.QUEUED);

        if (rawLiked) {
          const parsedLiked: MovieData[] = JSON.parse(rawLiked);
          const normalizedLiked = await Promise.all(parsedLiked.map(normalizeStoredContentItem));
          setLikedItems(normalizedLiked);
        }

        if (rawQueued) {
          const parsedQueued: MovieData[] = JSON.parse(rawQueued);
          const normalizedQueued = await Promise.all(parsedQueued.map(normalizeStoredContentItem));
          setQueuedItems(normalizedQueued);
        }
      } catch (error) {
        console.error('Error loading media library:', error);
      }
    };

    void loadLibrary();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LIKED, JSON.stringify(likedItems));
    } catch (error) {
      console.error('Error saving liked items:', error);
    }
  }, [likedItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUEUED, JSON.stringify(queuedItems));
    } catch (error) {
      console.error('Error saving queued items:', error);
    }
  }, [queuedItems]);

  const toggleLikedItem = (movie: MovieData) => {
    setLikedItems((previous) => {
      const exists = previous.some((item) => matchesItem(item, movie));
      if (exists) {
        return previous.filter((item) => !matchesItem(item, movie));
      }

      return [...previous, movie];
    });
  };

  const removeLikedItem = (movie: MovieData | number) => {
    setLikedItems((previous) => previous.filter((item) => !matchesIdentifier(item, movie)));
  };

  const hasLikedItem = (movie: MovieData | number) => likedItems.some((item) => matchesIdentifier(item, movie));

  const toggleQueuedItem = (movie: MovieData) => {
    setQueuedItems((previous) => {
      const exists = previous.some((item) => matchesItem(item, movie));
      if (exists) {
        return previous.filter((item) => !matchesItem(item, movie));
      }

      return [...previous, movie];
    });
  };

  const removeQueuedItem = (movie: MovieData | number) => {
    setQueuedItems((previous) => previous.filter((item) => !matchesIdentifier(item, movie)));
  };

  const hasQueuedItem = (movie: MovieData | number) => queuedItems.some((item) => matchesIdentifier(item, movie));

  return (
    <MediaLibraryContext.Provider
      value={{
        likedItems,
        queuedItems,
        toggleLikedItem,
        removeLikedItem,
        hasLikedItem,
        toggleQueuedItem,
        removeQueuedItem,
        hasQueuedItem,
      }}
    >
      {children}
    </MediaLibraryContext.Provider>
  );
}

export function useMediaLibrary() {
  const context = useContext(MediaLibraryContext);
  if (!context) {
    throw new Error('useMediaLibrary must be used within a MediaLibraryProvider');
  }

  return context;
}
