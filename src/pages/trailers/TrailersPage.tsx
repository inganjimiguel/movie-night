import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Star, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { getTrailers, getVidsrcUrl, getImageUrl, type TrailerData, type MovieData } from '../../services/movieService';
import ModernMovieDetailsModal from '../../components/movies/ModernMovieDetailsModal';

interface TrailersPageProps {
  navigateTo?: (path: string) => void;
}

const PLAYER_READY_GRACE_MS = 1800;

export default function TrailersPage({ navigateTo }: TrailersPageProps = {}) {
  const [trailers, setTrailers] = useState<TrailerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Movie details modal state
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);
  const [isModalPlaying, setIsModalPlaying] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        const data = await getTrailers();
        setTrailers(data);
      } catch (error) {
        console.error('Error fetching trailers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrailers();
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < trailers.length) {
      setCurrentIndex(newIndex);
      setIsPlaying(false);
    }
  };

  const handleWatchNow = (trailer: TrailerData) => {
    // Convert TrailerData to MovieData format for the modal
    const movieData: MovieData = {
      id: trailer.id,
      title: trailer.title,
      overview: trailer.overview,
      poster_path: trailer.poster_path,
      backdrop_path: trailer.backdrop_path,
      release_date: trailer.release_date,
      vote_average: trailer.vote_average,
      genre_ids: []
    };
    setSelectedMovie(movieData);
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
    if (selectedMovie) {
      setIsModalPlaying(true);
      setIsPlayerLoading(true);
      setPlayerError(null);
      setPlayerUrl(getVidsrcUrl(selectedMovie));
    }
  };

  const handlePlayerReady = () => {
    window.setTimeout(() => {
      setIsPlayerLoading(false);
    }, PLAYER_READY_GRACE_MS);
  };

  const handlePlayTrailer = (trailer: TrailerData) => {
    setIsPlaying(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative">
        <button
          onClick={() => navigateTo ? navigateTo('/') : window.history.back()}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-50"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Loading trailers...</p>
        </div>
      </div>
    );
  }

  if (trailers.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative">
        <button
          onClick={() => navigateTo ? navigateTo('/') : window.history.back()}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-50"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <p className="text-white text-xl">No trailers available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header - Hidden when playing */}
      {!isPlaying && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Trailers</h1>
              <p className="text-gray-400 text-sm">Swipe to discover</p>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Close Button - Always visible */}
      <button
        onClick={() => navigateTo ? navigateTo('/') : window.history.back()}
        className="fixed top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors z-50"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      {/* Reel Container */}
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
        onScroll={handleScroll}
        style={{ scrollBehavior: 'smooth' }}
      >
        {trailers.map((trailer, index) => (
          <div
            key={trailer.id}
            className="h-screen w-full snap-start relative flex items-center justify-center bg-black"
          >
            {/* Video Player */}
            <div className="relative w-full h-full">
              {isPlaying && currentIndex === index ? (
                <>
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${trailer.videos[0].key}?autoplay=1&rel=0&modestbranding=1&controls=1`}
                    className="w-full h-full object-cover"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={trailer.title}
                  />
                </>
              ) : (
                <>
                  {/* Thumbnail */}
                  <img
                    src={getImageUrl(trailer.backdrop_path, 'original')}
                    alt={trailer.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  
                  {/* Play Button */}
                  <button
                    onClick={() => handlePlayTrailer(trailer)}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-20 h-20 rounded-full bg-red-600/90 backdrop-blur-sm flex items-center justify-center shadow-2xl"
                    >
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </motion.div>
                  </button>
                </>
              )}

              {/* Movie Info Overlay - Always visible, more transparent when playing */}
              <div className={`absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300 ${isPlaying ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}>
                <div className="max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold text-white mb-2">{trailer.title}</h2>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-white text-sm">{trailer.vote_average.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">{trailer.release_date?.split('-')[0]}</span>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm line-clamp-2 mb-4">{trailer.overview}</p>

                  {/* Watch Now Button - Transparent by default, visible on hover */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleWatchNow(trailer)}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600/30 backdrop-blur-sm text-white font-bold rounded-full hover:bg-red-600 transition-all duration-300"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    Watch Now
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Indicator - Hidden when playing */}
      {!isPlaying && (
        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
          {trailers.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-red-600 w-2 h-8' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      )}

      {/* Movie Details Modal */}
      <AnimatePresence>
        {selectedMovie && (
          <ModernMovieDetailsModal
            movie={selectedMovie}
            isPlaying={isModalPlaying}
            isPlayerLoading={isPlayerLoading}
            playerError={playerError}
            playerUrl={playerUrl}
            relatedMovies={[]}
            onClose={handleCloseModal}
            onPlay={handlePlayMovie}
            onPlayerReady={handlePlayerReady}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
