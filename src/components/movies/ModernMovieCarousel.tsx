import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import ModernMovieCard from './ModernMovieCard';
import { type MovieData } from '../../services/movieService';

interface ModernMovieCarouselProps {
  movies: MovieData[];
  title: string;
  subtitle?: string;
  onMovieSelect: (movie: MovieData) => void;
  autoScroll?: boolean;
  scrollInterval?: number;
  className?: string;
}

export default function ModernMovieCarousel({
  movies,
  title,
  subtitle,
  onMovieSelect,
  autoScroll = false,
  scrollInterval = 5000,
  className = ''
}: ModernMovieCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isAutoScrolling, setIsAutoScrolling] = useState(autoScroll);

  const checkScrollability = () => {
    const element = carouselRef.current;
    if (!element) return;

    setCanScrollLeft(element.scrollLeft > 0);
    setCanScrollRight(element.scrollLeft < element.scrollWidth - element.clientWidth);
  };

  const scroll = (direction: 'left' | 'right') => {
    const element = carouselRef.current;
    if (!element) return;

    const scrollAmount = element.clientWidth * 0.8;
    const targetScroll = direction === 'left' 
      ? element.scrollLeft - scrollAmount 
      : element.scrollLeft + scrollAmount;

    element.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });

    // Pause auto-scroll when user manually scrolls
    if (isAutoScrolling) {
      setIsAutoScrolling(false);
      setTimeout(() => setIsAutoScrolling(true), 10000); // Resume after 10 seconds
    }
  };

  const handleScroll = () => {
    checkScrollability();
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling || !autoScroll) return;

    const interval = setInterval(() => {
      const element = carouselRef.current;
      if (!element) return;

      if (element.scrollLeft >= element.scrollWidth - element.clientWidth) {
        // Reached the end, scroll back to start
        element.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scroll('right');
      }
    }, scrollInterval);

    return () => clearInterval(interval);
  }, [isAutoScrolling, autoScroll, scrollInterval]);

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [movies]);

  // Touch scroll handling
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (carouselRef.current?.offsetLeft || 0));
    setScrollLeft(carouselRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (carouselRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <section className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Header */}
      <div className="px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/45 px-4 py-4 shadow-2xl shadow-black/25 backdrop-blur-xl sm:rounded-[28px] sm:px-6 sm:py-5">
          <div className="min-w-0 space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-3">
              {title.includes('Trending') && (
                <TrendingUp className="h-5 w-5 shrink-0 text-red-600 sm:h-6 sm:w-6" />
              )}
              {title.includes('Popular') && (
                <Sparkles className="h-5 w-5 shrink-0 text-yellow-500 sm:h-6 sm:w-6" />
              )}
              <h2 className="min-w-0 text-xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="max-w-2xl text-xs leading-5 text-gray-400 sm:text-base">
                {subtitle}
              </p>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`rounded-full border p-3 transition-all ${
                canScrollLeft
                  ? 'border-white/10 bg-white/10 text-white hover:bg-white/20'
                  : 'cursor-not-allowed border-white/5 bg-white/5 text-gray-600'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`rounded-full border p-3 transition-all ${
                canScrollRight
                  ? 'border-white/10 bg-white/10 text-white hover:bg-white/20'
                  : 'cursor-not-allowed border-white/5 bg-white/5 text-gray-600'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Mobile Navigation Buttons */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scroll('left')}
              className="absolute left-2 top-1/2 z-20 rounded-full border border-white/10 bg-black/80 p-2 text-white backdrop-blur-sm sm:hidden"
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scroll('right')}
              className="absolute right-2 top-1/2 z-20 rounded-full border border-white/10 bg-black/80 p-2 text-white backdrop-blur-sm sm:hidden"
            >
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Movie Cards Container */}
        <div
          ref={carouselRef}
          className="scrollbar-hide flex gap-3 overflow-x-auto px-3 pb-4 sm:gap-4 sm:px-6 lg:gap-6 lg:px-8"
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-none"
            >
              <ModernMovieCard
                movie={movie}
                layout="poster"
                size="medium"
                onSelect={onMovieSelect}
                showPlayButton={true}
              />
            </motion.div>
          ))}
        </div>

        {/* Gradient Edges */}
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-8 bg-gradient-to-r from-black via-black/60 to-transparent sm:w-16" />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 z-10 w-8 bg-gradient-to-l from-black via-black/50 to-transparent sm:w-12" />
      </div>

      {/* Scroll Progress Indicator */}
      <div className="px-3 sm:px-6 lg:px-8">
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-red-600 to-red-500"
            initial={{ width: 0 }}
            animate={{
              width: carouselRef.current
                ? `${(carouselRef.current.scrollLeft / (carouselRef.current.scrollWidth - carouselRef.current.clientWidth)) * 100}%`
                : 0
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </section>
  );
}
