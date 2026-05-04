import { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import ModernFeaturedHero from '../../components/movies/ModernFeaturedHero';
import ModernMovieCarousel from '../../components/movies/ModernMovieCarousel';
import ModernMovieDetailsModal from '../../components/movies/ModernMovieDetailsModal';
import ModernMovieCard from '../../components/movies/ModernMovieCard';
import OptimizedSearch from '../../components/search/OptimizedSearch';
import GenreSearch from '../../components/search/GenreSearch';
import SophisticatedSidePanels from '../../components/layout/SophisticatedSidePanels';
import BackToHomeNavbar from '../../components/layout/BackToHomeNavbar';
import AllMovies from '../../components/movies/AllMovies';
import useMovieBrowser from '../../hooks/useMovieBrowser';
import {
  getContentReleaseDate,
  getContentStorageKey,
  getNewReleaseMovies,
  getTrendingAnimations,
  getTrendingMovies,
  getTrendingTVShows,
  isAnimationContent,
  searchAllContent,
  type ContentData
} from '../../services/movieService';
import '../../styles/responsive.css';

interface HomePageProps {
  navigateTo?: (path: string) => void;
}

export default function HomePage({ navigateTo }: HomePageProps = {}) {
  const {
    featured,
    isPlaying,
    isPlayerLoading,
    isSearching,
    movies,
    playerError,
    playerUrl,
    searchQuery,
    searchResults,
    selectedMovie,
    closeMovieDetails,
    openMovieDetails,
    playMovie,
    resetToBrowse,
    handlePlayerReady,
    setSearchQuery,
    setSearchResults,
    setIsSearching,
  } = useMovieBrowser();

  const [selectedGenre, setSelectedGenre] = useState<number>(0);
  const [tvShows, setTVShows] = useState<ContentData[]>([]);
  const [animations, setAnimations] = useState<ContentData[]>([]);
  const [newReleases, setNewReleases] = useState<ContentData[]>([]);
  const [activeTab, setActiveTab] = useState<'movies' | 'tv' | 'animations'>('movies');

  const allBrowseContent = useMemo(() => {
    const combined = [...movies, ...tvShows, ...animations];
    return combined.filter((item, index, items) => {
      const key = getContentStorageKey(item);
      return items.findIndex((candidate) => getContentStorageKey(candidate) === key) === index;
    });
  }, [animations, movies, tvShows]);
  const currentContent = activeTab === 'movies' ? movies : activeTab === 'tv' ? tvShows : animations;
  const availableGenreIds = useMemo(() => {
    const movieGenres = [12, 14, 16, 18, 27, 28, 35, 36, 37, 53, 80, 99, 878, 9648, 10402, 10749, 10751, 10752, 10770];
    const tvGenres = [16, 35, 37, 80, 99, 9648, 10751, 10759, 10762, 10763, 10764, 10765, 10766, 10767, 10768];
    const animationGenres = [12, 14, 16, 18, 28, 35, 878, 10751, 10759, 10765];
    const currentGenreIds = allBrowseContent.flatMap((item) => item.genre_ids);

    return Array.from(new Set([...movieGenres, ...tvGenres, ...animationGenres, ...currentGenreIds])).sort((a, b) => a - b);
  }, [allBrowseContent]);
  const currentFeatured = useMemo(() => {
    if (activeTab === 'movies') {
      return featured;
    }

    return currentContent.find((item) => Boolean(item.backdrop_path)) ?? currentContent[0] ?? null;
  }, [activeTab, currentContent, featured]);
  const currentFeaturedKey = currentFeatured ? getContentStorageKey(currentFeatured) : null;
  const featuredRemovedContent = useMemo(() => {
    if (!currentFeaturedKey) {
      return currentContent;
    }

    return currentContent.filter((item) => getContentStorageKey(item) !== currentFeaturedKey);
  }, [currentContent, currentFeaturedKey]);
  const genreResults = useMemo(() => {
    if (selectedGenre === 0) {
      return [];
    }

    return allBrowseContent.filter((item) => item.genre_ids.includes(selectedGenre));
  }, [allBrowseContent, selectedGenre]);
  const movieNewReleases = useMemo(() => {
    const seen = new Set<string>();
    const filtered = newReleases.filter((item) => {
      const itemKey = getContentStorageKey(item);
      if (itemKey === currentFeaturedKey || seen.has(itemKey)) {
        return false;
      }

      seen.add(itemKey);
      return true;
    });

    if (filtered.length > 0) {
      return filtered;
    }

    return [...featuredRemovedContent]
      .sort((a, b) => new Date(getContentReleaseDate(b)).getTime() - new Date(getContentReleaseDate(a)).getTime())
      .slice(0, 10);
  }, [currentFeaturedKey, featuredRemovedContent, newReleases]);

  const filterResultsByActiveTab = (results: ContentData[]) => {
    if (activeTab === 'movies') {
      return results.filter((item) => item.media_type === 'movie');
    }

    if (activeTab === 'tv') {
      return results.filter((item) => item.media_type === 'tv');
    }

    return results.filter((item) => isAnimationContent(item));
  };
  const handleGenreSelect = (genreId: number) => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setSelectedGenre(genreId);
  };

  const handleOptimizedSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const results = await searchAllContent(query);
    setSearchResults(filterResultsByActiveTab(results));
    setIsSearching(true);
  };

  // Fetch all content types on mount
  useEffect(() => {
    const fetchAllContent = async () => {
      const [moviesData, tvData, animationsData, newReleaseData] = await Promise.all([
        getTrendingMovies(),
        getTrendingTVShows(),
        getTrendingAnimations(),
        getNewReleaseMovies()
      ]);
      
      setTVShows(tvData);
      setAnimations(animationsData);
      setNewReleases(newReleaseData);
    };

    fetchAllContent();
  }, []);

  const handleBackToHome = () => {
    resetToBrowse();
  };

  const filteredResults = useMemo(() => {
    if (!searchQuery || searchResults.length === 0) {
      return [];
    }

    const filtered = [...searchResults];
    filtered.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    return filtered;
  }, [searchQuery, searchResults]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }

    let cancelled = false;

    void searchAllContent(searchQuery).then((results) => {
      if (cancelled) return;
      setSearchResults(filterResultsByActiveTab(results));
      setIsSearching(true);
    });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden selection:bg-red-600 selection:text-white">
      {/* Back to Home Navbar */}
      <BackToHomeNavbar
        isVisible={!!searchQuery || selectedGenre > 0}
        onBackToHome={() => {
          setSelectedGenre(0);
          handleBackToHome();
        }}
        label={selectedGenre > 0 ? 'Back to Home' : 'Back to Search'}
      />

      {/* Navigation Tabs and Search */}
      <div className="relative z-[1400] px-3 py-5 pt-18 sm:px-6 sm:py-6 sm:pt-20 lg:px-8">
        {/* Content Type Tabs */}
        <div className="mb-5 rounded-[28px] border border-white/10 bg-black/45 p-4 shadow-2xl shadow-black/25 backdrop-blur-xl sm:mb-6 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex w-full max-w-full overflow-x-auto rounded-full border border-white/10 bg-white/5 p-1 sm:w-auto">
              {[
                { key: 'movies', label: 'Movies' },
                { key: 'tv', label: 'TV Shows' },
                { key: 'animations', label: 'Animations' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all sm:px-6 sm:text-base ${
                    activeTab === tab.key
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Genre Filter */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 flex-1">
              <OptimizedSearch 
                onSearch={handleOptimizedSearch} 
                externalQuery={searchQuery}
              />
            </div>
            <div className="relative z-[1450] w-full sm:w-auto">
              <GenreSearch 
                onGenreSelect={handleGenreSelect}
                selectedGenre={selectedGenre}
                availableGenreIds={availableGenreIds}
              />
            </div>
          </div>
        </div>
      </div>

      {searchQuery && filteredResults.length > 0 ? (
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-[28px] border border-white/10 bg-black/45 px-5 py-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-white mb-2">Search Results</h2>
            <p className="text-gray-400">
              {filteredResults.length} results for "{searchQuery}"
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pb-12 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredResults.map((item, index) => (
              <div key={item.id} className="transform transition-all duration-300 hover:scale-105">
                <ModernMovieCard
                  movie={item}
                  layout="poster"
                  size="medium"
                  onSelect={(item) => openMovieDetails(item)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : searchQuery ? (
        <div className="px-3 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-800">
            <Search className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">No results found</h2>
          <p className="text-gray-400 mb-4">
            No {activeTab === 'movies' ? 'movies' : activeTab === 'tv' ? 'TV shows' : 'animations'} match your search for "{searchQuery}"
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              setIsSearching(false);
            }}
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : selectedGenre > 0 ? (
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-[28px] border border-white/10 bg-black/45 px-5 py-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
            <h2 className="text-2xl font-bold text-white mb-2">Genre Results</h2>
            <p className="text-gray-400">
              {genreResults.length} titles found
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 pb-12 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {genreResults.map((movie) => (
              <div key={getContentStorageKey(movie)} className="transform transition-all duration-300 hover:scale-105">
                <ModernMovieCard
                  movie={movie}
                  layout="poster"
                  size="medium"
                  onSelect={(movie) => openMovieDetails(movie)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {currentFeatured && (
            <ModernFeaturedHero
              movie={currentFeatured}
              isMuted={false}
              onToggleMute={() => {}}
              onPlay={() => openMovieDetails(currentFeatured, true)}
            />
          )}

          <main className={`relative ${currentFeatured ? 'mt-8 sm:mt-10 lg:mt-12' : 'mt-6 sm:mt-8'} z-10 pb-20 sm:pb-24 space-y-10 sm:space-y-14 lg:space-y-20 w-full overflow-x-hidden`}>
            {activeTab === 'movies' && (
              <>
                <ModernMovieCarousel
                  movies={featuredRemovedContent}
                  title="Trending Movies"
                  subtitle="The most popular movies right now"
                  onMovieSelect={(movie) => openMovieDetails(movie)}
                  autoScroll={false}
                  className="pt-4"
                />

                <ModernMovieCarousel
                  movies={featuredRemovedContent.slice(4, 12)}
                  title="Popular on MovieNight"
                  subtitle="Popular on Movie Night"
                  onMovieSelect={(movie) => openMovieDetails(movie)}
                  autoScroll={false}
                />

                <ModernMovieCarousel
                  movies={movieNewReleases}
                  title="New Releases"
                  subtitle="Fresh movie drops and recent premieres"
                  onMovieSelect={(movie) => openMovieDetails(movie)}
                  autoScroll={false}
                />
              </>
            )}

            {activeTab === 'tv' && (
              <>
                <ModernMovieCarousel
                  movies={featuredRemovedContent}
                  title="Trending TV Shows"
                  subtitle="The most popular TV shows right now"
                  onMovieSelect={(show) => openMovieDetails(show)}
                  autoScroll={false}
                />

                <ModernMovieCarousel
                  movies={featuredRemovedContent.slice(4, 12)}
                  title="Popular TV Shows"
                  subtitle="Discover what other viewers are watching"
                  onMovieSelect={(show) => openMovieDetails(show)}
                  autoScroll={false}
                />
              </>
            )}

            {activeTab === 'animations' && (
              <>
                <ModernMovieCarousel
                  movies={featuredRemovedContent}
                  title="Trending Animations"
                  subtitle="The most popular animated content right now"
                  onMovieSelect={(animation) => openMovieDetails(animation)}
                  autoScroll={false}
                />

                <ModernMovieCarousel
                  movies={featuredRemovedContent.slice(4, 12)}
                  title="Popular Animations"
                  subtitle="Discover amazing animated stories"
                  onMovieSelect={(animation) => openMovieDetails(animation)}
                  autoScroll={false}
                />
              </>
            )}
          </main>
          
          {/* All Movies Section */}
          <div className="relative z-10">
            <AllMovies onMovieSelect={openMovieDetails} />
          </div>
        </>
      )}

      <ModernMovieDetailsModal
        movie={selectedMovie}
        isPlaying={isPlaying}
        isPlayerLoading={isPlayerLoading}
        playerError={playerError}
        playerUrl={playerUrl}
        relatedMovies={movies.slice(0, 6)}
        onClose={closeMovieDetails}
        onPlay={() => selectedMovie && void playMovie(selectedMovie)}
        onPlayerReady={handlePlayerReady}
      />

      <SophisticatedSidePanels navigateTo={navigateTo} />

      {isSearching && (
        <div
          className="fixed inset-0 bg-black z-[-1] transition-opacity"
          onClick={resetToBrowse}
        />
      )}
    </div>
  );
}
