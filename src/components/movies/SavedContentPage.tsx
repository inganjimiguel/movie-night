import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Grid, List, Play, Search, type LucideIcon } from 'lucide-react';
import ModernMovieCard from './ModernMovieCard';
import ModernMovieDetailsModal from './ModernMovieDetailsModal';
import {
  getContentReleaseDate,
  getContentTitle,
  type MovieData,
} from '../../services/movieService';

const PLAYER_READY_GRACE_MS = 1800;

interface SavedContentPageProps {
  title: string;
  icon: LucideIcon;
  items: MovieData[];
  accent: 'red' | 'green';
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyActionLabel: string;
  statsLabel: (count: number) => string;
  noItemsLabel: string;
  noResultsLabel: string;
  navigateTo?: (path: string) => void;
}

const accentStyles = {
  red: {
    icon: 'text-red-500 fill-red-500',
    active: 'bg-red-600 text-white',
    border: 'focus:border-red-500',
    button: 'bg-red-600 hover:bg-red-700',
    selectedText: 'bg-red-600/20 text-red-300',
  },
  green: {
    icon: 'text-green-500 fill-green-500',
    active: 'bg-green-600 text-white',
    border: 'focus:border-green-500',
    button: 'bg-green-600 hover:bg-green-700',
    selectedText: 'bg-green-600/20 text-green-300',
  },
} as const;

export default function SavedContentPage({
  title,
  icon: Icon,
  items,
  accent,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  statsLabel,
  noItemsLabel,
  noResultsLabel,
  navigateTo,
}: SavedContentPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'rating'>('title');
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);

  const theme = accentStyles[accent];

  const filteredItems = items.filter((movie) =>
    getContentTitle(movie).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return getContentTitle(a).localeCompare(getContentTitle(b));
      case 'date':
        return new Date(getContentReleaseDate(b)).getTime() - new Date(getContentReleaseDate(a)).getTime();
      case 'rating':
        return b.vote_average - a.vote_average;
      default:
        return 0;
    }
  });

  const handleBack = () => {
    if (navigateTo) {
      navigateTo('/');
      return;
    }

    window.history.back();
  };

  const openMovieDetails = (movie: MovieData, shouldAutoplay = false) => {
    setSelectedMovie(movie);
    setIsPlaying(false);
    setPlayerUrl(null);
    setPlayerError(null);
    setIsPlayerLoading(false);

    if (shouldAutoplay) {
      setIsPlayerLoading(true);
      setIsPlaying(true);
      setPlayerUrl(null);
    }
  };

  const closeMovieDetails = () => {
    setSelectedMovie(null);
    setIsPlaying(false);
    setPlayerUrl(null);
    setPlayerError(null);
    setIsPlayerLoading(false);
  };

  const playMovie = () => {
    if (!selectedMovie) return;

    setPlayerError(null);
    setIsPlayerLoading(true);
    setPlayerUrl(null);
    setIsPlaying(true);
  };

  const handlePlayerReady = () => {
    window.setTimeout(() => {
      setIsPlayerLoading(false);
    }, PLAYER_READY_GRACE_MS);
  };

  return (
    <div className="min-h-screen bg-black px-3 pb-16 pt-18 text-white sm:px-6 sm:pt-20 lg:px-8">
      <div className="rounded-[32px] border border-white/10 bg-black/55 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-5 w-5 text-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Icon className={`h-6 w-6 ${theme.icon}`} />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">{title}</h1>
                  <p className="text-sm text-gray-400">{items.length === 0 ? noItemsLabel : statsLabel(items.length)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className={`w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none ${theme.border}`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'title' | 'date' | 'rating')}
                className={`rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none ${theme.border}`}
              >
                <option value="title">Sort by Title</option>
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
              </select>

              <div className="flex rounded-2xl border border-white/15 bg-white/5 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded-xl p-2 transition-colors ${viewMode === 'grid' ? theme.active : 'text-gray-400 hover:text-white'}`}
                  aria-label="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded-xl p-2 transition-colors ${viewMode === 'list' ? theme.active : 'text-gray-400 hover:text-white'}`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {items.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-black/45 px-6 py-16 text-center shadow-2xl shadow-black/25 backdrop-blur-xl">
            <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${theme.selectedText}`}>
              <Icon className="h-10 w-10" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-white">{emptyTitle}</h2>
            <p className="mx-auto mb-8 max-w-md text-gray-400">{emptyDescription}</p>
            <button
              onClick={handleBack}
              className={`rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors ${theme.button}`}
            >
              {emptyActionLabel}
            </button>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-black/45 px-6 py-16 text-center shadow-2xl shadow-black/25 backdrop-blur-xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
              <Search className="h-10 w-10 text-gray-500" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-white">No results found</h2>
            <p className="mb-6 text-gray-400">{noResultsLabel.replace('{query}', searchQuery)}</p>
            <button
              onClick={() => setSearchQuery('')}
              className={`rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors ${theme.button}`}
            >
              Clear Search
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 gap-3 pb-12 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                : 'grid grid-cols-1 justify-items-center gap-5 pb-12 lg:grid-cols-2'
            }
          >
            {sortedItems.map((movie, index) => (
              <motion.div
                key={`${movie.media_type || 'movie'}-${movie.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className={viewMode === 'list' ? 'w-full max-w-[400px]' : ''}
              >
                <div className="space-y-3">
                  <ModernMovieCard
                    movie={movie}
                    layout={viewMode === 'grid' ? 'poster' : 'backdrop'}
                    size="medium"
                    onSelect={(item) => openMovieDetails(item)}
                    autoPreview={false}
                  />
                  <button
                    type="button"
                    onClick={() => openMovieDetails(movie, true)}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-colors ${theme.button}`}
                  >
                    <Play className="h-4 w-4 fill-white" />
                    Play Now
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <ModernMovieDetailsModal
        movie={selectedMovie}
        isPlaying={isPlaying}
        isPlayerLoading={isPlayerLoading}
        playerError={playerError}
        playerUrl={playerUrl}
        relatedMovies={sortedItems.slice(0, 6)}
        onClose={closeMovieDetails}
        onPlay={playMovie}
        onPlayerReady={handlePlayerReady}
      />
    </div>
  );
}
