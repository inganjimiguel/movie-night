import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  createSlug,
  getContentReleaseDate,
  getContentSlug,
  getContentStorageKey,
  getContentTitle,
  getContentYear,
  getBrowseContentCatalog,
  getNewReleaseMovies,
  getGenreNames,
  genreMap,
  isAnimationContent,
  searchAllContent,
  type ContentData
} from '../../services/movieService';
import '../../styles/responsive.css';

interface HomePageProps {
  navigateTo?: (path: string) => void;
}

interface HomeNavigationState {
  autoplay?: boolean;
  selectedMovie?: ContentData;
}

export default function HomePage({ navigateTo }: HomePageProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentSource,
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
    setCurrentSource,
    setSearchQuery,
    setSearchResults,
    setIsSearching,
  } = useMovieBrowser();
  const navigationState = location.state as HomeNavigationState | null;

  const [selectedGenre, setSelectedGenre] = useState<number>(0);
  const [tvShows, setTVShows] = useState<ContentData[]>([]);
  const [animations, setAnimations] = useState<ContentData[]>([]);
  const [newReleases, setNewReleases] = useState<ContentData[]>([]);
  const [activeTab, setActiveTab] = useState<'movies' | 'tv' | 'animations'>('movies');
  const showBackToHomeNavbar = !!searchQuery || selectedGenre > 0;
  const currentMovieSlug = location.pathname.match(/^\/movies\/([^/]+)$/)?.[1];
  const currentGenreSlug = location.pathname.match(/^\/genres\/([^/]+)$/)?.[1];
  const currentListSlug = location.pathname.match(/^\/lists\/([^/]+)$/)?.[1];

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
  const editorialGuides = useMemo(() => {
    const byGenre = (genreIds: number[]) => allBrowseContent
      .filter((item) => item.genre_ids.some((genreId) => genreIds.includes(genreId)))
      .filter((item, index, items) => items.findIndex((candidate) => getContentStorageKey(candidate) === getContentStorageKey(item)) === index)
      .slice(0, 4);

    return {
      dateNight: byGenre([35, 18, 10749]),
      familyNight: byGenre([12, 16, 35, 10751]),
      weekend: (movieNewReleases.length ? movieNewReleases : allBrowseContent).slice(0, 4)
    };
  }, [allBrowseContent, movieNewReleases]);

  const handleGenreSelect = (genreId: number) => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setSelectedGenre(genreId);
    const genreSlug = createSlug(genreMap[genreId] || 'genre');
    if (genreId > 0 && location.pathname !== `/genres/${genreSlug}`) {
      void navigate(`/genres/${genreSlug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenMovieDetails = useCallback((movie: ContentData, shouldAutoplay = false) => {
    const moviePath = `/movies/${getContentSlug(movie)}`;
    if (location.pathname !== moviePath) {
      void navigate(moviePath);
    }
    openMovieDetails(movie, shouldAutoplay);
  }, [location.pathname, navigate, openMovieDetails]);

  const handleOptimizedSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const results = await searchAllContent(query);
    setSelectedGenre(0);
    setSearchResults(results);
    setIsSearching(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch all content types on mount
  useEffect(() => {
    const fetchAllContent = async () => {
      const [{ movies: moviesData, tvShows: tvData, animations: animationsData }, newReleaseData] = await Promise.all([
        getBrowseContentCatalog(),
        getNewReleaseMovies()
      ]);
      
      setTVShows(tvData);
      setAnimations(animationsData);
      setNewReleases(newReleaseData);
    };

    fetchAllContent();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname, location.key]);

  const handleBackToHome = () => {
    if (selectedGenre > 0) {
      if (navigateTo) {
      navigateTo('/');
      } else {
        void navigate('/');
      }
    }

    setSelectedGenre(0);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    resetToBrowse();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseMovieDetails = () => {
    closeMovieDetails();
    if (location.pathname.startsWith('/movies/')) {
      void navigate('/', { replace: false });
    }
  };

  const filteredResults = useMemo(() => {
    if (!searchQuery || searchResults.length === 0) {
      return [];
    }

    const filtered = [...searchResults];
    filtered.sort((a, b) => {
      const popularityDelta = (b.popularity || 0) - (a.popularity || 0);
      if (popularityDelta !== 0) {
        return popularityDelta;
      }

      return (b.vote_average || 0) - (a.vote_average || 0);
    });
    return filtered;
  }, [searchQuery, searchResults]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }

    let cancelled = false;

    void searchAllContent(searchQuery).then((results) => {
      if (cancelled) return;
      setSearchResults(results);
      setIsSearching(true);
    });

    return () => {
      cancelled = true;
    };
  }, [searchQuery, setIsSearching, setSearchResults]);

  useEffect(() => {
    if (!navigationState?.selectedMovie || selectedMovie) {
      return;
    }

    const matchedMovie =
      allBrowseContent.find((item) => getContentStorageKey(item) === getContentStorageKey(navigationState.selectedMovie!)) ??
      allBrowseContent.find((item) => item.id === navigationState.selectedMovie!.id) ??
      navigationState.selectedMovie;

    setSelectedGenre(0);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setActiveTab(
      matchedMovie.media_type === 'tv'
        ? 'tv'
        : isAnimationContent(matchedMovie)
          ? 'animations'
          : 'movies'
    );
    openMovieDetails(matchedMovie, navigationState.autoplay ?? false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    void navigate(`/movies/${getContentSlug(matchedMovie)}`, { replace: true, state: null });
  }, [
    allBrowseContent,
    navigate,
    navigationState,
    openMovieDetails,
    selectedMovie,
    setIsSearching,
    setSearchQuery,
    setSearchResults,
  ]);

  useEffect(() => {
    if (!currentGenreSlug) return;

    const matchedGenreId = Object.entries(genreMap).find(([, name]) => createSlug(name) === currentGenreSlug)?.[0];
    if (!matchedGenreId) return;

    const genreId = Number(matchedGenreId);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    setSelectedGenre(genreId);
  }, [currentGenreSlug, setIsSearching, setSearchQuery, setSearchResults]);

  useEffect(() => {
    if (!currentListSlug) return;

    setSelectedGenre(0);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);

    window.setTimeout(() => {
      document.getElementById(`list-${currentListSlug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }, [currentListSlug, setIsSearching, setSearchQuery, setSearchResults]);

  useEffect(() => {
    if (!currentMovieSlug || allBrowseContent.length === 0) return;
    if (selectedMovie && getContentSlug(selectedMovie) === currentMovieSlug) return;

    let cancelled = false;
    const readableTitle = currentMovieSlug.replace(/-/g, ' ');
    const catalogMatch = allBrowseContent.find((item) => getContentSlug(item) === currentMovieSlug);

    if (catalogMatch) {
      openMovieDetails(catalogMatch);
      return;
    }

    void searchAllContent(readableTitle).then((results) => {
      if (cancelled || results.length === 0) return;
      const match = results.find((item) => getContentSlug(item) === currentMovieSlug) ?? results[0];
      openMovieDetails(match);
    });

    return () => {
      cancelled = true;
    };
  }, [allBrowseContent, currentMovieSlug, openMovieDetails, selectedMovie]);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden selection:bg-red-600 selection:text-white">
      {/* Back to Home Navbar */}
      <BackToHomeNavbar
        isVisible={showBackToHomeNavbar}
        onBackToHome={() => {
          handleBackToHome();
        }}
        label={selectedGenre > 0 ? 'Back to Home' : 'Back to Search'}
      />

      {/* Navigation Tabs and Search */}
      <div className={`relative z-10 px-3 py-5 sm:px-6 sm:py-6 lg:px-8 ${showBackToHomeNavbar ? 'pt-6 sm:pt-8' : 'pt-18 sm:pt-20'}`}>
        <h1 className="mb-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
          Watch Movie Night Picks
        </h1>

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
          <div className="grid grid-cols-1 justify-items-center gap-3 pb-12 min-[380px]:grid-cols-2 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredResults.map((item, index) => (
              <div key={item.id} className="transform transition-all duration-300 hover:scale-105">
                <ModernMovieCard
                  movie={item}
                  layout="poster"
                  size="medium"
                  onSelect={(item) => handleOpenMovieDetails(item)}
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
            No titles match your search for "{searchQuery}"
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
          <div className="grid grid-cols-1 justify-items-center gap-3 pb-12 min-[380px]:grid-cols-2 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {genreResults.map((movie) => (
              <div key={getContentStorageKey(movie)} className="transform transition-all duration-300 hover:scale-105">
                <ModernMovieCard
                  movie={movie}
                  layout="poster"
                  size="medium"
                  onSelect={(movie) => handleOpenMovieDetails(movie)}
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
              onPlay={() => handleOpenMovieDetails(currentFeatured, true)}
            />
          )}

          <main className={`relative ${currentFeatured ? 'mt-8 sm:mt-10 lg:mt-12' : 'mt-6 sm:mt-8'} z-10 pb-20 sm:pb-24 space-y-10 sm:space-y-14 lg:space-y-20 w-full overflow-x-hidden`}>
            {activeTab === 'movies' && (
              <>
                <ModernMovieCarousel
                  movies={featuredRemovedContent}
                  title="Trending Movies"
                  subtitle="The most popular movies right now"
                  onMovieSelect={(movie) => handleOpenMovieDetails(movie)}
                  autoScroll={false}
                  className="pt-4"
                />

                <ModernMovieCarousel
                  movies={featuredRemovedContent.slice(4, 12)}
                  title="Popular on MovieNight"
                  subtitle="Popular on Movie Night"
                  onMovieSelect={(movie) => handleOpenMovieDetails(movie)}
                  autoScroll={false}
                />

                <ModernMovieCarousel
                  movies={movieNewReleases}
                  title="New Releases"
                  subtitle="Fresh movie drops and recent premieres"
                  onMovieSelect={(movie) => handleOpenMovieDetails(movie)}
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
                  onMovieSelect={(show) => handleOpenMovieDetails(show)}
                  autoScroll={false}
                  className="pt-4"
                />

                <ModernMovieCarousel
                  movies={featuredRemovedContent.slice(4, 12)}
                  title="Popular TV Shows"
                  subtitle="Discover what other viewers are watching"
                  onMovieSelect={(show) => handleOpenMovieDetails(show)}
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
                  onMovieSelect={(animation) => handleOpenMovieDetails(animation)}
                  autoScroll={false}
                  className="pt-4"
                />

                <ModernMovieCarousel
                  movies={featuredRemovedContent.slice(4, 12)}
                  title="Popular Animations"
                  subtitle="Discover amazing animated stories"
                  onMovieSelect={(animation) => handleOpenMovieDetails(animation)}
                  autoScroll={false}
                />
              </>
            )}
          </main>

          <IndexableMovieGuides
            dateNight={editorialGuides.dateNight}
            familyNight={editorialGuides.familyNight}
            weekend={editorialGuides.weekend}
            onMovieSelect={handleOpenMovieDetails}
            onGuideSelect={(listSlug) => void navigate(`/lists/${listSlug}`)}
          />
          
          {/* All Movies Section */}
          <div className="relative z-10">
            <AllMovies onMovieSelect={handleOpenMovieDetails} />
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
        currentSource={currentSource}
        onClose={handleCloseMovieDetails}
        onPlay={(season, episode) => selectedMovie && void playMovie(selectedMovie, season, episode, currentSource)}
        onSourceChange={(source, season, episode) => {
          if (source === currentSource) {
            return;
          }
          setCurrentSource(source);
          if (selectedMovie) {
            void playMovie(selectedMovie, season, episode, source);
          }
        }}
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

function IndexableMovieGuides({
  dateNight,
  familyNight,
  weekend,
  onMovieSelect,
  onGuideSelect,
}: {
  dateNight: ContentData[];
  familyNight: ContentData[];
  weekend: ContentData[];
  onMovieSelect: (movie: ContentData) => void;
  onGuideSelect: (listSlug: string) => void;
}) {
  const guides = [
    {
      slug: 'best-movies-for-date-night',
      title: 'Best Movies for Date Night',
      description: 'Pick a date night movie with a clear mood: romantic comedies for easy laughs, dramas for emotional stories, and thrillers when you want something tense but still fun to talk about after the credits.',
      items: dateNight,
      fallback: 'Browse romance, comedy, and drama titles when you want a movie night that feels warm, relaxed, and easy to share.'
    },
    {
      slug: 'best-family-movies',
      title: 'Family Movie Night Ideas',
      description: 'Family movie night works best with adventure, animation, comedy, and light fantasy. These genres are easy to watch together and give everyone something familiar to enjoy.',
      items: familyNight,
      fallback: 'Look for animation, adventure, comedy, and family-friendly stories when planning a comfortable group watch.'
    },
    {
      slug: 'what-to-watch-this-weekend',
      title: 'What to Watch This Weekend',
      description: 'Weekend picks should be simple to choose: new releases, trending movies, popular TV shows, and fresh animations that are easy to start without a long search.',
      items: weekend,
      fallback: 'Start with new releases and trending titles when you want a quick answer for what to watch this weekend.'
    }
  ];

  return (
    <section className="relative z-10 px-3 pb-8 sm:px-6 lg:px-8">
      <div className="border-y border-white/10 py-8 sm:py-10">
        <div className="mb-7 max-w-4xl">
          <h2 className="text-2xl font-black text-white sm:text-3xl">Movie Night Guides and Recommendations</h2>
          <p className="mt-3 text-sm leading-7 text-gray-300 sm:text-base">
            Movie Night helps you choose what to stream with useful movie descriptions, genre context, curated recommendations,
            and detail pages that include cast, director, rating, runtime, similar titles, and viewer notes when that information is available.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {guides.map((guide) => (
            <article id={`list-${guide.slug}`} key={guide.title} className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/5 p-5">
              <button
                type="button"
                onClick={() => onGuideSelect(guide.slug)}
                className="text-left text-lg font-bold text-white transition-colors hover:text-red-300"
              >
                {guide.title}
              </button>
              <p className="mt-3 text-sm leading-6 text-gray-300">{guide.description}</p>

              {guide.items.length > 0 ? (
                <ul className="mt-5 space-y-3">
                  {guide.items.map((item) => (
                    <li key={`${guide.title}-${getContentStorageKey(item)}`}>
                      <button
                        type="button"
                        onClick={() => onMovieSelect(item)}
                        className="block w-full rounded-xl border border-white/10 bg-black/30 p-3 text-left transition-colors hover:bg-white/10"
                      >
                        <span className="block text-sm font-semibold text-white">{getContentTitle(item)}</span>
                        <span className="mt-1 block text-xs leading-5 text-gray-400">
                          {getContentYear(item)} | {getGenreNames(item.genre_ids) || 'Movie Night pick'}
                        </span>
                        <span className="mt-2 block text-xs leading-5 text-gray-300">
                          {getContentTitle(item)} is a useful pick for this guide because it matches the mood, genre, or popularity signals viewers often use when choosing what to watch.
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 rounded-xl border border-white/10 bg-black/30 p-3 text-sm leading-6 text-gray-300">
                  {guide.fallback}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
