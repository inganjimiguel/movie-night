import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Clock, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play,
  Star,
  Calendar,
  Film,
  Clapperboard
} from 'lucide-react';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import type { MovieData } from '../../services/movieService';
import { getContentTitle, getContentTypeLabel, getContentYear, getVidsrcUrl } from '../../services/movieService';

interface SophisticatedSidePanelsProps {
  navigateTo?: (path: string) => void;
}

export default function SophisticatedSidePanels({ navigateTo }: SophisticatedSidePanelsProps = {}) {
  const [activePanel, setActivePanel] = useState<'favorites' | 'watchlater' | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerUrl, setPlayerUrl] = useState('');
  const [hoveredButton, setHoveredButton] = useState<'favorites' | 'watchlater' | 'trailers' | null>(null);
  const { favorites, watchLater } = useUserPreferences();

  const handleNavigateToTrailers = () => {
    if (navigateTo) {
      navigateTo('/trailers');
    }
  };

  const currentItems = activePanel === 'favorites' ? favorites : watchLater;
  const currentItem = currentItems[currentIndex];

  const handlePlay = async (movie: MovieData) => {
    try {
      const url = getVidsrcUrl(movie);
      setPlayerUrl(url);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing movie:', error);
    }
  };

  const closePlayer = () => {
    setIsPlaying(false);
    setPlayerUrl('');
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + currentItems.length) % currentItems.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % currentItems.length);
  };

  const closePanel = () => {
    setActivePanel(null);
    setCurrentIndex(0);
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div className="fixed left-1 top-1/2 z-40 -translate-y-1/2">
        <div className="relative flex items-center">
          <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-black/65 p-1.5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:left-2 sm:gap-2 sm:p-2">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActivePanel('favorites')}
                onHoverStart={() => setHoveredButton('favorites')}
                onHoverEnd={() => setHoveredButton(null)}
                onFocus={() => setHoveredButton('favorites')}
                onBlur={() => setHoveredButton(null)}
                className={`flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-all sm:h-10 sm:w-10 lg:h-11 lg:w-11 ${
                  activePanel === 'favorites'
                    ? 'bg-red-600 text-white'
                    : 'bg-black/80 backdrop-blur-md text-white border border-white/20 hover:bg-red-600/80'
                }`}
                aria-label="Favorites"
                title="Favorites"
              >
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
                {favorites.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white sm:h-4.5 sm:w-4.5">
                    {favorites.length}
                  </span>
                )}
              </motion.button>
              <AnimatePresence>
                {hoveredButton === 'favorites' && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-12 top-1/2 hidden -translate-y-1/2 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-black shadow-lg sm:block"
                  >
                    My Favorites
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setActivePanel('watchlater')}
                onHoverStart={() => setHoveredButton('watchlater')}
                onHoverEnd={() => setHoveredButton(null)}
                onFocus={() => setHoveredButton('watchlater')}
                onBlur={() => setHoveredButton(null)}
                className={`flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition-all sm:h-10 sm:w-10 lg:h-11 lg:w-11 ${
                  activePanel === 'watchlater'
                    ? 'bg-green-600 text-white'
                    : 'bg-black/80 backdrop-blur-md text-white border border-white/20 hover:bg-green-600/80'
                }`}
                aria-label="Watch later"
                title="Watch later"
              >
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                {watchLater.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white sm:h-4.5 sm:w-4.5">
                    {watchLater.length}
                  </span>
                )}
              </motion.button>
              <AnimatePresence>
                {hoveredButton === 'watchlater' && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-12 top-1/2 hidden -translate-y-1/2 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-black shadow-lg sm:block"
                  >
                    Watch Later
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNavigateToTrailers}
                onHoverStart={() => setHoveredButton('trailers')}
                onHoverEnd={() => setHoveredButton(null)}
                onFocus={() => setHoveredButton('trailers')}
                onBlur={() => setHoveredButton(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/80 text-white shadow-lg transition-all hover:bg-purple-600/80 sm:h-10 sm:w-10 lg:h-11 lg:w-11"
                aria-label="Trailers"
                title="Trailers"
              >
                <Clapperboard className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>
              <AnimatePresence>
                {hoveredButton === 'trailers' && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-12 top-1/2 hidden -translate-y-1/2 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-black shadow-lg sm:block"
                  >
                    Trailers
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panels */}
      <AnimatePresence>
        {activePanel && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePanel}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-black/95 backdrop-blur-xl border-l border-white/10 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activePanel === 'favorites' ? 'bg-red-600' : 'bg-green-600'
                    }`}>
                      {activePanel === 'favorites' ? (
                        <Heart className="w-5 h-5 text-white" />
                      ) : (
                        <Clock className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {activePanel === 'favorites' ? 'My Favorites' : 'Watch Later'}
                      </h2>
                      <p className="text-gray-400 text-sm">
                        {currentItems.length} {currentItems.length === 1 ? 'title' : 'titles'}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={closePanel}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {currentItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 px-6">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                      activePanel === 'favorites' ? 'bg-red-600/20' : 'bg-green-600/20'
                    }`}>
                      {activePanel === 'favorites' ? (
                        <Heart className="w-10 h-10 text-red-600" />
                      ) : (
                        <Clock className="w-10 h-10 text-green-600" />
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {activePanel === 'favorites' ? 'No favorites yet' : 'Nothing to watch later'}
                    </h3>
                    <p className="text-gray-400 text-center mb-6">
                      {activePanel === 'favorites' 
                        ? 'Start adding movies to your favorites to see them here'
                        : 'Add movies to your watch later list to see them here'
                      }
                    </p>
                    <button
                      onClick={closePanel}
                      className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Browse Movies
                    </button>
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {/* Featured Movie */}
                    {currentItem && (
                      <motion.div
                        key={currentItem.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
                          <img
                            src={`https://image.tmdb.org/t/p/w500${currentItem.backdrop_path}`}
                            alt={getContentTitle(currentItem)}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => currentItem && handlePlay(currentItem)}
                              className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center"
                            >
                              <Play className="w-6 h-6 text-black fill-black ml-1" />
                            </motion.button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-xl font-bold text-white">{getContentTitle(currentItem)}</h3>
                          <p className="text-gray-400 line-clamp-3">{currentItem.overview}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span>{currentItem.vote_average.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{getContentYear(currentItem)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Film className="w-4 h-4" />
                              <span>{getContentTypeLabel(currentItem)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Navigation */}
                    {currentItems.length > 1 && (
                      <div className="flex items-center justify-between">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handlePrevious}
                          disabled={currentItems.length <= 1}
                          className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </motion.button>
                        
                        <div className="flex items-center gap-2">
                          {currentItems.map((_, index) => (
                            <div
                              key={index}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentIndex ? 'bg-white' : 'bg-white/30'
                              }`}
                            />
                          ))}
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleNext}
                          disabled={currentItems.length <= 1}
                          className="p-2 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </motion.button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Video Player Overlay */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black z-[60] flex items-center justify-center"
                  onClick={closePlayer}
                >
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.8 }}
                    className="relative w-full h-full max-w-6xl mx-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative w-full h-full" style={{ height: '100vh', maxHeight: '90vh' }}>
                      <iframe
                        src={playerUrl}
                        className="w-full h-full object-contain"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        title="Movie Player"
                        referrerPolicy="strict-origin-when-cross-origin"
                        loading="eager"
                        style={{ border: 'none' }}
                      />
                      
                      {/* Close Button */}
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        whileHover={{ opacity: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={closePlayer}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all z-[70]"
                      >
                        <X className="w-5 h-5 text-white" />
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
