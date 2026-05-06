import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Grid, List, Search, Star, type LucideIcon } from 'lucide-react';
import {
  getContentReleaseDate,
  getContentTitle,
  getContentTypeLabel,
  getContentYear,
  getImageUrl,
  type MovieData,
} from '../../services/movieService';

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
    badge: 'bg-red-600/15 text-red-200 border-red-500/30',
  },
  green: {
    icon: 'text-green-500 fill-green-500',
    active: 'bg-green-600 text-white',
    border: 'focus:border-green-500',
    button: 'bg-green-600 hover:bg-green-700',
    selectedText: 'bg-green-600/20 text-green-300',
    badge: 'bg-green-600/15 text-green-200 border-green-500/30',
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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'rating'>('title');

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

  const handleToMovie = (movie: MovieData) => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    void navigate('/', {
      state: {
        selectedMovie: movie,
        autoplay: false,
      },
    });
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
                ? 'grid grid-cols-1 gap-5 pb-12 sm:grid-cols-2 xl:grid-cols-3'
                : 'grid grid-cols-1 gap-5 pb-12 lg:grid-cols-2'
            }
          >
            {sortedItems.map((movie, index) => (
              <motion.article
                key={`${movie.media_type || 'movie'}-${movie.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-black/45 shadow-2xl shadow-black/25 backdrop-blur-xl"
              >
                <div className={viewMode === 'grid' ? '' : 'sm:flex'}>
                  <div className={viewMode === 'grid' ? 'aspect-[16/9] w-full' : 'aspect-[3/4] w-full sm:w-[220px] sm:flex-shrink-0'}>
                    <img
                      src={getImageUrl(viewMode === 'grid' ? (movie.backdrop_path || movie.poster_path) : movie.poster_path || movie.backdrop_path, 'original')}
                      alt={getContentTitle(movie)}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${theme.badge}`}>
                        {getContentTypeLabel(movie)}
                      </span>
                      <span className="text-sm text-gray-400">{getContentYear(movie)}</span>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-300">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white">{getContentTitle(movie)}</h2>
                    <p className="mt-3 flex-1 text-sm leading-6 text-gray-300">
                      {movie.overview || 'No description available for this title yet.'}
                    </p>

                    <div className="mt-5">
                      <button
                        onClick={() => handleToMovie(movie)}
                        className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition-colors shadow-lg ${theme.button}`}
                      >
                        To Movie
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
