import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Heart, Sparkles } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { MediaLibraryProvider } from './contexts/MediaLibraryContext';
import AppRouter from './components/layout/AppRouter';
import SEOHead from './components/seo/SEOHead';
import DonationModal from './components/payments/DonationModal';
import Footer from './components/layout/Footer';

export default function App() {
  console.log('App component rendering!');
  const location = useLocation();
  const isHomePage = location.pathname === '/';
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
      <SEOHead />

      <motion.button
        initial={{ opacity: 0, y: -16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.97 }}
        className="group fixed right-3 top-[calc(env(safe-area-inset-top,0px)+84px)] z-[180] flex max-w-[calc(100vw-24px)] items-center gap-3 overflow-hidden rounded-full border border-red-200/20 bg-[linear-gradient(135deg,rgba(220,38,38,0.96),rgba(127,29,29,0.96))] px-3 py-2 text-left shadow-[0_16px_40px_rgba(127,29,29,0.35)] backdrop-blur-xl sm:right-5 sm:px-4 sm:py-3"
        onClick={() => setIsDonationModalOpen(true)}
        aria-label="Open support us popup"
      >
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.26),transparent_52%)] opacity-80" />
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/14 shadow-inner shadow-white/10">
          <Heart className="h-5 w-5 fill-white text-white" />
        </span>
        <span className="relative flex min-w-0 flex-col">
          <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-red-100/80">
            <Sparkles className="h-3 w-3" />
            Keep it rolling
          </span>
          <span className="truncate text-sm font-extrabold text-white sm:text-base">Support us</span>
        </span>
      </motion.button>

      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
      />

      <AnimatePresence>
        {(showScrollUpButton || showScrollDownButton) && (
          <motion.div
            initial={{ opacity: 0, x: 16, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 16, scale: 0.95 }}
            className="fixed bottom-6 right-4 z-[120] flex flex-col gap-3 sm:bottom-8 sm:right-6"
          >
            {showScrollUpButton && (
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleScrollToTop}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white shadow-xl backdrop-blur-md transition-colors hover:bg-red-600/85"
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
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white shadow-xl backdrop-blur-md transition-colors hover:bg-red-600/85"
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
        <div className="min-h-screen flex flex-col">
          {isHomePage && null}
          <AppRouter />
          <Footer />
        </div>
      </MediaLibraryProvider>
    </>
  );
}
