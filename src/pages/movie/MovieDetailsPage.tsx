import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Heart, 
  Star, 
  Calendar, 
  Clock, 
  Film,
  Share2,
  Download,
  ArrowLeft,
  Plus,
  ThumbsUp,
  MessageCircle
} from 'lucide-react';
import VideoLoadingBanner from '../../components/ui/VideoLoadingBanner';
import Badge from '../../components/common/Badge';
import { getImageUrl, getGenreNames, getVidsrcUrl, type MovieData } from '../../services/movieService';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';

const PLAYER_READY_GRACE_MS = 1800;

interface MovieDetailsPageProps {
  movie: MovieData;
  onClose: () => void;
}

export default function MovieDetailsPage({ movie, onClose }: MovieDetailsPageProps) {
  const { favorites, watchLater, addToFavorites, removeFromFavorites, addToWatchLater, removeFromWatchLater } = useUserPreferences();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const handlePlay = () => {
    if (!movie) return;
    setIsPlayerLoading(true);
    const vidsrcUrl = getVidsrcUrl(movie);
    setPlayerUrl(vidsrcUrl);
    setIsPlaying(true);
  };

  const isFavorite = movie && favorites.some(f => f.id === movie.id);
  const inWatchLater = movie && watchLater.some(w => w.id === movie.id);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md px-4 py-3 flex items-center gap-4">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold truncate">{movie.title}</h1>
      </nav>

      {/* Video Player Section - Full Width at Top */}
      <div className="relative w-full bg-black pt-16">
        {isPlaying && playerUrl ? (
          <div className="relative w-full" style={{ height: '70vh' }}>
            <iframe
              src={playerUrl}
              className="w-full h-full object-contain"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              title="Movie Player"
              referrerPolicy="strict-origin-when-cross-origin"
              loading="eager"
              style={{ border: 'none' }}
              onLoad={() => {
                window.setTimeout(() => setIsPlayerLoading(false), PLAYER_READY_GRACE_MS);
              }}
            />
            
            {/* Close Button */}
            <button
              onClick={() => setIsPlaying(false)}
              className="absolute top-4 right-4 z-[1000] w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              ✕
            </button>

            {/* Loading Banner */}
            <AnimatePresence>
              {isPlayerLoading && (
                <VideoLoadingBanner
                  isLoading={isPlayerLoading}
                  message="Loading a movie player... grab a snack."
                  showConnectionStatus={true}
                />
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="relative w-full" style={{ height: '70vh' }}>
            {/* Background Image */}
            <motion.img
              src={getImageUrl(movie.backdrop_path, 'original')}
              alt={movie.title}
              className="w-full h-full object-cover"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
              onLoad={() => setIsImageLoaded(true)}
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handlePlay}
                disabled={isPlayerLoading}
                className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl hover:bg-gray-100 transition-all disabled:opacity-50"
              >
                {isPlayerLoading ? (
                  <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-8 h-8 text-black fill-black ml-1" />
                )}
              </motion.button>
            </div>
          </div>
        )}
      </div>

      {/* Movie Information Section - Scrollable */}
      <div className="px-4 py-8 max-w-6xl mx-auto">
        {/* Title and Basic Info */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge text="HD" className="bg-white/20 backdrop-blur-md text-white border border-white/30" />
            <Badge text="4K" className="bg-blue-600/80 text-white" />
            <Badge text="DOLBY" className="bg-green-600/80 text-white" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">{movie.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold">{movie.vote_average?.toFixed(1)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{movie.release_date?.split('-')[0]}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>120 min</span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Array.isArray(movie.genre_ids) && movie.genre_ids.map((genreId, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/10 rounded-full text-sm text-gray-300"
              >
                {getGenreNames([genreId])}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all"
          >
            <Play className="w-5 h-5 fill-black" />
            Play Now
          </button>
          
          <button
            onClick={() => isFavorite ? removeFromFavorites(movie.id) : addToFavorites(movie)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              isFavorite 
                ? 'bg-red-600 text-white' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
            {isFavorite ? 'Favorited' : 'Favorite'}
          </button>
          
          <button
            onClick={() => inWatchLater ? removeFromWatchLater(movie.id) : addToWatchLater(movie)}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              inWatchLater 
                ? 'bg-blue-600 text-white' 
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Plus className={`w-5 h-5 ${inWatchLater ? 'fill-white' : ''}`} />
            {inWatchLater ? 'In Watch Later' : 'Watch Later'}
          </button>
          
          <button className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all">
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>

        {/* Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-300 leading-relaxed text-lg">{movie.overview}</p>
        </div>

        {/* Additional Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Film className="w-5 h-5" />
              Movie Details
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Release Date</span>
                <span>{movie.release_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Runtime</span>
                <span>120 minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Language</span>
                <span>English</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rating</span>
                <span>{movie.vote_average?.toFixed(1)}/10</span>
              </div>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5" />
              User Engagement
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Vote Count</span>
                <span>N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Popularity</span>
                <span>N/A</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span>Released</span>
              </div>
            </div>
          </div>
        </div>

        {/* Streaming Info */}
        <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-lg p-6 mb-8 border border-red-500/20">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-400">
            <Play className="w-5 h-5" />
            Streaming Information
          </h3>
          <div className="space-y-2 text-sm text-gray-300">
            <p>• Full movie streaming in HD quality</p>
            <p>• No ads, instant playback</p>
            <p>• Multiple quality options available</p>
            <p>• Works on all devices</p>
          </div>
        </div>
      </div>
    </div>
  );
}
