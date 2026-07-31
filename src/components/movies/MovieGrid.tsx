import {motion} from 'motion/react';
import {getImageUrl, type MovieData} from '../../services/movieService';

interface MovieGridProps {
  movies: MovieData[];
  onMovieSelect: (movie: MovieData) => void;
}

export default function MovieGrid({movies, onMovieSelect}: MovieGridProps) {
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 px-4">Popular on Movie Night</h2>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 3xl:grid-cols-9 gap-1">
        {movies.map((movie) => (
          <motion.div
            key={movie.id}
            whileHover={{scale: 1.02, y: -5}}
            onClick={() => onMovieSelect(movie)}
            className="aspect-video relative rounded-lg overflow-hidden cursor-pointer group shadow-xl"
          >
            <img
              src={getImageUrl(movie.backdrop_path)}
              className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all duration-500"
              alt={movie.title}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-2 left-2 right-2">
              <h3 className="font-bold text-sm drop-shadow-md text-white">{movie.title}</h3>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
