/// <reference types="vite/client" />
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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
  genre_ids: number[];
  media_type?: 'movie' | 'tv' | 'animation';
  /** Present for TV results (TMDB uses `name` instead of `title`). */
  name?: string;
  /** Present for TV results (TMDB uses `first_air_date` instead of `release_date`). */
  first_air_date?: string;
}

export interface TVShowData {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  media_type: 'tv';
}

export interface AnimationData {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
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

export type VideoSource = 'vidsrc';
const trailerUrlCache = new Map<string, Promise<string | null>>();

export const isTvLikeContent = (item: Pick<MovieData, 'media_type' | 'genre_ids' | 'name' | 'title'>): boolean => {
  if (item.media_type === 'tv') return true;
  // Animated TV is still TV for embed purposes (episode/season navigation).
  if (item.media_type === 'animation' && item.genre_ids?.includes(16) && item.name && !item.title) return true;
  return false;
};

export const isAnimationContent = (item: Pick<MovieData, 'genre_ids'>): boolean => {
  return item.genre_ids?.includes(16) ?? false;
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
  if (isTvLikeContent(item)) return 'TV Show';
  if (item.media_type === 'animation') return 'Animation';
  return 'Movie';
};

export const getContentStorageKey = (item: Pick<MovieData, 'id' | 'media_type' | 'genre_ids' | 'name' | 'title'>): string => {
  return `${getContentTypeLabel(item).toLowerCase().replace(/\s+/g, '-')}:${item.id}`;
};

export const getVideoUrl = (
  id: number,
  mediaType: 'movie' | 'tv' | 'animation' = 'movie',
  season?: number,
  episode?: number
): string => {
  if (mediaType === 'tv') {
    if (season && episode) {
      return `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
    }
    return `https://vidsrc.to/embed/tv/${id}`;
  }
  // Treat animated movies like movies for VidSrc embeds.
  return `https://vidsrc.to/embed/movie/${id}`;
};

export const getVidsrcUrl = (item: Pick<MovieData, 'id' | 'media_type' | 'genre_ids' | 'name' | 'title'>, season = 1, episode = 1): string => {
  const mediaType: 'movie' | 'tv' = isTvLikeContent(item) ? 'tv' : 'movie';
  if (mediaType === 'tv') {
    return getVideoUrl(item.id, 'tv', season, episode);
  }
  return getVideoUrl(item.id, 'movie');
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
    return data.results?.map((movie: any) => ({
      ...movie,
      media_type: 'movie'
    })) || getFallbackMovies();
  } catch (err) {
    console.error('TMDB Fetch Error:', err);
    return getFallbackMovies();
  }
};

export const getTrendingTVShows = async (): Promise<TVShowData[]> => {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/tv/day`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return data.results?.map((show: any) => ({
      ...show,
      title: show.name,
      release_date: show.first_air_date,
      media_type: 'tv'
    })) || [];
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
      ...(moviesData.results?.map((movie: any) => ({
        ...movie,
        media_type: 'movie'
      })) || []),
      ...(tvData.results?.map((show: any) => ({
        ...show,
        title: show.name,
        release_date: show.first_air_date,
        media_type: 'tv'
      })) || [])
    ];

    return animations.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  } catch (err) {
    console.error('TMDB Animations Fetch Error:', err);
    return [];
  }
};

export const searchAllContent = async (query: string): Promise<ContentData[]> => {
  if (!query) return [];
  
  try {
    // Search across movies, TV shows, and animations
    const [moviesRes, tvRes] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, {
        headers: getHeaders()
      }),
      fetch(`${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, {
        headers: getHeaders()
      })
    ]);

    const [moviesData, tvData] = await Promise.all([
      moviesRes.json(),
      tvRes.json()
    ]);

    const allContent: ContentData[] = [
      ...(moviesData.results?.map((movie: any) => ({
        ...movie,
        media_type: 'movie'
      })) || []),
      ...(tvData.results?.map((show: any) => ({
        ...show,
        title: show.name,
        release_date: show.first_air_date,
        media_type: 'tv'
      })) || [])
    ];

    const dedupedContent = allContent.filter((item, index, items) => {
      const key = `${item.media_type}:${item.id}`;
      return items.findIndex((candidate) => `${candidate.media_type}:${candidate.id}` === key) === index;
    });

    return dedupedContent.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
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

export const getGenreNames = (ids: number[] = []) => {
  return ids.map(id => genreMap[id]).filter(Boolean).join(', ');
};
