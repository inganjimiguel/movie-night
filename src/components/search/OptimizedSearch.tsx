import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Play } from 'lucide-react';

interface OptimizedSearchProps {
  onSearch: (query: string) => void;
  onDirectPlay: (query: string) => void;
  onSearchByLetter?: (letter: string) => void;
  className?: string;
  externalQuery?: string;
}

export default function OptimizedSearch({ onSearch, onDirectPlay, onSearchByLetter, className = '', externalQuery }: OptimizedSearchProps) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLetterSearch, setShowLetterSearch] = useState(false);

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Sync local query with external query when it changes
  useEffect(() => {
    if (externalQuery !== undefined) {
      setQuery(externalQuery);
    }
  }, [externalQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        onSearch(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  const handleEnter = () => {
    if (query.trim()) {
      onDirectPlay(query);
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  const handleLetterClick = (letter: string) => {
    if (onSearchByLetter) {
      onSearchByLetter(letter);
      setQuery(letter);
      setShowLetterSearch(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <motion.div
          layout
          className={`flex items-center bg-black/60 backdrop-blur-md border border-white/20 rounded-full overflow-hidden transition-all duration-300 ${
            isExpanded ? 'w-full max-w-2xl' : 'w-64 sm:w-80'
          }`}
        >
          {/* Search Icon */}
          <div className="flex items-center justify-center w-12 h-12 text-gray-400">
            <Search className="w-5 h-5" />
          </div>

          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onBlur={() => !query && setIsExpanded(false)}
            placeholder="Search movies, TV shows..."
            className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none px-2 py-3"
          />

          {/* Clear Button */}
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearSearch}
                className="flex items-center justify-center w-10 h-10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Enter Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEnter}
            disabled={!query.trim()}
            className={`flex items-center justify-center w-12 h-12 transition-colors ${
              query.trim() 
                ? 'text-green-500 bg-green-500/10 hover:bg-green-500/20' 
                : 'text-gray-600 cursor-not-allowed'
            }`}
          >
            <Play className="w-5 h-5" />
          </motion.button>
        </motion.div>

        {/* Letter Search Toggle */}
        {onSearchByLetter && (
          <button
            onClick={() => setShowLetterSearch(!showLetterSearch)}
            className="mt-3 text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showLetterSearch ? 'Hide letter search' : 'Search by letter'}
          </button>
        )}

        {/* Letter Search Grid */}
        <AnimatePresence>
          {showLetterSearch && onSearchByLetter && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-7 sm:grid-cols-9 gap-2"
            >
              {letters.map((letter) => (
                <motion.button
                  key={letter}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLetterClick(letter)}
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-red-600/50 text-white font-bold transition-colors flex items-center justify-center"
                >
                  {letter}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
