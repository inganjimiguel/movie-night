import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import HomePage from '../../pages/home/HomePage';
import FavoritesPage from '../../pages/favorites/FavoritesPage';
import WatchLaterPage from '../../pages/watchlater/WatchLaterPage';
import TVShowsPage from '../../pages/tvshows/TVShowsPage';
import TrailersPage from '../../pages/trailers/TrailersPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/favorites" element={<FavoritesRoute />} />
      <Route path="/watchlater" element={<WatchLaterRoute />} />
      <Route path="/tv-shows" element={<TVShowsPage />} />
      <Route path="/trailers" element={<TrailersRoute />} />
      <Route path="/movies" element={<MoviesRoute />} />
      <Route path="/new" element={<NewRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function HomeRoute() {
  const navigate = useNavigate();

  return <HomePage navigateTo={(path) => void navigate(path)} />;
}

function FavoritesRoute() {
  const navigate = useNavigate();

  return <FavoritesPage navigateTo={(path) => void navigate(path)} />;
}

function WatchLaterRoute() {
  const navigate = useNavigate();

  return <WatchLaterPage navigateTo={(path) => void navigate(path)} />;
}

function TrailersRoute() {
  const navigate = useNavigate();

  return <TrailersPage navigateTo={(path) => void navigate(path)} />;
}

function MoviesRoute() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Movies Page</h1>
        <p className="text-gray-400 mb-8">Browse our complete movie collection</p>
        <button
          onClick={() => void navigate('/')}
          className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

function NewRoute() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">New & Popular</h1>
        <p className="text-gray-400 mb-8">Discover the latest releases and trending content</p>
        <button
          onClick={() => void navigate('/')}
          className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
