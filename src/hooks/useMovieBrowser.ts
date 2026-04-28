import {useEffect, useState, type FormEvent} from 'react';
import {getTrendingMovies, searchMovies, getVidsrcUrl, type MovieData} from '../services/movieService';

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
        setFeatured(trending[0]);
      }
    };

    fetchData();
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

    // Generate URL instantly - no async needed for vidsrc
    const vidsrcUrl = getVidsrcUrl(movie.id);
    
    // Set player state immediately for instant playback
    setPlayerUrl(vidsrcUrl);
    setIsPlaying(true);
    
    // Show loading banner for a realistic duration to allow vidsrc to load
    // This gives users feedback while the video player initializes
    setTimeout(() => setIsPlayerLoading(false), 2000);
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
    setIsMuted,
    setSearchQuery,
    setSearchResults,
    setIsSearching,
  };
}
