import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Play, Star } from 'lucide-react';
import Badge from '../common/Badge';
import {
  getContentTypeLabel,
  getContentTitle,
  getContentYear,
  getImageUrl,
  getTrailerUrl,
  isTvLikeContent,
  type MovieData,
} from '../../services/movieService';

interface ModernFeaturedHeroProps {
  movie: MovieData;
  isMuted: boolean;
  onToggleMute: () => void;
  onPlay: () => void;
}

export default function ModernFeaturedHero({
  movie,
  isMuted,
  onToggleMute,
  onPlay,
}: ModernFeaturedHeroProps) {
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [isTrailerLoading, setIsTrailerLoading] = useState(true);
  const [isTrailerVisible, setIsTrailerVisible] = useState(true);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    setTrailerUrl(null);
    setIsTrailerLoading(true);
    setIsIframeReady(false);

    void getTrailerUrl(movie).then((url) => {
      if (cancelled) return;

      if (!url) {
        setTrailerUrl(null);
        setIsTrailerLoading(false);
        return;
      }

      const videoId = extractYoutubeVideoId(url);
      const autoplayUrl = videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=1&playsinline=1&loop=1&playlist=${videoId}&rel=0&modestbranding=1`
        : url;

      setTrailerUrl(autoplayUrl);
      setIsTrailerLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [movie]);

  useEffect(() => {
    const element = heroRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTrailerVisible(entry.isIntersecting && entry.intersectionRatio >= 0.45);
      },
      {
        threshold: [0, 0.45, 0.75],
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const title = getContentTitle(movie);
  const year = getContentYear(movie);
  const contentTypeLabel = getContentTypeLabel(movie);
  const typeLabel = isTvLikeContent(movie) ? 'Series' : contentTypeLabel;
  const playLabel = isTvLikeContent(movie)
    ? 'Play Series'
    : contentTypeLabel === 'Animation'
      ? 'Play Animation'
      : 'Play Now';
  const activeTrailerUrl = trailerUrl && isTrailerVisible ? trailerUrl : null;
  const trailerStatus = useMemo(() => {
    if (isTrailerLoading) return 'Loading trailer preview...';
    if (activeTrailerUrl) return 'Trailer preview is playing.';
    if (trailerUrl) return 'Trailer paused while you are away. It will resume when you come back.';
    return 'Trailer preview not available for this title yet.';
  }, [activeTrailerUrl, isTrailerLoading, trailerUrl]);

  return (
    <section ref={heroRef} className="px-3 sm:px-6 lg:px-8">
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)] lg:gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/55 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:rounded-[32px] sm:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(185,28,28,0.18),_transparent_48%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between gap-6">
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Badge text="FEATURED" className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold tracking-[0.16em] text-white sm:px-3 sm:text-xs sm:tracking-[0.2em]" />
                <Badge text="HD" className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-white sm:px-3 sm:text-xs sm:tracking-[0.2em]" />
                <Badge text={typeLabel.toUpperCase()} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-white sm:px-3 sm:text-xs sm:tracking-[0.2em]" />
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h2 className="break-words text-2xl font-black leading-tight tracking-tight text-white min-[380px]:text-3xl sm:text-5xl sm:leading-[0.95] lg:text-6xl">
                  {title}
                </h2>

                <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-base">
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">{movie.vote_average.toFixed(1)}</span>
                    <span className="text-gray-400">/10</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-gray-300">
                    <Calendar className="h-4 w-4" />
                    <span>{year}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-gray-300">
                    <Clock className="h-4 w-4" />
                    <span>{isTvLikeContent(movie) ? 'Series' : '2h 15min'}</span>
                  </div>
                </div>
              </div>

              <p className="line-clamp-3 max-w-2xl text-sm leading-6 text-gray-300 sm:line-clamp-none sm:text-base sm:leading-7 lg:text-lg">
                {movie.overview}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onPlay}
                className="inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-3 text-sm font-bold text-black shadow-lg shadow-black/30 transition-colors hover:bg-gray-100 sm:w-auto sm:px-8 sm:py-4 sm:text-base"
              >
                <Play className="h-5 w-5 fill-black" />
                <span>{playLabel}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/55 shadow-2xl shadow-black/30 backdrop-blur-xl sm:rounded-[32px]"
        >
          <div className="relative aspect-[16/11] min-h-[220px] w-full bg-black min-[420px]:min-h-[260px] sm:aspect-[16/10] sm:min-h-[280px] lg:min-h-[520px]">
            <img
              src={getImageUrl(movie.backdrop_path || movie.poster_path, 'original')}
              alt={title}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${activeTrailerUrl && isIframeReady ? 'opacity-0' : 'opacity-100'}`}
            />

            {activeTrailerUrl && (
              <iframe
                key={activeTrailerUrl}
                src={activeTrailerUrl}
                title={`${title} featured trailer`}
                className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-500 ${isIframeReady ? 'opacity-100' : 'opacity-0'}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => setIsIframeReady(true)}
              />
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="pointer-events-none absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-xs leading-5 text-gray-200 backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-4 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm">
              {trailerStatus}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function extractYoutubeVideoId(url: string) {
  const matched = url.match(/embed\/([^?&]+)/);
  return matched?.[1] ?? '';
}
