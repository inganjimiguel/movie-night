import {useEffect, useState, type FormEvent} from 'react';
import {getTrendingMovies, searchMovies, getTrailerUrl, getVidsrcUrl, type MovieData} from '../services/movieService';

const PLAYER_READY_GRACE_MS = 1800;

export default function useMovieBrowser() {
  const [movies, setMovies] = useState<MovieData[]>([]);
  const [searchResults, setSearchResults] = useState<MovieData[]>([]);
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
    const results = await searchMovies(searchQuery);
    setSearchResults(results);
  };

  const playMovie = async (movie: MovieData) => {
    setPlayerError(null);
    setIsPlayerLoading(true);

    const vidsrcUrl = getVidsrcUrl(movie);
    setPlayerUrl(vidsrcUrl);
    setIsPlaying(true);
  };

  const handlePlayerReady = () => {
    window.setTimeout(() => {
      setIsPlayerLoading(false);
    }, PLAYER_READY_GRACE_MS);
  };

  const openMovieDetails = (movie: MovieData, shouldAutoplay = false) => {
    setSelectedMovie(movie);
    setIsPlaying(false);
    setPlayerUrl(null);
    setPlayerError(null);

    if (shouldAutoplay) {
      // Set loading state immediately for instant feedback
      setIsPlayerLoading(true);
      void playMovie(movie);
    }
  };

  const closeMovieDetails = () => {
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

  return {
    featured,
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
    setSearchQuery,
    setSearchResults,
    setIsSearching,
  };
}
