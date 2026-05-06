import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

const HomePage = lazy(() => import('../../pages/home/HomePage'));
const LikedPage = lazy(() => import('../../pages/liked/LikedPage'));
const QueuePage = lazy(() => import('../../pages/queue/QueuePage'));
const TVShowsPage = lazy(() => import('../../pages/tvshows/TVShowsPage'));
const TrailersPage = lazy(() => import('../../pages/trailers/TrailersPage'));

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/movies/:movieSlug" element={<HomeRoute />} />
        <Route path="/genres/:genreSlug" element={<HomeRoute />} />
        <Route path="/lists/:listSlug" element={<HomeRoute />} />
        <Route path="/liked" element={<LikedRoute />} />
        <Route path="/queue" element={<QueueRoute />} />
        <Route path="/tv-shows" element={<TVShowsPage />} />
        <Route path="/trailers" element={<TrailersRoute />} />
        <Route path="/movies" element={<MoviesRoute />} />
        <Route path="/new" element={<NewRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function RouteLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      Loading...
    </div>
  );
}

function HomeRoute() {
  const navigate = useNavigate();

  return <HomePage navigateTo={(path) => void navigate(path)} />;
}

function LikedRoute() {
  const navigate = useNavigate();

  return <LikedPage navigateTo={(path) => void navigate(path)} />;
}

function QueueRoute() {
  const navigate = useNavigate();

  return <QueuePage navigateTo={(path) => void navigate(path)} />;
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
        <h1 className="text-4xl font-bold text-white mb-4">Browse Movies Online</h1>
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
        <h1 className="text-4xl font-bold text-white mb-4">New and Popular Movies</h1>
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
