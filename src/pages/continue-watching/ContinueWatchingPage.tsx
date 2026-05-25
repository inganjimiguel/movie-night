import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Clock3, Play, Tv2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useContinueWatching } from '../../contexts/ContinueWatchingContext';
import {
  getContentTitle,
  getContentTypeLabel,
  getContentYear,
  getImageUrl,
  getVideoSourceName,
} from '../../services/movieService';

interface ContinueWatchingPageProps {
  navigateTo?: (path: string) => void;
}

export default function ContinueWatchingPage({ navigateTo }: ContinueWatchingPageProps) {
  const navigate = useNavigate();
  const { entries, markAsWatched, removeEntry } = useContinueWatching();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'rating'>('recent');

  const filteredEntries = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const searchedEntries = normalizedQuery
      ? entries.filter((entry) => getContentTitle(entry.item).toLowerCase().includes(normalizedQuery))
      : entries;

    return [...searchedEntries].sort((a, b) => {
      if (sortBy === 'title') {
        return getContentTitle(a.item).localeCompare(getContentTitle(b.item));
      }
      if (sortBy === 'rating') {
        return b.item.vote_average - a.item.vote_average;
      }
      return new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime();
    });
  }, [entries, searchQuery, sortBy]);

  const handleBack = () => {
    if (navigateTo) {
      navigateTo('/');
      return;
    }

    window.history.back();
  };

  const handleOpenEntry = (entryKey: string, autoplay: boolean) => {
    const entry = entries.find((candidate) => candidate.entryKey === entryKey);
    if (!entry) return;

    window.scrollTo({ top: 0, behavior: 'auto' });
    void navigate('/', {
      state: {
        selectedMovie: entry.item,
        autoplay,
        season: entry.season,
        episode: entry.episode,
        source: entry.lastSource,
      },
    });
  };

  return (
    <div className="min-h-screen bg-black px-3 pb-16 pt-18 text-white sm:px-6 sm:pt-20 lg:px-8">
      <div className="rounded-[32px] border border-white/10 bg-black/55 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
              >
                <X className="h-4 w-4" />
                Back to browse
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10">
                  <Clock3 className="h-6 w-6 text-sky-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">Continue Watching</h1>
                  <p className="text-sm text-gray-400">
                    {entries.length === 0
                      ? 'No in-progress titles saved yet'
                      : `${entries.length} ${entries.length === 1 ? 'title' : 'titles'} ready to resume`}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200">
              Resume points sync across movies, shows, and animations on this device
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search continue watching..."
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-sky-400 focus:outline-none lg:max-w-xl"
            />

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as 'recent' | 'title' | 'rating')}
              className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none"
            >
              <option value="recent">Sort by Recent Activity</option>
              <option value="title">Sort by Title</option>
              <option value="rating">Sort by Rating</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-8">
        {entries.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-black/45 px-6 py-16 text-center shadow-2xl shadow-black/25 backdrop-blur-xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-sky-500/10">
              <Play className="h-10 w-10 text-sky-300" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-white">Nothing to resume yet</h2>
            <p className="mx-auto mb-8 max-w-md text-gray-400">
              Start any movie or episode and it will appear here with its last source and episode details.
            </p>
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
            >
              Browse Titles
            </button>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-black/45 px-6 py-16 text-center shadow-2xl shadow-black/25 backdrop-blur-xl">
            <h2 className="mb-4 text-2xl font-bold text-white">No matching titles</h2>
            <p className="mb-6 text-gray-400">No continue-watching titles match "{searchQuery}".</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-500"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 pb-12 xl:grid-cols-2">
            {filteredEntries.map((entry, index) => (
              <motion.article
                key={entry.entryKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-black/45 shadow-2xl shadow-black/25 backdrop-blur-xl"
              >
                <div className="sm:flex">
                  <button
                    type="button"
                    onClick={() => handleOpenEntry(entry.entryKey, false)}
                    className="relative aspect-[16/10] w-full overflow-hidden sm:w-[260px] sm:flex-shrink-0"
                  >
                    <img
                      src={getImageUrl(entry.item.backdrop_path || entry.item.poster_path, 'original')}
                      alt={getContentTitle(entry.item)}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10" />
                    <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs text-white backdrop-blur-md">
                      {getContentTypeLabel(entry.item)}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 text-left">
                      <p className="text-lg font-bold text-white">{getContentTitle(entry.item)}</p>
                      <p className="text-sm text-gray-200">
                        {entry.isSeries
                          ? `S${entry.season ?? 1} • E${entry.episode ?? 1}`
                          : `${getContentYear(entry.item)} • Started`}
                      </p>
                    </div>
                  </button>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-200">
                        {entry.isSeries ? 'TV Resume Point' : 'Movie Resume Point'}
                      </span>
                      <span className="text-sm text-gray-400">{getContentYear(entry.item)}</span>
                    </div>

                    <h2 className="text-xl font-bold text-white">{getContentTitle(entry.item)}</h2>
                    <p className="mt-3 flex-1 text-sm leading-6 text-gray-300">
                      {entry.isSeries
                        ? `Saved at Season ${entry.season ?? 1}, Episode ${entry.episode ?? 1}.`
                        : 'Saved after playback started so it is easy to jump back in.'}
                      {entry.isSeries && entry.latestWatchedSeason && entry.latestWatchedEpisode
                        ? ` Latest watched: S${entry.latestWatchedSeason} E${entry.latestWatchedEpisode}.`
                        : ''}
                      {' '}Last source: {getVideoSourceName(entry.lastSource)}. Last opened {formatLastOpened(entry.lastOpenedAt)}.
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEntry(entry.entryKey, true)}
                        className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Play className="h-4 w-4 fill-black" />
                          Resume
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEntry(entry.entryKey, false)}
                        className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                      >
                        <span className="inline-flex items-center gap-2">
                          {entry.isSeries ? <Tv2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                          Details
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => markAsWatched(entry.entryKey)}
                        className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 transition-colors hover:bg-emerald-500/20"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          Mark Watched
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.entryKey)}
                        className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-gray-200 transition-colors hover:bg-white/10"
                      >
                        <span className="inline-flex items-center gap-2">
                          <X className="h-4 w-4" />
                          Remove
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatLastOpened(value: string) {
  const openedAt = new Date(value);
  const deltaMs = Date.now() - openedAt.getTime();

  if (Number.isNaN(openedAt.getTime())) {
    return 'recently';
  }

  const minutes = Math.floor(deltaMs / 60000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  return openedAt.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
