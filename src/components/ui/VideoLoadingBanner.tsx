import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, Play, Wifi, WifiOff } from 'lucide-react';

interface VideoLoadingBannerProps {
  isLoading: boolean;
  message?: string;
  showConnectionStatus?: boolean;
}

export default function VideoLoadingBanner({
  isLoading,
  message = 'Loading a movie player... grab a snack.',
  showConnectionStatus = true
}: VideoLoadingBannerProps) {
  const [connectionStatus, setConnectionStatus] = useState<'good' | 'poor' | 'checking'>('checking');

  useEffect(() => {
    if (!showConnectionStatus) return;

    const checkConnection = () => {
      const connection = (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

      if (connection) {
        const effectiveType = connection.effectiveType;
        if (effectiveType === '4g' || effectiveType === '3g') {
          setConnectionStatus('good');
        } else {
          setConnectionStatus('poor');
        }
      } else {
        const img = new Image();
        const startTime = Date.now();
        img.onload = () => {
          const loadTime = Date.now() - startTime;
          setConnectionStatus(loadTime < 1000 ? 'good' : 'poor');
        };
        img.onerror = () => setConnectionStatus('poor');
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, [showConnectionStatus]);

  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
    >
      <div className="flex flex-col items-center space-y-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="relative"
        >
          <div className="h-16 w-16 rounded-full border-4 border-red-600/20 border-t-red-600" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Play className="h-6 w-6 text-red-600" />
          </div>
        </motion.div>

        <div className="space-y-2 text-center">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-medium text-white"
          >
            {message}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-md text-sm text-gray-400"
          >
            Preparing your movie experience...
          </motion.p>
        </div>

        {showConnectionStatus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-2 rounded-full bg-gray-800/50 px-4 py-2 backdrop-blur-sm"
          >
            {connectionStatus === 'checking' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                <span className="text-xs text-gray-400">Checking connection...</span>
              </>
            ) : connectionStatus === 'good' ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-xs text-green-400">Good connection</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-yellow-500" />
                <span className="text-xs text-yellow-400">Slow connection detected</span>
              </>
            )}
          </motion.div>
        )}

        <div className="flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: i * 0.1,
                repeat: Infinity,
                repeatType: 'reverse',
                repeatDelay: 0.5,
                duration: 0.8
              }}
              className="h-2 w-2 rounded-full bg-red-600"
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="max-w-sm space-y-1 text-center"
        >
          <p className="text-xs text-gray-500">Tip: The video player will appear automatically.</p>
          <p className="text-xs text-gray-600">Press ESC to close anytime.</p>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
    </motion.div>
  );
}
