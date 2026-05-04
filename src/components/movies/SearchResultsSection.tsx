import {motion} from 'motion/react';
import { Film, Tv2, Sparkles, Star } from 'lucide-react';
import {getImageUrl, type MovieData, type ContentData} from '../../services/movieService';

interface SearchResultsSectionProps {
  searchQuery: string;
  results: ContentData[];
  onMovieSelect: (movie: ContentData) => void;
}

export default function SearchResultsSection({
  searchQuery,
  results,
  onMovieSelect,
}: SearchResultsSectionProps) {
  const getContentTypeInfo = (item: ContentData) => {
    if (item.media_type === 'tv') {
      return { label: 'TV Show', icon: Tv2, color: 'bg-blue-600' };
    }
    if (item.media_type === 'animation') {
      return { label: 'Animation', icon: Sparkles, color: 'bg-purple-600' };
    }
    return { label: 'Movie', icon: Film, color: 'bg-red-600' };
  };

  const getTitle = (item: ContentData) => {
    if ('title' in item && item.title) return item.title;
    if ('name' in item && item.name) return item.name;
    return 'Unknown';
  };

  const getYear = (item: ContentData) => {
    if ('release_date' in item && item.release_date) {
      return item.release_date.split('-')[0];
    }
    if ('first_air_date' in item && item.first_air_date) {
      return item.first_air_date.split('-')[0];
    }
    return 'N/A';
  };

  if (results.length === 0) {
    return (
      <section className="pt-32 px-4 md:px-8 lg:px-12 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Film className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Results Found</h2>
          <p className="text-gray-400">No movies, TV shows, or animations match "{searchQuery}"</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32 px-4 md:px-8 lg:px-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">Search Results</h2>
        <p className="text-gray-400">
          Found <span className="text-white font-semibold">{results.length}</span> results for "{searchQuery}"
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {results.map((item) => {
          const contentType = getContentTypeInfo(item);
          const ContentIcon = contentType.icon;
          const title = getTitle(item);
          const year = getYear(item);

          return (
            <motion.div
              key={`${item.media_type}-${item.id}`}
              whileHover={{ scale: 1.05, y: -8 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onMovieSelect(item)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg md:shadow-xl transition-all">
                {/* Image */}
                <img
                  src={getImageUrl(item.poster_path)}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"%3E%3Crect fill="%23374151" width="400" height="600"/%3E%3C/svg%3E';
                  }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Content Type Badge - Top Right */}
                <div className={`absolute top-2 right-2 ${contentType.color} rounded-lg px-2 py-1.5 flex items-center gap-1 shadow-lg backdrop-blur-md bg-opacity-90 z-10`}>
                  <ContentIcon className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-semibold hidden sm:inline">{contentType.label}</span>
                </div>

                {/* Rating Badge - Top Left */}
                {item.vote_average > 0 && (
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md rounded-lg px-2 py-1.5 flex items-center gap-1 z-10">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-white text-xs font-semibold">{item.vote_average.toFixed(1)}</span>
                  </div>
                )}

                {/* Hover Info - Bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">{title}</h3>
                  <p className="text-gray-300 text-xs">{year}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
