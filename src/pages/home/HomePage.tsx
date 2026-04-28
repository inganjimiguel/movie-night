import {useRef, useState, useEffect} from 'react';
import { Search } from 'lucide-react';
import ModernFeaturedHero from '../../components/movies/ModernFeaturedHero';
import ModernMovieCarousel from '../../components/movies/ModernMovieCarousel';
import ModernMovieDetailsModal from '../../components/movies/ModernMovieDetailsModal';
import ModernMovieCard from '../../components/movies/ModernMovieCard';
import SearchResultsSection from '../../components/movies/SearchResultsSection';
import OptimizedSearch from '../../components/search/OptimizedSearch';
import SophisticatedSidePanels from '../../components/layout/SophisticatedSidePanels';
import BackToHomeNavbar from '../../components/layout/BackToHomeNavbar';
import AllMovies from '../../components/movies/AllMovies';
import useMovieBrowser from '../../hooks/useMovieBrowser';
import { searchMoviesByLetter } from '../../services/movieService';
import '../../styles/responsive.css';

interface HomePageProps {
  navigateTo?: (path: string) => void;
}

export default function HomePage({ navigateTo }: HomePageProps = {}) {
  const {
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
  } = useMovieBrowser();

    const [filteredResults, setFilteredResults] = useState<any[]>([]);

  const movieRowRef = useRef<HTMLDivElement>(null);

  const handleOptimizedSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredResults([]);
      return;
    }

    // Trigger the existing search
    handleSearch({ preventDefault: () => {} } as any);
  };

  const handleDirectPlay = async (query: string) => {
    // In a real implementation, this would search for the movie and play it directly
    // For now, we'll just trigger a search
    setSearchQuery(query);
    handleSearch({ preventDefault: () => {} } as any);
  };

  const handleSearchByLetter = async (letter: string) => {
    const results = await searchMoviesByLetter(letter);
    setSearchQuery(letter);
    setSearchResults(results);
    setIsSearching(true);
  };

  const handleBackToHome = () => {
    console.log('Back to home clicked - clearing search state');
    
    // Clear local state first
    setFilteredResults([]);
    
    // Then reset the browser state (which also clears searchQuery and searchResults)
    resetToBrowse();
    console.log('resetToBrowse called');
  };

  // Apply filters to search results
  useEffect(() => {
    console.log('Search state changed:', { searchQuery, searchResultsLength: searchResults.length });
    
    if (!searchQuery || searchResults.length === 0) {
      setFilteredResults([]);
      return;
    }

    let filtered = [...searchResults];
    
    // Sort by popularity by default
    filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    
    setFilteredResults(filtered);
  }, [searchResults, searchQuery]);

  const handleRowScroll = (direction: 'left' | 'right') => {
    if (!movieRowRef.current) {
      return;
    }

    const {scrollLeft, clientWidth} = movieRowRef.current;
    const nextScrollLeft = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;

    movieRowRef.current.scrollTo({left: nextScrollLeft, behavior: 'smooth'});
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden selection:bg-red-600 selection:text-white">
      {/* Back to Home Navbar */}
      <BackToHomeNavbar 
        isVisible={!!searchQuery}
        onBackToHome={handleBackToHome}
        searchQuery={searchQuery}
      />

      {/* Optimized Search */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 pt-20">
        <OptimizedSearch 
          onSearch={handleOptimizedSearch} 
          onDirectPlay={handleDirectPlay} 
          onSearchByLetter={handleSearchByLetter} 
          externalQuery={searchQuery}
        />
      </div>

      {searchQuery && filteredResults.length > 0 ? (
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Search Results</h2>
            <p className="text-gray-400">
              {filteredResults.length} results for "{searchQuery}"
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 pb-12">
            {filteredResults.map((movie, index) => (
              <div key={movie.id} className="transform transition-all duration-300 hover:scale-105">
                <ModernMovieCard
                  movie={movie}
                  layout="poster"
                  size="medium"
                  onSelect={(movie) => openMovieDetails(movie)}
                  showPlayButton={true}
                />
              </div>
            ))}
          </div>
        </div>
      ) : searchQuery ? (
        <div className="px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">No results found</h2>
          <p className="text-gray-400 mb-4">
            No movies match your search for "{searchQuery}"
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilteredResults([]);
            }}
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <>
          {featured && (
            <ModernFeaturedHero
              movie={featured}
              isMuted={false}
              onToggleMute={() => {}}
              onPlay={() => openMovieDetails(featured, true)}
              onOpenDetails={() => openMovieDetails(featured)}
            />
          )}

          <main className="relative -mt-32 sm:-mt-20 lg:-mt-16 z-10 pb-24 space-y-12 sm:space-y-16 lg:space-y-20 w-full overflow-x-hidden">
            <ModernMovieCarousel
              movies={movies}
              title="Trending Now"
              subtitle="The most popular movies right now"
              onMovieSelect={(movie) => openMovieDetails(movie)}
              autoScroll={false}
            />

            <ModernMovieCarousel
              movies={movies.slice(5, 13)}
              title="Popular on MovieNight"
              subtitle="Discover what other movie lovers are watching right now"
              onMovieSelect={(movie) => openMovieDetails(movie)}
              autoScroll={false}
            />

            <ModernMovieCarousel
              movies={movies.slice(13, 25)}
              title="New Releases"
              subtitle="Fresh movies added this week"
              onMovieSelect={(movie) => openMovieDetails(movie)}
              autoScroll={true}
              scrollInterval={4000}
            />
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
