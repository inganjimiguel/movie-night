import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Play, Star } from 'lucide-react';
import Badge from '../common/Badge';
import {
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
  const [shouldPlayTrailer, setShouldPlayTrailer] = useState(true);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    setTrailerUrl(null);
    setIsTrailerLoading(true);

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
    setIsTrailerVisible(true);
    setShouldPlayTrailer(true);
  }, [movie.id]);

  useEffect(() => {
    const element = heroRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.45;
        setIsTrailerVisible(isVisible);

        if (!isVisible) {
          setShouldPlayTrailer(false);
        }
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
  const playLabel = isTvLikeContent(movie) ? 'Play Series' : 'Play Now';
  const showActiveTrailer = Boolean(trailerUrl) && shouldPlayTrailer && isTrailerVisible;

  return (
    <section ref={heroRef} className="px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/55 shadow-2xl shadow-black/35 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(185,28,28,0.18),_transparent_42%)]" />
        <div className="grid min-h-[540px] lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
          <div className="relative z-10 flex items-center px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <div className="max-w-2xl space-y-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Badge text="FEATURED" className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold tracking-[0.2em] text-white" />
                <Badge text="HD" className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-white" />
                {movie.vote_average > 8 && (
                  <Badge
                    text="TOP PICK"
                    className="rounded-full border border-yellow-400/30 bg-yellow-500/15 px-3 py-1 text-xs font-semibold tracking-[0.18em] text-yellow-100"
                  />
                )}
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-black leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                  {title}
                </h1>

                <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base">
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

              <p className="max-w-xl text-sm leading-7 text-gray-300 sm:text-base lg:text-lg">
                {movie.overview}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onPlay}
                  className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-bold text-black shadow-lg shadow-black/30 transition-colors hover:bg-gray-100 sm:px-8 sm:py-4 sm:text-base"
                >
                  <Play className="h-5 w-5 fill-black" />
                  <span>{playLabel}</span>
                </motion.button>
              </div>
            </div>
          </div>

          <div className="relative min-h-[280px] border-t border-white/10 lg:min-h-full lg:border-l lg:border-t-0">
            <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black/20 to-black/60" />
            {showActiveTrailer ? (
              <iframe
                src={trailerUrl}
                title={`${title} featured trailer`}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className="absolute inset-0">
                <img
                  src={getImageUrl(movie.backdrop_path || movie.poster_path, 'original')}
                  alt={title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {trailerUrl && (
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShouldPlayTrailer(true)}
                      className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-black/65 px-5 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur-md hover:bg-black/75"
                    >
                      <Play className="h-4 w-4 fill-white" />
                      <span>{isTrailerVisible ? 'Play Trailer' : 'Resume Trailer'}</span>
                    </motion.button>
                  </div>
                )}
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-black/25 lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-black/70" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-gray-200 backdrop-blur-md">
              {isTrailerLoading
                ? 'Loading trailer preview...'
                : showActiveTrailer
                  ? 'Featured trailer is playing with YouTube controls.'
                  : trailerUrl
                    ? 'Trailer paused after leaving the screen. Press the button to play it again.'
                    : 'Trailer preview not available for this title yet.'}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function extractYoutubeVideoId(url: string) {
  const matched = url.match(/embed\/([^?&]+)/);
  return matched?.[1] ?? '';
}
