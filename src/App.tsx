import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { UserPreferencesProvider } from './contexts/UserPreferencesContext';
import AppRouter from './components/layout/AppRouter';
import SEOHead from './components/seo/SEOHead';
import Footer from './components/layout/Footer';

export default function App() {
  console.log('App component rendering!');
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

      <UserPreferencesProvider>
        <div className="min-h-screen flex flex-col">
          <AppRouter />
          <Footer />
        </div>
      </UserPreferencesProvider>
    </>
  );
}
