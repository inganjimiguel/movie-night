import {useEffect, useRef, useState, type FormEvent} from 'react';
import {
  DEFAULT_VIDEO_SOURCE,
  getTrendingMovies,
  hydrateContentForDetails,
  searchAllContent,
  getTrailerUrl,
  getVidsrcUrl,
  getVideoSourceName,
  type ContentData,
  type MovieData,
  type VideoSource
} from '../services/movieService';

const PLAYER_READY_GRACE_MS = 1800;
const PLAYER_LOAD_TIMEOUT_MS = 12000;

export default function useMovieBrowser() {
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [searchResults, setSearchResults] = useState<ContentData[]>([]);
  const [featured, setFeatured] = useState<MovieData | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [currentSource, setCurrentSource] = useState<VideoSource>(DEFAULT_VIDEO_SOURCE);
  const playerTimeoutRef = useRef<number | null>(null);

  const clearPlayerTimeout = () => {
    if (playerTimeoutRef.current) {
      window.clearTimeout(playerTimeoutRef.current);
      playerTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const trending = await getTrendingMovies();
      setMovies(trending);

      if (trending.length > 0) {
        const candidates = trending
          .filter((movie) => Boolean(movie.backdrop_path))
          .slice(0, 6);

        const trailerChecks = await Promise.all(
          candidates.map(async (movie) => ({
            movie,
            trailerUrl: await getTrailerUrl(movie),
          }))
        );

        const featuredWithTrailer = trailerChecks.find(({ trailerUrl }) => Boolean(trailerUrl))?.movie;
        setFeatured(featuredWithTrailer ?? candidates[0] ?? trending[0]);
      }
    };

    void fetchData();
  }, []);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchQuery.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results = await searchAllContent(searchQuery);
    setSearchResults(results);
  };

  const playMovie = async (movie: MovieData, season = 1, episode = 1, source: VideoSource = currentSource) => {
    clearPlayerTimeout();
    setPlayerError(null);
    setIsPlayerLoading(true);
    const hydratedMovie = await hydrateContentForDetails(movie);
    setSelectedMovie(hydratedMovie);
    const vidsrcUrl = getVidsrcUrl(hydratedMovie, season, episode, source);
    setPlayerUrl(vidsrcUrl);
    setIsPlaying(true);
    playerTimeoutRef.current = window.setTimeout(() => {
      setIsPlayerLoading(false);
      setPlayerError(`Playback is taking longer than expected on ${getVideoSourceName(source)}. Try switching sources.`);
    }, PLAYER_LOAD_TIMEOUT_MS);
  };

  const handlePlayerReady = () => {
    clearPlayerTimeout();
    window.setTimeout(() => {
      setIsPlayerLoading(false);
    }, PLAYER_READY_GRACE_MS);
  };

  const openMovieDetails = (movie: MovieData, shouldAutoplay = false) => {
    clearPlayerTimeout();
    setSelectedMovie(movie);
    setIsPlaying(false);
    setPlayerUrl(null);
    setPlayerError(null);
    setIsPlayerLoading(false);

    void hydrateContentForDetails(movie).then((hydratedMovie) => {
      setSelectedMovie((currentMovie) => (currentMovie?.id === movie.id ? hydratedMovie : currentMovie));
    });

    if (shouldAutoplay) {
      // Set loading state immediately for instant feedback
      setIsPlayerLoading(true);
      void playMovie(movie);
    }
  };

  const closeMovieDetails = () => {
    clearPlayerTimeout();
    setSelectedMovie(null);
    setIsPlaying(false);
    setPlayerUrl(null);
    setPlayerError(null);
    setIsPlayerLoading(false);
  };

  const resetToBrowse = () => {
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => () => clearPlayerTimeout(), []);

  return {
    featured,
    currentSource,
    isMuted,
    isPlaying,
    isPlayerLoading,
    isScrolled,
    isSearching,
    movies,
    playerError,
    playerUrl,
    searchQuery,
    searchResults,
    selectedMovie,
    closeMovieDetails,
    handleSearch,
    openMovieDetails,
    playMovie,
    resetToBrowse,
    handlePlayerReady,
    setIsMuted,
    setCurrentSource,
    setSearchQuery,
    setSearchResults,
    setIsSearching,
  };
}
