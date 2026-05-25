import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  getContentStorageKey,
  isTvLikeContent,
  normalizeStoredContentItem,
  type MovieData,
  type VideoSource,
} from '../services/movieService';

export interface ContinueWatchingEntry {
  entryKey: string;
  item: MovieData;
  started: boolean;
  lastSource: VideoSource;
  lastOpenedAt: string;
  updatedAt: string;
  season?: number;
  episode?: number;
  isSeries: boolean;
  watchedEpisodes: Array<{
    season: number;
    episode: number;
    watchedAt: string;
  }>;
  latestWatchedSeason?: number;
  latestWatchedEpisode?: number;
  latestWatchedAt?: string;
}

interface ContinueWatchingContextType {
  entries: ContinueWatchingEntry[];
  getEntry: (movie: MovieData) => ContinueWatchingEntry | undefined;
  hasEntry: (movie: MovieData) => boolean;
  recordPlaybackStart: (
    movie: MovieData,
    options: {
      source: VideoSource;
      season?: number;
      episode?: number;
    }
  ) => void;
  touchEntry: (
    movie: MovieData,
    options: {
      source: VideoSource;
      season?: number;
      episode?: number;
      createIfMissing?: boolean;
    }
  ) => void;
  removeEntry: (movie: MovieData | string) => void;
  markAsWatched: (movie: MovieData | string) => void;
  markEpisodeWatched: (
    movie: MovieData,
    options: {
      season: number;
      episode: number;
      source: VideoSource;
      resumeSeason?: number;
      resumeEpisode?: number;
    }
  ) => void;
}

interface StoredContinueWatchingEntry {
  entryKey?: string;
  item: MovieData;
  started?: boolean;
  lastSource: VideoSource;
  lastOpenedAt?: string;
  updatedAt?: string;
  season?: number;
  episode?: number;
  watchedEpisodes?: Array<{
    season: number;
    episode: number;
    watchedAt?: string;
  }>;
  latestWatchedSeason?: number;
  latestWatchedEpisode?: number;
  latestWatchedAt?: string;
}

const ContinueWatchingContext = createContext<ContinueWatchingContextType | undefined>(undefined);

const STORAGE_KEY = 'movienight-continue-watching';

const sortEntries = (entries: ContinueWatchingEntry[]) => (
  [...entries].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
);

const toEntryKey = (movie: MovieData | string) => (
  typeof movie === 'string' ? movie : getContentStorageKey(movie)
);

const buildEntry = (
  movie: MovieData,
  options: {
    source: VideoSource;
    season?: number;
    episode?: number;
    started?: boolean;
    lastOpenedAt?: string;
    updatedAt?: string;
    watchedEpisodes?: Array<{
      season: number;
      episode: number;
      watchedAt: string;
    }>;
    latestWatchedSeason?: number;
    latestWatchedEpisode?: number;
    latestWatchedAt?: string;
  }
): ContinueWatchingEntry => {
  const isSeries = isTvLikeContent(movie);
  const normalizedSeason = isSeries ? Math.max(1, options.season ?? 1) : undefined;
  const normalizedEpisode = isSeries ? Math.max(1, options.episode ?? 1) : undefined;
  const lastOpenedAt = options.lastOpenedAt ?? new Date().toISOString();
  const watchedEpisodes = isSeries
    ? (options.watchedEpisodes ?? []).map((entry) => ({
        season: Math.max(1, entry.season),
        episode: Math.max(1, entry.episode),
        watchedAt: entry.watchedAt,
      }))
    : [];

  return {
    entryKey: getContentStorageKey(movie),
    item: movie,
    started: options.started ?? true,
    lastSource: options.source,
    lastOpenedAt,
    updatedAt: options.updatedAt ?? lastOpenedAt,
    season: normalizedSeason,
    episode: normalizedEpisode,
    isSeries,
    watchedEpisodes,
    latestWatchedSeason: isSeries ? options.latestWatchedSeason : undefined,
    latestWatchedEpisode: isSeries ? options.latestWatchedEpisode : undefined,
    latestWatchedAt: isSeries ? options.latestWatchedAt : undefined,
  };
};

const upsertEntry = (entries: ContinueWatchingEntry[], nextEntry: ContinueWatchingEntry) => {
  const filteredEntries = entries.filter((entry) => entry.entryKey !== nextEntry.entryKey);
  return sortEntries([nextEntry, ...filteredEntries]);
};

export function ContinueWatchingProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<ContinueWatchingEntry[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const loadEntries = async () => {
      try {
        const rawEntries = localStorage.getItem(STORAGE_KEY);
        if (!rawEntries) {
          setHasLoaded(true);
          return;
        }

        const parsedEntries: StoredContinueWatchingEntry[] = JSON.parse(rawEntries);
        const normalizedEntries = await Promise.all(
          parsedEntries.map(async (entry) => {
            const normalizedItem = await normalizeStoredContentItem(entry.item);
            return buildEntry(normalizedItem, {
              source: entry.lastSource,
              season: entry.season,
              episode: entry.episode,
              started: entry.started ?? true,
              lastOpenedAt: entry.lastOpenedAt,
              updatedAt: entry.updatedAt,
              watchedEpisodes: (entry.watchedEpisodes ?? []).map((watchedEpisode) => ({
                season: watchedEpisode.season,
                episode: watchedEpisode.episode,
                watchedAt: watchedEpisode.watchedAt ?? entry.updatedAt ?? entry.lastOpenedAt ?? new Date().toISOString(),
              })),
              latestWatchedSeason: entry.latestWatchedSeason,
              latestWatchedEpisode: entry.latestWatchedEpisode,
              latestWatchedAt: entry.latestWatchedAt,
            });
          })
        );

        setEntries(sortEntries(normalizedEntries));
      } catch (error) {
        console.error('Error loading continue watching entries:', error);
      } finally {
        setHasLoaded(true);
      }
    };

    void loadEntries();
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
          entries.map((entry) => ({
            entryKey: entry.entryKey,
            item: entry.item,
            started: entry.started,
            lastSource: entry.lastSource,
            lastOpenedAt: entry.lastOpenedAt,
            updatedAt: entry.updatedAt,
            season: entry.season,
            episode: entry.episode,
            watchedEpisodes: entry.watchedEpisodes,
            latestWatchedSeason: entry.latestWatchedSeason,
            latestWatchedEpisode: entry.latestWatchedEpisode,
            latestWatchedAt: entry.latestWatchedAt,
          }))
        )
      );
    } catch (error) {
      console.error('Error saving continue watching entries:', error);
    }
  }, [entries, hasLoaded]);

  const getEntry = (movie: MovieData) => {
    const entryKey = getContentStorageKey(movie);
    return entries.find((entry) => entry.entryKey === entryKey);
  };

  const hasEntry = (movie: MovieData) => entries.some((entry) => entry.entryKey === getContentStorageKey(movie));

  const recordPlaybackStart: ContinueWatchingContextType['recordPlaybackStart'] = (movie, options) => {
    const now = new Date().toISOString();
    setEntries((previous) => upsertEntry(previous, buildEntry(movie, {
      source: options.source,
      season: options.season,
      episode: options.episode,
      started: true,
      lastOpenedAt: now,
      updatedAt: now,
      watchedEpisodes: [],
    })));
  };

  const touchEntry: ContinueWatchingContextType['touchEntry'] = (movie, options) => {
    const now = new Date().toISOString();
    const entryKey = getContentStorageKey(movie);

    setEntries((previous) => {
      const existingEntry = previous.find((entry) => entry.entryKey === entryKey);
      if (!existingEntry && !options.createIfMissing) {
        return previous;
      }

      const nextEntry = buildEntry(movie, {
        source: options.source ?? existingEntry?.lastSource ?? 'vidlinkPro',
        season: options.season ?? existingEntry?.season,
        episode: options.episode ?? existingEntry?.episode,
        started: existingEntry?.started ?? true,
        lastOpenedAt: now,
        updatedAt: now,
        watchedEpisodes: existingEntry?.watchedEpisodes ?? [],
        latestWatchedSeason: existingEntry?.latestWatchedSeason,
        latestWatchedEpisode: existingEntry?.latestWatchedEpisode,
        latestWatchedAt: existingEntry?.latestWatchedAt,
      });

      return upsertEntry(previous, nextEntry);
    });
  };

  const markEpisodeWatched: ContinueWatchingContextType['markEpisodeWatched'] = (movie, options) => {
    const now = new Date().toISOString();
    const entryKey = getContentStorageKey(movie);

    setEntries((previous) => {
      const existingEntry = previous.find((entry) => entry.entryKey === entryKey);
      const watchedEpisodes = [
        ...(existingEntry?.watchedEpisodes ?? []).filter(
          (entry) => !(entry.season === options.season && entry.episode === options.episode)
        ),
        {
          season: Math.max(1, options.season),
          episode: Math.max(1, options.episode),
          watchedAt: now,
        },
      ].sort((a, b) => {
        if (a.season !== b.season) {
          return a.season - b.season;
        }

        return a.episode - b.episode;
      });

      const nextEntry = buildEntry(movie, {
        source: options.source ?? existingEntry?.lastSource ?? 'vidlinkPro',
        season: options.resumeSeason ?? existingEntry?.season ?? options.season,
        episode: options.resumeEpisode ?? existingEntry?.episode ?? options.episode,
        started: true,
        lastOpenedAt: now,
        updatedAt: now,
        watchedEpisodes,
        latestWatchedSeason: Math.max(1, options.season),
        latestWatchedEpisode: Math.max(1, options.episode),
        latestWatchedAt: now,
      });

      return upsertEntry(previous, nextEntry);
    });
  };

  const removeEntry = (movie: MovieData | string) => {
    const entryKey = toEntryKey(movie);
    setEntries((previous) => previous.filter((entry) => entry.entryKey !== entryKey));
  };

  const markAsWatched = (movie: MovieData | string) => {
    removeEntry(movie);
  };

  return (
    <ContinueWatchingContext.Provider
      value={{
        entries,
        getEntry,
        hasEntry,
        recordPlaybackStart,
        touchEntry,
        removeEntry,
        markAsWatched,
        markEpisodeWatched,
      }}
    >
      {children}
    </ContinueWatchingContext.Provider>
  );
}

export function useContinueWatching() {
  const context = useContext(ContinueWatchingContext);
  if (!context) {
    throw new Error('useContinueWatching must be used within a ContinueWatchingProvider');
  }

  return context;
}
