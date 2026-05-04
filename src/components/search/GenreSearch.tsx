import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { genreMap } from '../../services/movieService';

interface GenreSearchProps {
  onGenreSelect: (genreId: number) => void;
  selectedGenre?: number;
  availableGenreIds?: number[];
}

export default function GenreSearch({ onGenreSelect, selectedGenre, availableGenreIds }: GenreSearchProps) {
  const [isOpen, setIsOpen] = useState(false);

  const genres = Object.entries(genreMap).map(([id, name]) => ({
    id: parseInt(id),
    name
  }))
    .filter((genre) => !availableGenreIds?.length || availableGenreIds.includes(genre.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  const selectedGenreName = selectedGenre ? genreMap[selectedGenre] : 'All Genres';

  return (
    <div className="relative z-[1450]">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-full text-white hover:border-white/40 transition-all"
      >
        <span className="text-sm font-medium">{selectedGenreName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute left-0 top-full z-[1460] mt-2 max-h-96 w-56 overflow-y-auto rounded-xl border border-white/20 bg-black/95 shadow-2xl backdrop-blur-lg"
          >
            <div className="p-2">
              <button
                onClick={() => {
                  onGenreSelect(0);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  !selectedGenre
                    ? 'bg-red-600/20 text-red-400'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                All Genres
              </button>

              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => {
                    onGenreSelect(genre.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    selectedGenre === genre.id
                      ? 'bg-red-600/20 text-red-400'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
