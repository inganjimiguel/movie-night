import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Heart, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ContinueWatchingProvider } from './contexts/ContinueWatchingContext';
import { MediaLibraryProvider } from './contexts/MediaLibraryContext';
import AppRouter from './components/layout/AppRouter';
import SEOHead from './components/seo/SEOHead';
import Footer from './components/layout/Footer';
import GoogleAnalytics from './components/analytics/GoogleAnalytics';

const DonationModal = lazy(() => import('./components/payments/DonationModal'));

export default function App() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const pageSeo = getPageSeo(location.pathname);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [showScrollUpButton, setShowScrollUpButton] = useState(false);
  const [showScrollDownButton, setShowScrollDownButton] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollBottom = window.innerHeight + scrollTop;
      const documentHeight = document.documentElement.scrollHeight;

      setShowScrollUpButton(scrollTop > 320);
      setShowScrollDownButton(scrollBottom < documentHeight - 240);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
  };

  return (
    <>
      <GoogleAnalytics pageTitle={pageSeo.title} />
      <Analytics />

      <SEOHead
        title={pageSeo.title}
        description={pageSeo.description}
        keywords={pageSeo.keywords}
        url={`https://movienight.giize.com${location.pathname}`}
      />

      <motion.button
        initial={{ opacity: 0, y: -16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="group fixed right-3 top-[calc(env(safe-area-inset-top,0px)+68px)] z-[180] flex max-w-[calc(100vw-24px)] items-center gap-2 overflow-hidden rounded-full border border-red-200/20 bg-[linear-gradient(135deg,rgba(220,38,38,0.96),rgba(127,29,29,0.96))] px-2 py-2 text-left shadow-[0_16px_40px_rgba(127,29,29,0.35)] backdrop-blur-xl sm:right-5 sm:top-[calc(env(safe-area-inset-top,0px)+84px)] sm:gap-3 sm:px-4 sm:py-3"
        onClick={() => setIsDonationModalOpen(true)}
        aria-label="Open support us popup"
      >
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.26),transparent_52%)] opacity-80" />
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/14 shadow-inner shadow-white/10 sm:h-10 sm:w-10">
          <Heart className="h-[18px] w-[18px] fill-white text-white sm:h-5 sm:w-5" />
        </span>
        <span className="relative hidden min-w-0 flex-col min-[420px]:flex">
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-red-100/80">
            <Sparkles className="h-3 w-3" />
            Keep it rolling
          </span>
          <span className="truncate text-sm font-extrabold text-white sm:text-base">Support us</span>
        </span>
      </motion.button>

      {isDonationModalOpen && (
        <Suspense fallback={null}>
          <DonationModal
            isOpen={isDonationModalOpen}
            onClose={() => setIsDonationModalOpen(false)}
          />
        </Suspense>
      )}

      <AnimatePresence>
        {(showScrollUpButton || showScrollDownButton) && (
          <motion.div
            initial={{ opacity: 0, x: 16, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.95 }}
            className="fixed bottom-4 right-3 z-[120] flex flex-col gap-2 sm:bottom-8 sm:right-6 sm:gap-3"
          >
            {showScrollUpButton && (
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleScrollToTop}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white shadow-xl backdrop-blur-md transition-colors hover:bg-red-600/85 sm:h-12 sm:w-12"
                aria-label="Scroll to top"
                title="Scroll to top"
              >
                <ChevronUp className="h-5 w-5" />
              </motion.button>
            )}

            {showScrollDownButton && (
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleScrollDown}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white shadow-xl backdrop-blur-md transition-colors hover:bg-red-600/85 sm:h-12 sm:w-12"
                aria-label="Scroll down"
                title="Scroll down"
              >
                <ChevronDown className="h-5 w-5" />
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <MediaLibraryProvider>
        <ContinueWatchingProvider>
          <div className="min-h-screen flex flex-col">
            {isHomePage && null}
            <AppRouter />
            <Footer />
          </div>
        </ContinueWatchingProvider>
      </MediaLibraryProvider>
    </>
  );
}

function getPageSeo(pathname: string) {
  if (pathname.startsWith('/movies/')) {
    const title = toTitleFromSlug(pathname.replace('/movies/', ''));
    return {
      title: `Watch ${title} | Movie Night`,
      description: `Watch ${title} on Movie Night with cast details, genres, ratings, similar titles, and HD playback options.`,
      keywords: `${title}, watch ${title}, Movie Night movie details, movie cast, similar movies`
    };
  }

  if (pathname.startsWith('/genres/')) {
    const genre = toTitleFromSlug(pathname.replace('/genres/', ''));
    return {
      title: `${genre} Movies and Shows | Movie Night`,
      description: `Browse ${genre.toLowerCase()} movies, TV shows, and animations on Movie Night with clean genre pages and curated streaming picks.`,
      keywords: `${genre} movies, ${genre} shows, stream ${genre.toLowerCase()}, Movie Night genres`
    };
  }

  if (pathname.startsWith('/lists/')) {
    const listTitle = toTitleFromSlug(pathname.replace('/lists/', ''));
    return {
      title: `${listTitle} | Movie Night`,
      description: `Explore the ${listTitle.toLowerCase()} list on Movie Night with curated recommendations and quick watch ideas.`,
      keywords: `${listTitle}, movie recommendations, curated movie lists, Movie Night lists`
    };
  }

  switch (pathname) {
    case '/liked':
      return {
        title: 'Liked Movies and Shows | Movie Night',
        description: 'Review the movies, TV shows, and animations you liked on Movie Night so your next watch is easy to find.',
        keywords: 'liked movies, saved shows, favorite streaming titles, Movie Night liked titles'
      };
    case '/continue-watching':
      return {
        title: 'Continue Watching | Movie Night',
        description: 'Resume movies, TV shows, and animations you already started on Movie Night with saved source and episode details.',
        keywords: 'continue watching, resume movie, resume TV show, saved playback, Movie Night continue watching'
      };
    case '/queue':
      return {
        title: 'Movie Watch Queue | Movie Night',
        description: 'Build a personal queue of movies, TV shows, and animations to watch later on Movie Night.',
        keywords: 'movie queue, watch later movies, saved TV shows, Movie Night queue'
      };
    case '/tv-shows':
      return {
        title: 'Watch TV Shows Online | Movie Night',
        description: 'Browse TV shows by genre, rating, and release date on Movie Night, from drama and comedy to sci-fi and adventure.',
        keywords: 'watch tv shows online, stream series, browse TV shows, Movie Night TV'
      };
    case '/trailers':
      return {
        title: 'Movie Trailers and New Releases | Movie Night',
        description: 'Watch upcoming movie and TV trailers, preview new releases, and find what to stream next on Movie Night.',
        keywords: 'movie trailers, new releases, upcoming movies, TV trailers, Movie Night trailers'
      };
    case '/movies':
      return {
        title: 'Browse Movies Online | Movie Night',
        description: 'Browse the Movie Night movie collection and discover popular films, trending picks, and HD streaming options.',
        keywords: 'browse movies online, popular movies, streaming movies, Movie Night movies'
      };
    case '/new':
      return {
        title: 'New and Popular Movies | Movie Night',
        description: 'Discover new and popular movies, shows, and animations currently trending on Movie Night.',
        keywords: 'new movies, popular movies, trending shows, Movie Night new releases'
      };
    case '/privacy-policy':
      return {
        title: 'Privacy Policy | Movie Night',
        description: 'Read the Movie Night privacy policy to learn how we handle data, cookies, advertising, and user privacy.',
        keywords: 'privacy policy, Movie Night privacy, data policy, cookie policy'
      };
    default:
      return {
        title: 'Watch Movie Night Picks | Movie Night',
        description: 'Find hand-picked movies, TV shows, animations, new releases, and trailers to stream on Movie Night.',
        keywords: 'watch movies online, movie night picks, TV shows online, animation streaming, movie trailers'
      };
  }
}

function toTitleFromSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
