import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Film } from 'lucide-react';
import AllMovies from '../../components/movies/AllMovies';
import { getContentSlug } from '../../services/movieService';

export default function MoviesPage() {
  const navigate = useNavigate();

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
              <Film className="h-6 w-6 text-red-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">Browse Movies Online</h1>
              <p className="text-sm text-gray-400">Explore popular films from 1980 to today</p>
            </div>
          </div>
        </div>
      </header>

      <AllMovies onMovieSelect={(movie) => navigate(`/movies/${getContentSlug(movie)}`)} />
    </div>
  );
}
