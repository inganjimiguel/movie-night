import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

const HomePage = lazy(() => import('../../pages/home/HomePage'));
const ContinueWatchingPage = lazy(() => import('../../pages/continue-watching/ContinueWatchingPage'));
const LikedPage = lazy(() => import('../../pages/liked/LikedPage'));
const QueuePage = lazy(() => import('../../pages/queue/QueuePage'));
const TVShowsPage = lazy(() => import('../../pages/tvshows/TVShowsPage'));
const TrailersPage = lazy(() => import('../../pages/trailers/TrailersPage'));
const PrivacyPolicyPage = lazy(() => import('../../pages/privacy/PrivacyPolicyPage'));
const MoviesPage = lazy(() => import('../../pages/movies/MoviesPage'));
const NewAndPopularPage = lazy(() => import('../../pages/new/NewAndPopularPage'));

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/movies/:movieSlug" element={<HomeRoute />} />
        <Route path="/genres/:genreSlug" element={<HomeRoute />} />
        <Route path="/lists/:listSlug" element={<HomeRoute />} />
        <Route path="/continue-watching" element={<ContinueWatchingRoute />} />
        <Route path="/liked" element={<LikedRoute />} />
        <Route path="/queue" element={<QueueRoute />} />
        <Route path="/tv-shows" element={<TVShowsPage />} />
        <Route path="/trailers" element={<TrailersRoute />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/new" element={<NewAndPopularPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
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

function ContinueWatchingRoute() {
  const navigate = useNavigate();

  return <ContinueWatchingPage navigateTo={(path) => void navigate(path)} />;
}

function QueueRoute() {
  const navigate = useNavigate();

  return <QueuePage navigateTo={(path) => void navigate(path)} />;
}

function TrailersRoute() {
  const navigate = useNavigate();

  return <TrailersPage navigateTo={(path) => void navigate(path)} />;
}
