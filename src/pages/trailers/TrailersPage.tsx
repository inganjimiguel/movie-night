import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Calendar, Loader2, Play, Sparkles, Star, Tv2, X } from 'lucide-react';
import ModernMovieDetailsModal from '../../components/movies/ModernMovieDetailsModal';
import {
  getContentReleaseDate,
  getContentTitle,
  getContentTypeLabel,
  getContentYear,
  getImageUrl,
  getTrailerUrl,
  getBrowseContentCatalog,
  getVidsrcUrl,
  DEFAULT_VIDEO_SOURCE,
  type ContentData,
  type MovieData,
  type VideoSource,
} from '../../services/movieService';

interface TrailersPageProps {
  navigateTo?: (path: string) => void;
}

const PLAYER_READY_GRACE_MS = 1800;

const contentTypeStyles = {
  Movie: {
    icon: Play,
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

export default function TrailersPage({ navigateTo }: TrailersPageProps = {}) {
  const [items, setItems] = useState<ContentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState<string | null>(null);
  const [loadingTrailerId, setLoadingTrailerId] = useState<number | null>(null);
  const [trailerMessage, setTrailerMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);
  const [isModalPlaying, setIsModalPlaying] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<VideoSource>(DEFAULT_VIDEO_SOURCE);

  useEffect(() => {
    const fetchAllContent = async () => {
      try {
        const data = await getBrowseContentCatalog();
        const combined = [...data.movies, ...data.tvShows, ...data.animations];
        setItems(combined);
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchAllContent();
  }, []);

  const resetActiveTrailerState = () => {
    setIsPlaying(false);
    setCurrentTrailerUrl(null);
    setLoadingTrailerId(null);
    setTrailerMessage(null);
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / itemHeight);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < items.length) {
      setCurrentIndex(newIndex);
      resetActiveTrailerState();
    }
  };

  const toMovieData = (item: ContentData): MovieData => ({
    id: item.id,
    title: getContentTitle(item),
    name: item.name,
    overview: item.overview,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    release_date: getContentReleaseDate(item),
    first_air_date: item.first_air_date,
    vote_average: item.vote_average,
    genre_ids: item.genre_ids || [],
    media_type: item.media_type,
  });

  const handleWatchNow = (item: ContentData) => {
    setSelectedMovie(toMovieData(item));
    setIsModalPlaying(false);
    setPlayerUrl(null);
    setPlayerError(null);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
    setIsModalPlaying(false);
    setPlayerUrl(null);
    setPlayerError(null);
  };

  const handlePlayMovie = () => {
    if (!selectedMovie) return;

    setIsModalPlaying(true);
    setIsPlayerLoading(true);
    setPlayerError(null);
    setPlayerUrl(getVidsrcUrl(selectedMovie, 1, 1, currentSource));
  };

  const handlePlayerReady = () => {
    window.setTimeout(() => {
      setIsPlayerLoading(false);
    }, PLAYER_READY_GRACE_MS);
  };

  const handlePlayTrailer = async (item: ContentData, index: number) => {
    setLoadingTrailerId(item.id);
    setTrailerMessage(null);

    try {
      const trailerUrl = await getTrailerUrl(item);

      if (index !== currentIndex) {
        return;
      }

      if (trailerUrl) {
        setCurrentTrailerUrl(trailerUrl);
        setIsPlaying(true);
        return;
      }

      setCurrentTrailerUrl(null);
      setIsPlaying(false);
      setTrailerMessage('Trailer not available yet for this upcoming release.');
    } catch (error) {
      console.error('Error loading trailer:', error);
      setCurrentTrailerUrl(null);
      setIsPlaying(false);
      setTrailerMessage('We could not load the trailer right now.');
    } finally {
      setLoadingTrailerId(null);
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-black">
        <button
          onClick={() => (navigateTo ? navigateTo('/') : window.history.back())}
          className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5 text-white" />
        </button>
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-red-600" />
          <p className="text-xl text-white">Loading trailers...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-black">
        <button
          onClick={() => (navigateTo ? navigateTo('/') : window.history.back())}
          className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5 text-white" />
        </button>
        <p className="text-xl text-white">No trailers available right now.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <button
        onClick={() => (navigateTo ? navigateTo('/') : window.history.back())}
        className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5 text-white" />
      </button>

      <div className="pointer-events-none fixed left-4 top-4 z-40 rounded-full border border-white/10 bg-black/55 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
        Trailers
      </div>

      <div
        ref={containerRef}
        className="h-screen snap-y snap-mandatory overflow-y-scroll scroll-smooth"
        onScroll={handleScroll}
        style={{ scrollBehavior: 'smooth' }}
      >
        {items.map((item, index) => {
          const title = getContentTitle(item);
          const contentType = getContentTypeLabel(item);
          const ContentTypeIcon = contentTypeStyles[contentType].icon;

          return (
            <div
              key={`${contentType}-${item.id}`}
              className="relative flex h-screen w-full snap-start items-center justify-center bg-black"
            >
              <div className="relative h-full w-full">
                {isPlaying && currentIndex === index && currentTrailerUrl ? (
                  <iframe
                    src={currentTrailerUrl}
                    className="h-full w-full border-0 object-cover"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={`${title} trailer`}
                  />
                ) : (
                  <>
                    <img
                      src={getImageUrl(item.backdrop_path || item.poster_path, 'original')}
                      alt={title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
                    <button
                      onClick={() => void handlePlayTrailer(item, index)}
                      disabled={loadingTrailerId === item.id}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600/90 shadow-2xl backdrop-blur-sm"
                      >
                        {loadingTrailerId === item.id ? (
                          <Loader2 className="h-8 w-8 animate-spin text-white" />
                        ) : (
                          <Play className="ml-1 h-8 w-8 fill-white text-white" />
                        )}
                      </motion.div>
                    </button>
                  </>
                )}

                <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 transition-opacity duration-300 ${isPlaying ? 'opacity-35 hover:opacity-100' : 'opacity-100'}`}>
                  <div className="mx-auto max-w-4xl">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-md ${contentTypeStyles[contentType].className}`}>
                        <ContentTypeIcon className="h-3.5 w-3.5" />
                        <span>{contentType}</span>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-200">
                        <Calendar className="h-4 w-4" />
                        <span>{getContentReleaseDate(item) || getContentYear(item)}</span>
                      </div>
                    </div>

                    <h2 className="mb-2 text-3xl font-black text-white sm:text-4xl">{title}</h2>

                    <div className="mb-3 flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-white">{item.vote_average.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-gray-400">{getContentYear(item)}</span>
                    </div>

                    <p className="mb-4 max-w-3xl text-sm text-gray-300 sm:text-base">{item.overview}</p>

                    {trailerMessage && currentIndex === index && (
                      <p className="mb-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-gray-200 backdrop-blur-md">
                        {trailerMessage}
                      </p>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleWatchNow(item)}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-black transition-colors hover:bg-gray-100"
                    >
                      <Play className="h-5 w-5 fill-black" />
                      Play Now
                      <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed right-4 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-2">
        {items.map((_, index) => (
          <div
            key={index}
            className={`rounded-full transition-all ${index === currentIndex ? 'h-8 w-2 bg-red-600' : 'h-2 w-2 bg-gray-600'}`}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedMovie && (
          <ModernMovieDetailsModal
            movie={selectedMovie}
            isPlaying={isModalPlaying}
            isPlayerLoading={isPlayerLoading}
            playerError={playerError}
            playerUrl={playerUrl}
            relatedMovies={[]}
            currentSource={currentSource}
            onClose={handleCloseModal}
            onPlay={handlePlayMovie}
            onSourceChange={(source, season, episode) => {
              setCurrentSource(source);
              if (selectedMovie) {
                setPlayerUrl(getVidsrcUrl(selectedMovie, season ?? 1, episode ?? 1, source));
                setIsModalPlaying(true);
                setIsPlayerLoading(true);
              }
            }}
            onPlayerReady={handlePlayerReady}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
