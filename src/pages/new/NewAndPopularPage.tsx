import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import ModernMovieCard from '../../components/movies/ModernMovieCard';
import { LoadingSpinner } from '../../components/common/LoadingStates';
import {
  getContentSlug,
  getNewReleaseMovies,
  getTrendingMovies,
  type MovieData,
} from '../../services/movieService';

export default function NewAndPopularPage() {
  const navigate = useNavigate();
  const [newReleases, setNewReleases] = useState<MovieData[]>([]);
  const [trending, setTrending] = useState<MovieData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadContent = async () => {
      try {
        const [newData, trendingData] = await Promise.all([
          getNewReleaseMovies(),
          getTrendingMovies(),
        ]);
        if (cancelled) return;
        setNewReleases(newData);
        setTrending(trendingData);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, []);

  const openMovie = (movie: MovieData) => navigate(`/movies/${getContentSlug(movie)}`);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <LoadingSpinner size="lg" text="Loading new releases..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-3 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
              <TrendingUp className="h-6 w-6 text-red-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">New and Popular Movies</h1>
              <p className="text-sm text-gray-400">Fresh releases and trending films</p>
            </div>
          </div>
        </div>
      </header>

      {trending.length > 0 && (
        <section className="px-3 py-8 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-xl font-bold text-white">Trending Now</h2>
          <div className="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {trending.map((movie) => (
              <ModernMovieCard
                key={movie.id}
                movie={movie}
                layout="poster"
                size="medium"
                onSelect={openMovie}
              />
            ))}
          </div>
        </section>
      )}

      {newReleases.length > 0 && (
        <section className="px-3 pb-16 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-xl font-bold text-white">New Releases</h2>
          <div className="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {newReleases.map((movie) => (
              <ModernMovieCard
                key={movie.id}
                movie={movie}
                layout="poster"
                size="medium"
                onSelect={openMovie}
              />
            ))}
          </div>
        </section>
      )}

      {trending.length === 0 && newReleases.length === 0 && (
        <div className="px-3 pb-16 text-center sm:px-6 lg:px-8">
          <p className="text-gray-400">No titles available right now. Please check back soon.</p>
        </div>
      )}
    </div>
  );
}
