import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Clock, Film, Heart, Play, Sparkles, Star, Tv2 } from 'lucide-react';
import Badge from '../common/Badge';
import {
  getContentTitle,
  getContentTypeLabel,
  getContentYear,
  getImageUrl,
  getTrailerUrl,
  type MovieData,
} from '../../services/movieService';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';

interface ModernMovieCardProps {
  movie: MovieData;
  layout?: 'poster' | 'backdrop';
  size?: 'small' | 'medium' | 'large';
  onSelect: (movie: MovieData) => void;
  showPlayButton?: boolean;
  className?: string;
  previewDelayMs?: number;
  autoPreview?: boolean;
}

const sizeConfig = {
  small: {
    poster: 'w-[120px] h-[180px]',
    backdrop: 'w-[200px] h-[112px]',
    titleSize: 'text-xs',
  },
  medium: {
    poster: 'w-[160px] h-[240px] sm:w-[200px] sm:h-[300px]',
    backdrop: 'w-[300px] h-[169px] sm:w-[400px] sm:h-[225px]',
    titleSize: 'text-sm sm:text-base',
  },
  large: {
    poster: 'w-[200px] h-[300px] sm:w-[240px] sm:h-[360px]',
    backdrop: 'w-[400px] h-[225px] sm:w-[500px] sm:h-[281px]',
    titleSize: 'text-base sm:text-lg',
  },
} as const;

const contentTypeStyles = {
  Movie: {
    icon: Film,
    className: 'bg-red-600/90 text-white border border-red-400/40',
  },
  'TV Show': {
    icon: Tv2,
    className: 'bg-sky-600/90 text-white border border-sky-400/40',
  },
  Animation: {
    icon: Sparkles,
    className: 'bg-amber-500/90 text-black border border-amber-300/50',
  },
} as const;

export default function ModernMovieCard({
  movie,
  layout = 'poster',
  size = 'medium',
  onSelect,
  className = '',
  previewDelayMs = 800,
  autoPreview = true,
}: ModernMovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [previewRect, setPreviewRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const hoverTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const { addToFavorites, addToWatchLater, isFavorite, isWatchLater } = useUserPreferences();

  const config = sizeConfig[size];
  const imagePath = layout === 'poster' ? movie.poster_path : movie.backdrop_path;
  const title = getContentTitle(movie);
  const year = getContentYear(movie);
  const contentType = getContentTypeLabel(movie);
  const ContentTypeIcon = contentTypeStyles[contentType].icon;
  const liked = isFavorite(movie.id);
  const inWatchLater = isWatchLater(movie.id);

  const clearTimers = () => {
    if (hoverTimerRef.current) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const positionPreview = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const previewWidth = Math.min(420, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - previewWidth / 2), window.innerWidth - previewWidth - 12);
    const top = Math.max(12, rect.top - 250);
    setPreviewRect({ top, left, width: previewWidth });
  };

  const openPreview = () => {
    positionPreview();
    setShowPreview(true);
    setTrailerUrl(null);
    setIsLoadingTrailer(true);
    void getTrailerUrl(movie).then((url) => {
      setTrailerUrl(url);
      setIsLoadingTrailer(false);
    });
  };

  const schedulePreview = () => {
    if (!autoPreview) return;
    clearTimers();
    setIsHovered(true);
    hoverTimerRef.current = window.setTimeout(() => {
      openPreview();
    }, previewDelayMs);
  };

  const closePreview = () => {
    clearTimers();
    setIsHovered(false);
    setShowPreview(false);
    setIsLoadingTrailer(false);
  };

  const scheduleHide = () => {
    clearTimers();
    hideTimerRef.current = window.setTimeout(() => {
      closePreview();
    }, 120);
  };

  const isInsideCardOrPreview = (target: EventTarget | null) => {
    if (!(target instanceof Node)) return false;

    return Boolean(
      cardRef.current?.contains(target) ||
      previewRef.current?.contains(target)
    );
  };

  const handlePointerEnter = () => {
    schedulePreview();
  };

  const handlePointerLeave = (event: React.MouseEvent<HTMLElement>) => {
    if (isInsideCardOrPreview(event.relatedTarget)) {
      clearTimers();
      return;
    }

    scheduleHide();
  };

  useEffect(() => {
    if (!showPreview) return;

    const handleResize = () => positionPreview();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [showPreview]);

  useEffect(() => () => clearTimers(), []);

  return (
    <>
      <motion.button
        ref={cardRef}
        type="button"
        className={`relative ${config[layout]} ${layout === 'poster' ? 'aspect-[2/3]' : 'aspect-video'} group text-left ${className}`}
        whileHover={{ scale: layout === 'poster' ? 1.04 : 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onMouseEnter={handlePointerEnter}
        onMouseLeave={handlePointerLeave}
        onFocus={schedulePreview}
        onBlur={scheduleHide}
        onClick={() => onSelect(movie)}
        aria-label={`Open ${contentType.toLowerCase()} ${title}`}
        layout
      >
        <div className="relative h-full w-full overflow-hidden rounded-xl shadow-lg shadow-black/30">
          {!imageError ? (
            <img
              src={getImageUrl(imagePath)}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
              <div className="text-center">
                <Film className="mx-auto mb-2 h-10 w-10 text-gray-500" />
                <p className="text-xs text-gray-400">No image</p>
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/10" />

          <div className="absolute left-2 top-2 z-20">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-lg backdrop-blur-md ${contentTypeStyles[contentType].className}`}
              title={contentType}
            >
              <ContentTypeIcon className="h-3.5 w-3.5" />
              <span>{contentType}</span>
            </div>
          </div>

          <div className="absolute right-2 top-2 z-20 flex gap-1.5">
            <Badge text="HD" className="border border-white/15 bg-black/40 px-2 py-1 text-xs text-white backdrop-blur-md" />
            {movie.vote_average > 7 && <Badge text="TOP" className="bg-red-600/75 px-2 py-1 text-xs text-white" />}
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4"
              >
                <div className="rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-md">
                  <h3 className={`line-clamp-2 font-bold text-white ${config.titleSize}`}>{title}</h3>
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-200 sm:text-sm">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                      <span>{movie.vote_average.toFixed(1)}</span>
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{year}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {size === 'large' && !isHovered && (
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
              <div className="rounded-2xl bg-black/35 p-3 backdrop-blur-sm">
                <h3 className={`line-clamp-1 font-bold text-white ${config.titleSize}`}>{title}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-200 sm:text-sm">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  <span>{movie.vote_average.toFixed(1)}</span>
                  <span className="text-gray-400">•</span>
                  <span>{year}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.button>

      {showPreview && previewRect
        ? createPortal(
            <motion.div
              ref={previewRef}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="fixed z-[1200] overflow-hidden rounded-3xl border border-white/10 bg-black/88 shadow-2xl shadow-black/70 backdrop-blur-xl"
              style={{ top: previewRect.top, left: previewRect.left, width: previewRect.width }}
              onMouseEnter={handlePointerEnter}
              onMouseLeave={handlePointerLeave}
            >
              <div className="relative aspect-video bg-black">
                {trailerUrl ? (
                  <iframe
                    src={trailerUrl}
                    title={`${title} trailer preview`}
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative h-full w-full">
                    <img src={getImageUrl(movie.backdrop_path || movie.poster_path, 'original')} alt={title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full border border-white/15 bg-black/45 px-4 py-2 text-sm text-white backdrop-blur-md">
                        {isLoadingTrailer ? 'Loading trailer preview...' : 'Trailer preview not available'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge text={contentType} className="bg-white/10 text-white border border-white/15" />
                    <span className="inline-flex items-center gap-1 text-sm text-gray-200">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      {movie.vote_average.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-400">• {year}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-300">{movie.overview}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(movie);
                    }}
                    className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-100"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Play className="h-4 w-4 fill-black" />
                      Play
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      addToFavorites(movie);
                    }}
                    className={`rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                      liked ? 'border-red-500 bg-red-600/20 text-red-300' : 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                      {liked ? 'Liked' : 'Like'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      addToWatchLater(movie);
                    }}
                    className={`rounded-xl border px-4 py-2.5 text-sm transition-colors ${
                      inWatchLater ? 'border-green-500 bg-green-600/20 text-green-300' : 'border-white/15 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {inWatchLater ? 'Saved' : 'Watch Later'}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>,
            document.body
          )
        : null}
    </>
  );
}
