import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X } from 'lucide-react';

interface OptimizedSearchProps {
  onSearch: (query: string) => void;
  className?: string;
  externalQuery?: string;
}

export default function OptimizedSearch({ onSearch, className = '', externalQuery }: OptimizedSearchProps) {
  const [query, setQuery] = useState('');

  // Sync local query with external query when it changes
  useEffect(() => {
    if (externalQuery !== undefined) {
      setQuery(externalQuery);
    }
  }, [externalQuery]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [onSearch, query]);

  const handleSearchSubmit = useCallback(() => {
    if (query.trim()) {
      onSearch(query);
    }
  }, [onSearch, query]);

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <motion.div
          layout
          className="flex w-full items-center bg-black/60 backdrop-blur-md border border-white/20 rounded-full overflow-hidden transition-all duration-200"
        >
          {/* Input */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearchSubmit();
              }
            }}
            placeholder="Search movies, TV shows..."
            className="flex-1 min-w-0 bg-transparent text-white placeholder-gray-400 outline-none px-4 py-3"
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

          <div className="flex items-center pr-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearchSubmit}
              disabled={!query.trim()}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                query.trim() 
                  ? 'text-white bg-red-600 hover:bg-red-700' 
                  : 'text-gray-600 cursor-not-allowed'
              }`}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
