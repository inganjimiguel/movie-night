import { motion, AnimatePresence } from 'motion/react';
import { Home } from 'lucide-react';

interface BackToHomeNavbarProps {
  isVisible: boolean;
  onBackToHome: () => void;
  label?: string;
}

export default function BackToHomeNavbar({ isVisible, onBackToHome, label = 'Back to Home' }: BackToHomeNavbarProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-[160] bg-black/80 backdrop-blur-md border-b border-white/10"
        >
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBackToHome}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4 text-white" />
                <span className="text-white font-medium">{label}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
