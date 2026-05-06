/// <reference types="vite/client" />
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TWO_EMBED_API_BASE_URL = 'https://api.2embed.cc';
// User provided credentials for the demo
const FALLBACK_API_KEY = "8cb4712984e3c0d68f880b04c4d4f278";
const FALLBACK_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4Y2I0NzEyOTg0ZTNjMGQ2OGY4ODBiMDRjNGQ0ZjI3OCIsIm5iZiI6MTc3NjkzNDY1Ni4xNzgsInN1YiI6IjY5ZTlkZjAwZjY0NjE2ZGNmZmJiMWNjNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kwHMCXgkOcz8pjX-sdIvrPB9D_7vWIYvoND0RvByB1A";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || FALLBACK_API_KEY;
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN || FALLBACK_TOKEN;

export interface MovieData {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  popularity?: number;
  viewCount?: number;
  genre_ids: number[];
  media_type?: 'movie' | 'tv' | 'animation';
  imdb_id?: string;
  /** Present for TV results (TMDB uses `name` instead of `title`). */
  name?: string;
  /** Present for TV results (TMDB uses `first_air_date` instead of `release_date`). */
  first_air_date?: string;
}

export interface TVShowData {
  id: number;
  title: string;
  name: string;
  imdb_id?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  first_air_date: string;
  vote_average: number;
  popularity?: number;
  viewCount?: number;
  genre_ids: number[];
  media_type: 'tv';
}

export interface AnimationData {
  id: number;
  title: string;
  name?: string;
  imdb_id?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  first_air_date?: string;
  vote_average: number;
  popularity?: number;
  viewCount?: number;
  genre_ids: number[];
  media_type: 'movie' | 'tv' | 'animation';
}

export type ContentData = MovieData | TVShowData | AnimationData;

interface MovieVideoResult {
  key: string;
  name: string;
  official: boolean;
  site: string;
  type: string;
  iso_639_1?: string;
  published_at?: string;
}

interface TmdbExternalIdsResponse {
  imdb_id?: string | null;
}

interface TwoEmbedMoviePayload {
  title?: string;
  original_title?: string;
  year?: string;
  imdb_id?: string;
  tmdb_id?: number;
  release_date?: string;
  overview?: string;
  poster?: string;
  backdrops?: string[];
  vote_average?: number;
}

interface TwoEmbedTvPayload {
  name?: string;
  original_name?: string;
  tmdb_id?: number;
  imdb_id?: string;
  first_air_date?: string;
  overview?: string;
  poster?: string;
  backdrops?: string[];
  vote_average?: number;
  seasons?: Array<{
    season_number?: number;
    name?: string;
    air_date?: string;
    episode_count?: number;
    poster?: string;
  }>;
}

interface TwoEmbedSeasonPayload {
  tmdb_id?: number;
  season_number?: number;
  name?: string;
  overview?: string;
  episodes?: Array<{
    episode_number?: number;
    name?: string;
    overview?: string;
    air_date?: string;
    still?: string | null;
  }>;
}

interface TwoEmbedSearchMovieResult {
  title?: string;
  year?: string;
  release_date?: string;
  tmdb_id?: number;
  imdb_id?: string | null;
  genres?: string[];
  plot?: string;
  vote_average?: number;
  vote_count?: number;
  poster?: string | null;
  backdrops?: string[];
}

interface TwoEmbedSearchTvResult {
  name?: string;
  first_air_year?: string;
  first_air_date?: string;
  tmdb_id?: number;
  imdb_id?: string | null;
  genres?: string[];
  overview?: string;
  vote_average?: number;
  vote_count?: number;
  poster?: string | null;
  backdrops?: string[];
}

interface TwoEmbedSearchResponse<T> {
  results?: T[];
}

export interface TrailerData {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  videos: MovieVideoResult[];
}

export type VideoSource = 'vidlinkPro' | 'twoEmbed' | 'superembedStream' | 'autoembedCc' | 'godriveplayer' | 'vidsrcTo' | 'vsembedSu' | 'sflix';
export const DEFAULT_VIDEO_SOURCE = (import.meta.env.VITE_DEFAULT_VIDEO_SOURCE || 'vidlinkPro') as VideoSource;
export const VIDEO_SOURCE_OPTIONS: Array<{
  id: VideoSource;
  name: string;
  baseUrl: string;
}> = [
  { id: 'vidlinkPro', name: 'vidlink.pro', baseUrl: 'https://vidlink.pro' },
  { id: 'twoEmbed', name: '2embed.cc', baseUrl: 'https://www.2embed.cc' },
  { id: 'superembedStream', name: 'superembed.stream', baseUrl: 'https://multiembed.mov' },
  { id: 'autoembedCc', name: 'autoembed.cc', baseUrl: 'https://autoembed.cc' },
  { id: 'godriveplayer', name: 'godriveplayer.com', baseUrl: 'https://godriveplayer.com' },
  { id: 'vsembedSu', name: 'vsembed.su', baseUrl: 'https://vidsrc-embed.su' },
  { id: 'vidsrcTo', name: 'vidsrc.to', baseUrl: 'https://vidsrc.to' },
  { id: 'sflix', name: 'sflix.to', baseUrl: 'https://sflix.to' },
];
const trailerUrlCache = new Map<string, Promise<string | null>>();
const imdbIdCache = new Map<string, Promise<string | null>>();
const twoEmbedMovieCache = new Map<string, Promise<TwoEmbedMoviePayload | null>>();
const twoEmbedTvCache = new Map<string, Promise<TwoEmbedTvPayload | null>>();
const twoEmbedSeasonCache = new Map<string, Promise<TwoEmbedSeasonPayload | null>>();

const getVideoSourceBaseUrl = (source: VideoSource) => {
  return VIDEO_SOURCE_OPTIONS.find((option) => option.id === source)?.baseUrl ?? VIDEO_SOURCE_OPTIONS[0].baseUrl;
};

const isAbsoluteUrl = (value?: string | null): value is string => Boolean(value && /^https?:\/\//i.test(value));

const toPosterPath = (value?: string | null): string => {
  if (!value) return '';
  if (value.startsWith('/')) return value;

  const tmdbMarker = '/t/p/';
  const markerIndex = value.indexOf(tmdbMarker);
  if (markerIndex >= 0) {
    const relativePath = value.slice(markerIndex + tmdbMarker.length).replace(/^original/, '').replace(/^w\d+/, '');
    return relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  }

  return value;
};

const normalizeGenreIds = (genres: unknown): number[] => {
  if (!Array.isArray(genres)) return [];

  return genres
    .map((genre) => {
      if (typeof genre === 'number') return genre;
      if (genre && typeof genre === 'object' && 'id' in genre && typeof (genre as { id?: unknown }).id === 'number') {
        return (genre as { id: number }).id;
      }
      return null;
    })
    .filter((genreId): genreId is number => genreId !== null);
};

export const getVideoSourceName = (source: VideoSource): string => {
  return VIDEO_SOURCE_OPTIONS.find((option) => option.id === source)?.name ?? source;
};

export const isTvLikeContent = (item: Pick<MovieData, 'media_type' | 'genre_ids' | 'name' | 'title' | 'first_air_date'>): boolean => {
  if (item.media_type === 'tv') return true;
  // Animated TV should still use the TV embed path even when we normalize it under the animation category.
  if (item.media_type === 'animation' && item.genre_ids?.includes(16) && item.name && item.first_air_date) return true;
  return false;
};

export const isAnimationContent = (item: Pick<MovieData, 'genre_ids'>): boolean => {
  return item.genre_ids?.includes(16) ?? false;
};

const getRankingSignal = (item: Pick<MovieData, 'popularity' | 'viewCount' | 'vote_average'>) => {
  return item.viewCount || item.popularity || item.vote_average || 0;
};

export const getContentTitle = (item: Pick<MovieData, 'title' | 'name'>): string => {
  return item.title || item.name || 'Untitled';
};

export const getContentReleaseDate = (item: Pick<MovieData, 'release_date' | 'first_air_date'>): string => {
  return item.release_date || item.first_air_date || '';
};

export const getContentYear = (item: Pick<MovieData, 'release_date' | 'first_air_date'>): string => {
  const date = getContentReleaseDate(item);
  return date ? date.split('-')[0] : 'N/A';
};

export const getContentTypeLabel = (item: Pick<MovieData, 'media_type' | 'genre_ids' | 'name' | 'title'>): 'Movie' | 'TV Show' | 'Animation' => {
  if (isAnimationContent(item)) return 'Animation';
  if (isTvLikeContent(item)) return 'TV Show';
  return 'Movie';
};

export const getContentStorageKey = (item: Pick<MovieData, 'id' | 'media_type' | 'genre_ids' | 'name' | 'title'>): string => {
  return `${getContentTypeLabel(item).toLowerCase().replace(/\s+/g, '-')}:${item.id}`;
};

const dedupeContent = <T extends ContentData>(items: T[]): T[] => {
  return items.filter((item, index, collection) => (
    collection.findIndex((candidate) => getContentStorageKey(candidate) === getContentStorageKey(item)) === index
  ));
};

export const sortContentByPerformance = <T extends ContentData>(items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const rankingDelta = getRankingSignal(b) - getRankingSignal(a);
    if (rankingDelta !== 0) {
      return rankingDelta;
    }

    const popularityDelta = (b.popularity || 0) - (a.popularity || 0);
    if (popularityDelta !== 0) {
      return popularityDelta;
    }

    return (b.vote_average || 0) - (a.vote_average || 0);
  });
};

const normalizeMovieResult = (movie: any, mediaType: 'movie' | 'animation' = 'movie'): ContentData => ({
  ...movie,
  media_type: mediaType,
  title: movie.title || movie.name || 'Untitled',
  release_date: movie.release_date || movie.first_air_date || '',
  genre_ids: movie.genre_ids || [],
  popularity: movie.popularity || 0,
  viewCount: movie.viewCount || movie.vote_count || 0,
});

const normalizeTvResult = (show: any, mediaType: 'tv' | 'animation' = 'tv'): ContentData => ({
  ...show,
  title: show.name || show.title || 'Untitled',
  name: show.name || show.title || 'Untitled',
  release_date: show.first_air_date || show.release_date || '',
  first_air_date: show.first_air_date || show.release_date || '',
  genre_ids: show.genre_ids || [],
  media_type: mediaType,
  popularity: show.popularity || 0,
  viewCount: show.viewCount || show.vote_count || 0,
});

const buildImdbCacheKey = (tmdbId: number, mediaType: 'movie' | 'tv') => `${mediaType}:${tmdbId}`;

const getTmdbExternalIds = async (tmdbId: number, mediaType: 'movie' | 'tv'): Promise<string | null> => {
  const cacheKey = buildImdbCacheKey(tmdbId, mediaType);
  const cached = imdbIdCache.get(cacheKey);
  if (cached) return cached;

  const externalIdsPromise = (async () => {
    try {
      const res = await fetch(`${TMDB_BASE_URL}/${mediaType}/${tmdbId}/external_ids`, {
        headers: getHeaders()
      });
      if (!res.ok) {
        return null;
      }

      const data: TmdbExternalIdsResponse = await res.json();
      return data.imdb_id ?? null;
    } catch (error) {
      console.error(`TMDB external IDs fetch error for ${mediaType} ${tmdbId}:`, error);
      return null;
    }
  })();

  imdbIdCache.set(cacheKey, externalIdsPromise);
  return externalIdsPromise;
};

const fetchTwoEmbedMovieByImdbId = async (imdbId: string): Promise<TwoEmbedMoviePayload | null> => {
  const cached = twoEmbedMovieCache.get(imdbId);
  if (cached) return cached;

  const request = (async () => {
    try {
      const res = await fetch(`${TWO_EMBED_API_BASE_URL}/movie?imdb_id=${encodeURIComponent(imdbId)}`);
      if (!res.ok) return null;
      return await res.json() as TwoEmbedMoviePayload;
    } catch (error) {
      console.error(`2embed movie metadata fetch error for ${imdbId}:`, error);
      return null;
    }
  })();

  twoEmbedMovieCache.set(imdbId, request);
  return request;
};

const fetchTwoEmbedTvByImdbId = async (imdbId: string): Promise<TwoEmbedTvPayload | null> => {
  const cached = twoEmbedTvCache.get(imdbId);
  if (cached) return cached;

  const request = (async () => {
    try {
      const res = await fetch(`${TWO_EMBED_API_BASE_URL}/tv?imdb_id=${encodeURIComponent(imdbId)}`);
      if (!res.ok) return null;
      return await res.json() as TwoEmbedTvPayload;
    } catch (error) {
      console.error(`2embed TV metadata fetch error for ${imdbId}:`, error);
      return null;
    }
  })();

  twoEmbedTvCache.set(imdbId, request);
  return request;
};

const fetchTwoEmbedSeasonByImdbId = async (imdbId: string, season: number): Promise<TwoEmbedSeasonPayload | null> => {
  const cacheKey = `${imdbId}:season:${season}`;
  const cached = twoEmbedSeasonCache.get(cacheKey);
  if (cached) return cached;

  const request = (async () => {
    try {
      const res = await fetch(`${TWO_EMBED_API_BASE_URL}/season?imdb_id=${encodeURIComponent(imdbId)}&season=${season}`);
      if (!res.ok) return null;
      return await res.json() as TwoEmbedSeasonPayload;
    } catch (error) {
      console.error(`2embed season metadata fetch error for ${imdbId} season ${season}:`, error);
      return null;
    }
  })();

  twoEmbedSeasonCache.set(cacheKey, request);
  return request;
};

const mergeCanonicalMovieMetadata = (
  item: MovieData,
  metadata: TwoEmbedMoviePayload | null,
  mediaType: 'movie' | 'animation' = 'movie'
): MovieData => {
  if (!metadata) {
    return {
      ...item,
      media_type: mediaType,
    };
  }

  return {
    ...item,
    media_type: mediaType,
    imdb_id: item.imdb_id || metadata.imdb_id,
    title: item.title || metadata.title || metadata.original_title || 'Untitled',
    overview: item.overview || metadata.overview || '',
    poster_path: item.poster_path || toPosterPath(metadata.poster) || '',
    backdrop_path: item.backdrop_path || toPosterPath(metadata.backdrops?.[0]) || '',
    release_date: item.release_date || metadata.release_date || '',
    vote_average: item.vote_average || metadata.vote_average || 0,
  };
};

const mergeCanonicalTvMetadata = (
  item: MovieData,
  metadata: TwoEmbedTvPayload | null,
  mediaType: 'tv' | 'animation' = 'tv'
): MovieData => {
  if (!metadata) {
    return {
      ...item,
      media_type: mediaType,
    };
  }

  const canonicalName = item.name || item.title || metadata.name || metadata.original_name || 'Untitled';

  return {
    ...item,
    media_type: mediaType,
    imdb_id: item.imdb_id || metadata.imdb_id,
    title: canonicalName,
    name: canonicalName,
    overview: item.overview || metadata.overview || '',
    poster_path: item.poster_path || toPosterPath(metadata.poster) || '',
    backdrop_path: item.backdrop_path || toPosterPath(metadata.backdrops?.[0]) || '',
    release_date: item.release_date || item.first_air_date || metadata.first_air_date || '',
    first_air_date: item.first_air_date || item.release_date || metadata.first_air_date || '',
    vote_average: item.vote_average || metadata.vote_average || 0,
  };
};

const enrichMovieWithTwoEmbed = async (item: MovieData, mediaType: 'movie' | 'animation' = 'movie'): Promise<MovieData> => {
  const imdbId = item.imdb_id || await getTmdbExternalIds(item.id, 'movie');
  const metadata = imdbId ? await fetchTwoEmbedMovieByImdbId(imdbId) : null;

  return mergeCanonicalMovieMetadata({
    ...item,
    imdb_id: imdbId || item.imdb_id,
  }, metadata, mediaType);
};

const enrichTvWithTwoEmbed = async (item: MovieData, mediaType: 'tv' | 'animation' = 'tv'): Promise<MovieData> => {
  const imdbId = item.imdb_id || await getTmdbExternalIds(item.id, 'tv');
  const metadata = imdbId ? await fetchTwoEmbedTvByImdbId(imdbId) : null;

  return mergeCanonicalTvMetadata({
    ...item,
    imdb_id: imdbId || item.imdb_id,
  }, metadata, mediaType);
};

const enrichCatalogItems = async <T extends MovieData>(items: T[]): Promise<T[]> => {
  return Promise.all(items.map(async (item) => {
    if (isTvLikeContent(item)) {
      return await enrichTvWithTwoEmbed(item, item.media_type === 'animation' ? 'animation' : 'tv') as T;
    }

    return await enrichMovieWithTwoEmbed(item, item.media_type === 'animation' ? 'animation' : 'movie') as T;
  }));
};

export const hydrateContentForDetails = async (item: MovieData): Promise<MovieData> => {
  if (isTvLikeContent(item)) {
    return await enrichTvWithTwoEmbed(item, item.media_type === 'animation' ? 'animation' : 'tv');
  }

  return await enrichMovieWithTwoEmbed(item, item.media_type === 'animation' ? 'animation' : 'movie');
};

const normalizeTwoEmbedMovieSearchResult = (item: TwoEmbedSearchMovieResult): MovieData => {
  const genreIds = mapGenreNamesToIds(item.genres);
  const mediaType: 'movie' | 'animation' = genreIds.includes(16) ? 'animation' : 'movie';

  return {
    id: item.tmdb_id ?? 0,
    imdb_id: item.imdb_id ?? undefined,
    title: item.title || 'Untitled',
    overview: item.plot || '',
    poster_path: toPosterPath(item.poster) || '',
    backdrop_path: toPosterPath(item.backdrops?.[0]) || '',
    release_date: item.release_date || (item.year ? `${item.year}-01-01` : ''),
    vote_average: item.vote_average || 0,
    viewCount: item.vote_count || 0,
    popularity: item.vote_count || item.vote_average || 0,
    genre_ids: genreIds,
    media_type: mediaType,
  };
};

const normalizeTwoEmbedTvSearchResult = (item: TwoEmbedSearchTvResult): MovieData => {
  const genreIds = mapGenreNamesToIds(item.genres);
  const isAnimation = genreIds.includes(16);
  const canonicalName = item.name || 'Untitled';

  return {
    id: item.tmdb_id ?? 0,
    imdb_id: item.imdb_id ?? undefined,
    title: canonicalName,
    name: canonicalName,
    overview: item.overview || '',
    poster_path: toPosterPath(item.poster) || '',
    backdrop_path: toPosterPath(item.backdrops?.[0]) || '',
    release_date: item.first_air_date || (item.first_air_year ? `${item.first_air_year}-01-01` : ''),
    first_air_date: item.first_air_date || (item.first_air_year ? `${item.first_air_year}-01-01` : ''),
    vote_average: item.vote_average || 0,
    viewCount: item.vote_count || 0,
    popularity: item.vote_count || item.vote_average || 0,
    genre_ids: genreIds,
    media_type: isAnimation ? 'animation' : 'tv',
  };
};

const getSearchableTitle = (item: Pick<MovieData, 'title' | 'name'>) => getContentTitle(item).toLowerCase().trim();

const computeSearchRelevance = (item: MovieData, query: string): number => {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedTitle = getSearchableTitle(item);
  const normalizedWords = normalizedQuery.split(/\s+/).filter(Boolean);
  const titleWords = normalizedTitle.split(/\s+/).filter(Boolean);

  let score = 0;

  if (normalizedTitle === normalizedQuery) score += 10000;
  if (normalizedTitle.startsWith(normalizedQuery)) score += 4000;
  if (normalizedTitle.includes(normalizedQuery)) score += 2000;

  score += normalizedWords.reduce((sum, word) => {
    if (normalizedTitle === word) return sum + 1200;
    if (normalizedTitle.startsWith(word)) return sum + 700;
    if (titleWords.includes(word)) return sum + 450;
    if (normalizedTitle.includes(word)) return sum + 250;
    return sum;
  }, 0);

  score += Math.round((item.vote_average || 0) * 40);
  score += Math.min(item.viewCount || 0, 50000) / 20;
  score += Math.min(item.popularity || 0, 10000) / 20;

  if (item.release_date || item.first_air_date) score += 25;
  if (item.poster_path) score += 10;

  return score;
};

export const getVideoUrl = (
  id: number,
  mediaType: 'movie' | 'tv' | 'animation' = 'movie',
  season?: number,
  episode?: number,
  source: VideoSource = DEFAULT_VIDEO_SOURCE
): string => {
  const params = new URLSearchParams({ autoplay: '1' });
  const baseUrl = getVideoSourceBaseUrl(source);
  const isTv = mediaType === 'tv';

  switch (source) {
    case 'vsembedSu': {
      if (isTv) {
        params.set('tmdb', String(id));
        if (season) params.set('season', String(season));
        if (episode) params.set('episode', String(episode));
        params.set('autonext', '1');
        return `${baseUrl}/embed/tv?${params.toString()}`;
      }
      params.set('tmdb', String(id));
      return `${baseUrl}/embed/movie?${params.toString()}`;
    }

    case 'vidlinkPro': {
      if (isTv) {
        const se = season && episode ? `/${season}/${episode}` : '';
        return `${baseUrl}/tv/${id}${se}?${params.toString()}`;
      }
      return `${baseUrl}/movie/${id}?${params.toString()}`;
    }

    case 'twoEmbed': {
      if (isTv) {
        const seasonNumber = season ?? 1;
        const episodeNumber = episode ?? 1;
        return `${baseUrl}/embedtv/${id}&s=${seasonNumber}&e=${episodeNumber}`;
      }
      return `${baseUrl}/embed/${id}`;
    }

    case 'autoembedCc': {
      if (isTv) {
        const se = season && episode ? `/${id}/${season}/${episode}` : `/${id}`;
        return `${baseUrl}/tv${se}?${params.toString()}`;
      }
      return `${baseUrl}/movie/${id}?${params.toString()}`;
    }

    case 'superembedStream': {
      params.set('video_id', String(id));
      params.set('tmdb', '1');
      if (isTv && season) params.set('s', String(season));
      if (isTv && episode) params.set('e', String(episode));
      return `${baseUrl}/?${params.toString()}`;
    }

    case 'godriveplayer': {
      params.set('tmdb', String(id));
      if (isTv && season) params.set('season', String(season));
      if (isTv && episode) params.set('episode', String(episode));
      return `${baseUrl}/player.php?${params.toString()}`;
    }

    case 'sflix': {
      if (isTv) {
        const se = season && episode ? `/${season}/${episode}` : '';
        return `${baseUrl}/embed/tv/${id}${se}?${params.toString()}`;
      }
      return `${baseUrl}/embed/movie/${id}?${params.toString()}`;
    }

    // vidsrcTo (and any future path-style sources)
    default: {
      if (isTv) {
        if (season && episode) {
          return `${baseUrl}/embed/tv/${id}/${season}/${episode}?${params.toString()}`;
        }
        return `${baseUrl}/embed/tv/${id}?${params.toString()}`;
      }
      return `${baseUrl}/embed/movie/${id}?${params.toString()}`;
    }
  }
};

export const getVidsrcUrl = (
  item: Pick<MovieData, 'id' | 'media_type' | 'genre_ids' | 'name' | 'title' | 'first_air_date'>,
  season = 1,
  episode = 1,
  source: VideoSource = DEFAULT_VIDEO_SOURCE
): string => {
  const mediaType: 'movie' | 'tv' = isTvLikeContent(item) ? 'tv' : 'movie';
  if (mediaType === 'tv') {
    return getVideoUrl(item.id, 'tv', season, episode, source);
  }
  return getVideoUrl(item.id, 'movie', undefined, undefined, source);
};

const getTmdbVideoPath = (item: Pick<MovieData, 'id' | 'media_type' | 'genre_ids' | 'name' | 'title'>): string => {
  return isTvLikeContent(item) ? `/tv/${item.id}/videos` : `/movie/${item.id}/videos`;
};

export interface TvSeasonSummary {
  season_number: number;
  episode_count: number;
  name?: string;
}

export interface TvShowDetails {
  id: number;
  number_of_seasons: number;
  seasons: TvSeasonSummary[];
}

export interface TvEpisodeDetails {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date?: string;
  episode_number: number;
  season_number: number;
}

export const getTvShowDetails = async (tvId: number): Promise<TvShowDetails | null> => {
  try {
    const imdbId = await getTmdbExternalIds(tvId, 'tv');
    if (imdbId) {
      const data = await fetchTwoEmbedTvByImdbId(imdbId);
      if (data) {
        return {
          id: data.tmdb_id ?? tvId,
          number_of_seasons: data.seasons?.length ?? 0,
          seasons: (data.seasons ?? []).map((season) => ({
            season_number: season.season_number ?? 0,
            episode_count: season.episode_count ?? 0,
            name: season.name
          }))
        };
      }
    }

    const res = await fetch(`${TMDB_BASE_URL}/tv/${tvId}`, {headers: getHeaders()});
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      number_of_seasons: data.number_of_seasons ?? 0,
      seasons: (data.seasons ?? []).map((s: any) => ({
        season_number: s.season_number,
        episode_count: s.episode_count,
        name: s.name
      }))
    };
  } catch (err) {
    console.error('TMDB TV Details Fetch Error:', err);
    return null;
  }
};

export const getTvEpisodeDetails = async (
  tvId: number,
  seasonNumber: number,
  episodeNumber: number
): Promise<TvEpisodeDetails | null> => {
  try {
    const imdbId = await getTmdbExternalIds(tvId, 'tv');
    if (imdbId) {
      const seasonData = await fetchTwoEmbedSeasonByImdbId(imdbId, seasonNumber);
      const episode = seasonData?.episodes?.find((entry) => entry.episode_number === episodeNumber);

      if (episode) {
        return {
          id: tvId * 10000 + (seasonNumber * 100) + episodeNumber,
          name: episode.name ?? `Episode ${episodeNumber}`,
          overview: episode.overview ?? seasonData?.overview ?? '',
          still_path: episode.still ?? null,
          air_date: episode.air_date,
          episode_number: episode.episode_number ?? episodeNumber,
          season_number: seasonData?.season_number ?? seasonNumber
        };
      }
    }

    const res = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, {
      headers: getHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      name: data.name ?? `Episode ${episodeNumber}`,
      overview: data.overview ?? '',
      still_path: data.still_path ?? null,
      air_date: data.air_date,
      episode_number: data.episode_number ?? episodeNumber,
      season_number: data.season_number ?? seasonNumber
    };
  } catch (err) {
    console.error('TMDB TV Episode Fetch Error:', err);
    return null;
  }
};

const getHeaders = () => ({
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
});

const buildTrailerCacheKey = (item: number | Pick<MovieData, 'id' | 'media_type' | 'genre_ids' | 'name' | 'title'>) => {
  if (typeof item === 'number') return `movie:${item}`;
  return `${isTvLikeContent(item) ? 'tv' : 'movie'}:${item.id}`;
};

const scoreTrailerVideo = (video: MovieVideoResult): number => {
  const normalizedName = video.name.toLowerCase();
  let score = 0;

  if (video.site === 'YouTube') score += 100;
  if (video.type === 'Trailer') score += 40;
  if (video.type === 'Teaser') score += 20;
  if (video.official) score += 20;
  if (video.iso_639_1 === 'en' || video.iso_639_1 === null) score += 10;
  if (normalizedName.includes('official')) score += 8;
  if (normalizedName.includes('main')) score += 6;
  if (normalizedName.includes('final')) score += 4;

  return score;
};

const selectBestTrailerVideo = (videos: MovieVideoResult[]): MovieVideoResult | null => {
  const candidates = videos
    .filter((video) => video.site === 'YouTube' && Boolean(video.key) && ['Trailer', 'Teaser'].includes(video.type))
    .sort((a, b) => scoreTrailerVideo(b) - scoreTrailerVideo(a));

  return candidates[0] ?? null;
};

const toYoutubeEmbedUrl = (videoKey: string) => {
  return `https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`;
};

export const getTrendingMovies = async (): Promise<MovieData[]> => {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/movie/day`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return data.results?.map((movie: any) => normalizeMovieResult(movie, 'movie')) || getFallbackMovies();
  } catch (err) {
    console.error('TMDB Fetch Error:', err);
    return getFallbackMovies();
  }
};

export const getNewReleaseMovies = async (): Promise<MovieData[]> => {
  try {
    const today = new Date();
    const recentWindowStart = new Date(today);
    recentWindowStart.setDate(recentWindowStart.getDate() - 120);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const query = new URLSearchParams({
      include_adult: 'false',
      include_video: 'false',
      language: 'en-US',
      page: '1',
      region: 'US',
      sort_by: 'primary_release_date.desc',
      'primary_release_date.lte': formatDate(today),
      'primary_release_date.gte': formatDate(recentWindowStart),
      'vote_count.gte': '25',
    });

    const res = await fetch(`${TMDB_BASE_URL}/discover/movie?${query.toString()}`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return data.results?.map((movie: any) => normalizeMovieResult(movie, 'movie')) || [];
  } catch (err) {
    console.error('TMDB New Releases Fetch Error:', err);
    return [];
  }
};

export const getUpcomingContent = async (): Promise<ContentData[]> => {
  try {
    const today = new Date();
    const futureWindowEnd = new Date(today);
    futureWindowEnd.setDate(futureWindowEnd.getDate() + 365);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const commonParams = {
      include_adult: 'false',
      language: 'en-US',
      page: '1',
      sort_by: 'popularity.desc',
    };

    const [upcomingMoviesRes, upcomingTvRes, upcomingAnimationMoviesRes, upcomingAnimationTvRes] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/upcoming?language=en-US&page=1&region=US`, {
        headers: getHeaders()
      }),
      fetch(`${TMDB_BASE_URL}/discover/tv?${new URLSearchParams({
        ...commonParams,
        'first_air_date.gte': formatDate(today),
        'first_air_date.lte': formatDate(futureWindowEnd),
      }).toString()}`, {
        headers: getHeaders()
      }),
      fetch(`${TMDB_BASE_URL}/discover/movie?${new URLSearchParams({
        ...commonParams,
        with_genres: '16',
        'primary_release_date.gte': formatDate(today),
        'primary_release_date.lte': formatDate(futureWindowEnd),
      }).toString()}`, {
        headers: getHeaders()
      }),
      fetch(`${TMDB_BASE_URL}/discover/tv?${new URLSearchParams({
        ...commonParams,
        with_genres: '16',
        'first_air_date.gte': formatDate(today),
        'first_air_date.lte': formatDate(futureWindowEnd),
      }).toString()}`, {
        headers: getHeaders()
      }),
    ]);

    const [upcomingMoviesData, upcomingTvData, upcomingAnimationMoviesData, upcomingAnimationTvData] = await Promise.all([
      upcomingMoviesRes.json(),
      upcomingTvRes.json(),
      upcomingAnimationMoviesRes.json(),
      upcomingAnimationTvRes.json(),
    ]);

    const combined: ContentData[] = [
      ...(upcomingMoviesData.results?.map((movie: any) => ({
        ...movie,
        media_type: 'movie',
      })) || []),
      ...(upcomingTvData.results?.map((show: any) => ({
        ...show,
        title: show.name,
        release_date: show.first_air_date,
        media_type: 'tv',
      })) || []),
      ...(upcomingAnimationMoviesData.results?.map((movie: any) => ({
        ...movie,
        media_type: 'movie',
      })) || []),
      ...(upcomingAnimationTvData.results?.map((show: any) => ({
        ...show,
        title: show.name,
        release_date: show.first_air_date,
        media_type: 'tv',
      })) || []),
    ];

    const deduped = combined.filter((item, index, items) => {
      const key = `${getContentTypeLabel(item)}:${item.id}`;
      return items.findIndex((candidate) => `${getContentTypeLabel(candidate)}:${candidate.id}` === key) === index;
    });

    return deduped
      .filter((item) => Boolean(item.backdrop_path || item.poster_path))
      .sort((a, b) => new Date(getContentReleaseDate(a)).getTime() - new Date(getContentReleaseDate(b)).getTime());
  } catch (err) {
    console.error('TMDB Upcoming Content Fetch Error:', err);
    return [];
  }
};

export const getTrendingTVShows = async (): Promise<TVShowData[]> => {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/tv/day`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return data.results?.map((show: any) => normalizeTvResult(show, 'tv') as TVShowData) || [];
  } catch (err) {
    console.error('TMDB TV Shows Fetch Error:', err);
    return [];
  }
};

export const getTrendingAnimations = async (): Promise<AnimationData[]> => {
  try {
    // Fetch animated movies and TV shows
    const [animatedMovies, animatedTVShows] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/discover/movie?with_genres=16&sort_by=popularity.desc&page=1`, {
        headers: getHeaders()
      }),
      fetch(`${TMDB_BASE_URL}/discover/tv?with_genres=16&sort_by=popularity.desc&page=1`, {
        headers: getHeaders()
      })
    ]);

    const [moviesData, tvData] = await Promise.all([
      animatedMovies.json(),
      animatedTVShows.json()
    ]);

    const animations: AnimationData[] = [
      ...(moviesData.results?.map((movie: any) => normalizeMovieResult(movie, 'animation') as AnimationData) || []),
      ...(tvData.results?.map((show: any) => normalizeTvResult(show, 'animation') as AnimationData) || [])
    ];

    return sortContentByPerformance(dedupeContent(animations)) as AnimationData[];
  } catch (err) {
    console.error('TMDB Animations Fetch Error:', err);
    return [];
  }
};

export const getBrowseContentCatalog = async (): Promise<{
  movies: MovieData[];
  tvShows: TVShowData[];
  animations: AnimationData[];
}> => {
  const [movies, tvShows, animations] = await Promise.all([
    getTrendingMovies(),
    getTrendingTVShows(),
    getTrendingAnimations(),
  ]);

  return {
    movies: sortContentByPerformance(dedupeContent(movies)) as MovieData[],
    tvShows: sortContentByPerformance(dedupeContent(tvShows)) as TVShowData[],
    animations: sortContentByPerformance(dedupeContent(animations)) as AnimationData[],
  };
};

export const searchAllContent = async (query: string): Promise<ContentData[]> => {
  if (!query) return [];

  try {
    const normalizedQuery = query.trim();
    const [moviesResponse, tvResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(normalizedQuery)}&include_adult=false&language=en-US&page=1`, {
        headers: getHeaders()
      }),
      fetch(`${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(normalizedQuery)}&include_adult=false&language=en-US&page=1`, {
        headers: getHeaders()
      })
    ]);

    const [moviesData, tvData] = await Promise.all([
      moviesResponse.ok ? moviesResponse.json() : Promise.resolve({ results: [] }),
      tvResponse.ok ? tvResponse.json() : Promise.resolve({ results: [] }),
    ]);

    const combinedResults: MovieData[] = [
      ...(moviesData.results?.map((movie: any) => {
        const isAnimation = (movie.genre_ids || []).includes(16);
        return normalizeMovieResult(movie, isAnimation ? 'animation' : 'movie');
      }) || []),
      ...(tvData.results?.map((show: any) => {
        const isAnimation = (show.genre_ids || []).includes(16);
        return normalizeTvResult(show, isAnimation ? 'animation' : 'tv');
      }) || []),
    ];

    const dedupedResults = combinedResults.filter((item, index, collection) => {
      const imdbKey = item.imdb_id ? `imdb:${item.imdb_id}` : null;
      const tmdbKey = item.id ? `${item.media_type || 'movie'}:${item.id}` : getContentStorageKey(item);

      return collection.findIndex((candidate) => {
        if (imdbKey && candidate.imdb_id) {
          return `imdb:${candidate.imdb_id}` === imdbKey;
        }

        return `${candidate.media_type || 'movie'}:${candidate.id}` === tmdbKey;
      }) === index;
    });

    return dedupedResults
      .sort((a, b) => computeSearchRelevance(b, normalizedQuery) - computeSearchRelevance(a, normalizedQuery));
  } catch (err) {
    console.error('TMDB Search All Content Error:', err);
    return [];
  }
};

export const searchMovies = async (query: string): Promise<ContentData[]> => {
  return searchAllContent(query);
};

export const searchMoviesByLetter = async (letter: string): Promise<MovieData[]> => {
  if (!letter || letter.length !== 1) return [];
  
  try {
    // Use TMDB discover API to get movies starting with a specific letter
    // We'll use the discover endpoint with primary_release_year to get more results
    const res = await fetch(`${TMDB_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`, {
      headers: getHeaders()
    });
    const data = await res.json();
    const results = data.results || [];
    
    // Filter movies that start with the letter (case-insensitive)
    const filteredMovies = results.filter((movie: any) => {
      const title = movie.title || '';
      return title.toLowerCase().startsWith(letter.toLowerCase());
    });
    
    // Transform to MovieData format
    const movies: MovieData[] = filteredMovies.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview || '',
      poster_path: movie.poster_path || '',
      backdrop_path: movie.backdrop_path || '',
      release_date: movie.release_date || '',
      vote_average: movie.vote_average || 0,
      genre_ids: movie.genre_ids || []
    }));

    return movies;
  } catch (err) {
    console.error('TMDB Search by Letter Error:', err);
    return [];
  }
};

export const getPopularMoviesByYear = async (year: number): Promise<MovieData[]> => {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&primary_release_year=${year}&sort_by=popularity.desc`, {
      headers: getHeaders()
    });
    const data = await res.json();
    const results = data.results || [];
    const movies: MovieData[] = results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview || '',
      poster_path: movie.poster_path || '',
      backdrop_path: movie.backdrop_path || '',
      release_date: movie.release_date || '',
      vote_average: movie.vote_average || 0,
      genre_ids: movie.genre_ids || []
    }));
    return movies;
  } catch (err) {
    console.error(`TMDB Popular Movies by Year (${year}) Error:`, err);
    return [];
  }
};

export const getPopularMoviesByYearRange = async (startYear: number, endYear: number): Promise<{ [year: number]: MovieData[] }> => {
  const moviesByYear: { [year: number]: MovieData[] } = {};
  
  for (let year = endYear; year >= startYear; year--) {
    const movies = await getPopularMoviesByYear(year);
    if (movies.length > 0) {
      moviesByYear[year] = movies.slice(0, 5); // Limit to 5 movies per year
    }
  }
  
  return moviesByYear;
};

const getFallbackMovies = (): MovieData[] => [
  {
    id: 157336,
    title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2QniE6EszQwQvK6t6fxYvbtS.jpg",
    backdrop_path: "/rAiY_pUm9v9qEMpep9p4j70OESt.jpg",
    release_date: "2014-11-05",
    vote_average: 8.4,
    genre_ids: [12, 18, 878]
  },
  {
    id: 634649,
    title: "Spider-Man: No Way Home",
    overview: "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero. When he asks for help from Doctor Strange the stakes become even more dangerous, forcing him to discover what it truly means to be Spider-Man.",
    poster_path: "/1g0dhYtWyWtSSTvTOB3U9zY9Vv6.jpg",
    backdrop_path: "/iQFcwSG7CZpOMIuRYrSTP3pFCDf.jpg",
    release_date: "2021-12-15",
    vote_average: 8.0,
    genre_ids: [28, 12, 878]
  },
  {
    id: 438631,
    title: "Dune",
    overview: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
    poster_path: "/d5NXSklZfsNcSR9pWhv97NVpms6.jpg",
    backdrop_path: "/lz21LZEjG7mS7AgmQO0LYG9YmQQ.jpg",
    release_date: "2021-09-15",
    vote_average: 7.8,
    genre_ids: [12, 18, 878]
  },
  {
    id: 155,
    title: "The Dark Knight",
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    poster_path: "/qJ2tW6WMUDp9aqSbtmNrkGv93ky.jpg",
    backdrop_path: "/oXUunYhnun0D7VfIqX0Z6V87clw.jpg",
    release_date: "2008-07-16",
    vote_average: 8.5,
    genre_ids: [18, 28, 80, 53]
  },
  {
    id: 19995,
    title: "Avatar",
    overview: "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following his orders and protecting the world he feels is his home.",
    poster_path: "/6EiRUJp6vSbtxq9ZqcH0CbkKp0s.jpg",
    backdrop_path: "/8rm3S4cr9m0STu9Y8Xp2Z8YNo9q.jpg",
    release_date: "2009-12-10",
    vote_average: 7.5,
    genre_ids: [28, 12, 14, 878]
  },
  {
    id: 27205,
    title: "Inception",
    overview: "Cobb, a skilled thief who steals corporate secrets from use of dream-sharing technology, is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster_path: "/edv5CZv0jH9NX186R3yq7vLcQ9u.jpg",
    backdrop_path: "/8Z79vS8Inp6FmR3w5K8XfH6SrtS.jpg",
    release_date: "2010-07-15",
    vote_average: 8.3,
    genre_ids: [28, 878, 12]
  },
  {
    id: 671,
    title: "Harry Potter and the Philosopher's Stone",
    overview: "Harry Potter has lived under the stairs at his aunt and uncle's house his whole life. But on his 11th birthday, he learns he's a powerful wizard—with a place waiting for him at the Hogwarts School of Witchcraft and Wizardry.",
    poster_path: "/wuMc08IPKEatv9rnMNXv3BCI9Y2.jpg",
    backdrop_path: "/hziRFr3uYp1zY9vK3j9B6wOUAsT.jpg",
    release_date: "2001-11-16",
    vote_average: 7.9,
    genre_ids: [12, 14]
  }
];

export const getImageUrl = (path: string, size: 'w500' | 'original' = 'w500') => {
  if (!path) return "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop";
  if (isAbsoluteUrl(path)) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getTrailerUrl = async (
  item: number | Pick<MovieData, 'id' | 'media_type' | 'genre_ids' | 'name' | 'title'>
): Promise<string | null> => {
  const cacheKey = buildTrailerCacheKey(item);
  const cached = trailerUrlCache.get(cacheKey);
  if (cached) return cached;

  const trailerPromise = (async () => {
    try {
      const path = typeof item === 'number' ? `/movie/${item}/videos` : getTmdbVideoPath(item);
      const res = await fetch(`${TMDB_BASE_URL}${path}`, {
        headers: getHeaders()
      });
      const data = await res.json();
      const trailer = selectBestTrailerVideo(data.results || []);

      if (!trailer?.key) {
        return null;
      }

      return toYoutubeEmbedUrl(trailer.key);
    } catch (err) {
      console.error('TMDB Trailer Fetch Error:', err);
      return null;
    }
  })();

  trailerUrlCache.set(cacheKey, trailerPromise);
  return trailerPromise;
};

export const normalizeStoredContentItem = async (item: MovieData): Promise<MovieData> => {
  const baseItem: MovieData = {
    ...item,
    title: item.title || item.name || 'Untitled',
    overview: item.overview || '',
    poster_path: item.poster_path || '',
    backdrop_path: item.backdrop_path || '',
    release_date: item.release_date || item.first_air_date || '',
    genre_ids: Array.isArray(item.genre_ids) ? item.genre_ids : [],
  };

  if (item.media_type === 'movie' || item.media_type === 'tv') {
    if (item.media_type === 'tv') {
      return await enrichTvWithTwoEmbed(baseItem, 'tv');
    }

    return await enrichMovieWithTwoEmbed(baseItem, 'movie');
  }

  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/movie/${item.id}`, { headers: getHeaders() }),
      fetch(`${TMDB_BASE_URL}/tv/${item.id}`, { headers: getHeaders() }),
    ]);

    const isMovie = movieRes.ok;
    const isTv = tvRes.ok;

    if (isTv && !isMovie) {
      const data = await tvRes.json();
      const normalizedTvItem: MovieData = {
        ...baseItem,
        title: data.name || baseItem.title,
        name: data.name || baseItem.name || baseItem.title,
        release_date: data.first_air_date || baseItem.release_date,
        first_air_date: data.first_air_date || baseItem.first_air_date || baseItem.release_date,
        poster_path: data.poster_path || baseItem.poster_path,
        backdrop_path: data.backdrop_path || baseItem.backdrop_path,
        overview: data.overview || baseItem.overview,
        genre_ids: normalizeGenreIds(data.genres) || baseItem.genre_ids,
        media_type: 'tv',
      };

      return await enrichTvWithTwoEmbed(normalizedTvItem, 'tv');
    }

    if (isMovie) {
      const data = await movieRes.json();
      const normalizedMovieItem: MovieData = {
        ...baseItem,
        title: data.title || baseItem.title,
        release_date: data.release_date || baseItem.release_date,
        poster_path: data.poster_path || baseItem.poster_path,
        backdrop_path: data.backdrop_path || baseItem.backdrop_path,
        overview: data.overview || baseItem.overview,
        genre_ids: normalizeGenreIds(data.genres) || baseItem.genre_ids,
        media_type: 'movie',
      };

      return await enrichMovieWithTwoEmbed(normalizedMovieItem, 'movie');
    }
  } catch (error) {
    console.error('Error normalizing stored content item:', error);
  }

  return {
    ...baseItem,
    media_type: baseItem.media_type || 'movie',
  };
};

export const getTrailers = async (): Promise<TrailerData[]> => {
  try {
    // Get trending movies
    const res = await fetch(`${TMDB_BASE_URL}/trending/movie/day`, {
      headers: getHeaders()
    });
    const data = await res.json();
    const movies = data.results || [];

    // Fetch videos for each movie
    const trailersWithVideos = await Promise.all(
      movies.slice(0, 20).map(async (movie: MovieData) => {
        try {
          const videoRes = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos`, {
            headers: getHeaders()
          });
          const videoData = await videoRes.json();
          const bestTrailer = selectBestTrailerVideo(videoData.results || []);

          if (bestTrailer) {
            return {
              ...movie,
              videos: [bestTrailer]
            } as TrailerData;
          }
          return null;
        } catch (err) {
          console.error(`Error fetching videos for movie ${movie.id}:`, err);
          return null;
        }
      })
    );

    // Filter out nulls and return only movies with trailers
    return trailersWithVideos.filter((t): t is TrailerData => t !== null);
  } catch (err) {
    console.error('TMDB Trailers Fetch Error:', err);
    return [];
  }
};

export const genreMap: { [key: number]: string } = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
  10759: "Action & Adventure", 10762: "Kids", 10763: "News", 10764: "Reality",
  10765: "Sci-Fi & Fantasy", 10766: "Soap", 10767: "Talk", 10768: "War & Politics"
};

const genreNameToIdMap = new Map(
  Object.entries(genreMap).map(([id, name]) => [name.toLowerCase(), Number(id)])
);

const mapGenreNamesToIds = (genres: unknown): number[] => {
  if (!Array.isArray(genres)) return [];

  return genres
    .map((genre) => {
      if (typeof genre !== 'string') return null;
      return genreNameToIdMap.get(genre.toLowerCase()) ?? null;
    })
    .filter((genreId): genreId is number => genreId !== null);
};

export const getGenreNames = (ids: number[] = []) => {
  return ids.map(id => genreMap[id]).filter(Boolean).join(', ');
};
