import { Check, Clock3, Film, Play, Tv2, X } from 'lucide-react';
import {
  getContentTitle,
  getContentTypeLabel,
  getContentYear,
  getImageUrl,
  getVideoSourceName,
} from '../../services/movieService';
import type { ContinueWatchingEntry } from '../../contexts/ContinueWatchingContext';

interface ContinueWatchingRailProps {
  entries: ContinueWatchingEntry[];
  onResume: (entry: ContinueWatchingEntry) => void;
  onOpenDetails: (entry: ContinueWatchingEntry) => void;
  onRemove: (entry: ContinueWatchingEntry) => void;
  onMarkWatched: (entry: ContinueWatchingEntry) => void;
}

export default function ContinueWatchingRail({
  entries,
  onResume,
  onOpenDetails,
  onRemove,
  onMarkWatched,
}: ContinueWatchingRailProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-black/45 px-5 py-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Clock3 className="h-6 w-6 text-sky-400" />
                <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">Continue Watching</h2>
              </div>
              <p className="max-w-2xl text-sm text-gray-400 sm:text-base">
                Jump back into the titles you already started, with your last source and episode ready to go.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200">
              {entries.length} {entries.length === 1 ? 'title' : 'titles'} in progress
            </div>
          </div>
        </div>
      </div>

      <div
        className="flex gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {entries.map((entry) => {
          const title = getContentTitle(entry.item);
          const contentType = getContentTypeLabel(entry.item);
          const isSeries = entry.isSeries;
          const typeLabel = isSeries ? 'TV resume point' : 'Movie resume point';
          const progressLabel = isSeries
            ? `Season ${entry.season ?? 1}, Episode ${entry.episode ?? 1}`
            : 'Started movie';
          const latestWatchedLabel = isSeries && entry.latestWatchedSeason && entry.latestWatchedEpisode
            ? `Latest watched S${entry.latestWatchedSeason} E${entry.latestWatchedEpisode}`
            : null;
          const Icon = isSeries ? Tv2 : Film;

          return (
            <article
              key={entry.entryKey}
              className="min-w-[280px] max-w-[320px] flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-xl shadow-black/25"
            >
              <button
                type="button"
                onClick={() => onOpenDetails(entry)}
                className="group relative block h-[180px] w-full overflow-hidden text-left"
                aria-label={`Open ${title} details`}
              >
                <img
                  src={getImageUrl(entry.item.backdrop_path || entry.item.poster_path, 'original')}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/15" />
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-xs text-white backdrop-blur-md">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{contentType}</span>
                </div>
                <div className="absolute right-4 top-4 rounded-full bg-sky-500/90 px-3 py-1 text-xs font-medium text-white">
                  {typeLabel}
                </div>
                <div className="absolute inset-x-4 bottom-4">
                  <p className="text-xl font-black text-white">{title}</p>
                  <p className="mt-1 text-sm text-gray-200">
                    {getContentYear(entry.item)} {isSeries ? `• ${progressLabel}` : '• Ready to resume'}
                  </p>
                </div>
              </button>

              <div className="space-y-4 p-4">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-gray-200">
                  <p className="font-medium text-white">{progressLabel}</p>
                  <p className="mt-1 text-gray-400">Last source: {getVideoSourceName(entry.lastSource)}</p>
                  {latestWatchedLabel ? <p className="mt-1 text-gray-400">{latestWatchedLabel}</p> : null}
                  <p className="mt-1 text-gray-400">Last opened {formatLastOpened(entry.lastOpenedAt)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onResume(entry)}
                    className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Play className="h-4 w-4 fill-black" />
                      Resume
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDetails(entry)}
                    className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Details
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onMarkWatched(entry)}
                    className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 transition-colors hover:bg-emerald-500/20"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Mark Watched
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(entry)}
                    className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-gray-200 transition-colors hover:bg-white/10"
                  >
                    <span className="inline-flex items-center gap-2">
                      <X className="h-4 w-4" />
                      Remove
                    </span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
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
