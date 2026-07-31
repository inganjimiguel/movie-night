import { useState } from 'react';
import React from 'react';
import { motion } from 'motion/react';
import { LoaderCircle, Film, AlertCircle } from 'lucide-react';

interface LoadingSkeletonProps {
  type?: 'card' | 'hero' | 'carousel';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ type = 'card', count = 1, className = '' }: LoadingSkeletonProps) {
  const renderSkeleton = (index: number) => {
    switch (type) {
      case 'card':
        return (
          <div
            key={index}
            className={`aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden ${className}`}
          >
            <div className="w-full h-full loading-skeleton" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-700 rounded loading-skeleton" />
              <div className="h-3 bg-gray-700 rounded w-2/3 loading-skeleton" />
            </div>
          </div>
        );
      
      case 'hero':
        return (
          <div
            key={index}
            className={`aspect-video bg-gray-800 rounded-lg overflow-hidden ${className}`}
          >
            <div className="w-full h-full loading-skeleton" />
          </div>
        );
      
      case 'carousel':
        return (
          <div
            key={index}
            className={`flex-none w-[200px] aspect-[2/3] bg-gray-800 rounded-lg overflow-hidden ${className}`}
          >
            <div className="w-full h-full loading-skeleton" />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </div>
  );
}

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', text = 'Loading...', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <LoaderCircle className={`${sizeClasses[size]} animate-spin text-red-600`} />
      {text && <span className="text-gray-400 text-sm">{text}</span>}
    </div>
  );
}

interface LoadingStateProps {
  type?: 'loading' | 'error' | 'empty';
  title?: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function LoadingState({ 
  type = 'loading', 
  title, 
  message, 
  action, 
  className = '' 
}: LoadingStateProps) {
  const renderContent = () => {
    switch (type) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <LoaderCircle className="w-12 h-12 animate-spin text-red-600" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-white">{title || 'Loading...'}</h3>
              <p className="text-gray-400 text-sm">{message || 'Please wait while we fetch your content'}</p>
            </div>
          </div>
        );
      
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-white">{title || 'Something went wrong'}</h3>
              <p className="text-gray-400 text-sm">{message || 'Unable to load content. Please try again.'}</p>
              {action && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.onClick}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {action.label}
                </motion.button>
              )}
            </div>
          </div>
        );
      
      case 'empty':
        return (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
              <Film className="w-8 h-8 text-gray-600" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-white">{title || 'No content found'}</h3>
              <p className="text-gray-400 text-sm">{message || 'There are no movies to display right now.'}</p>
              {action && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.onClick}
                  className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {action.label}
                </motion.button>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {renderContent()}
    </motion.div>
  );
}

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export function ProgressiveImage({ src, alt, className, loading = 'lazy', onLoad, onError }: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
        <Film className="w-8 h-8 text-gray-600" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-800 loading-skeleton" />
      )}
    </div>
  );
}

// Touch-optimized button wrapper
interface TouchButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function TouchButton({ 
  children, 
  onClick, 
  disabled = false, 
  className = '',
  variant = 'primary',
  size = 'md'
}: TouchButtonProps) {
  const baseClasses = 'touch-target-mobile focus-visible focus-visible:outline-2 focus-visible:outline-red-600 focus-visible:outline-offset-2 transition-all';
  
  const variantClasses = {
    primary: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-600 disabled:opacity-50',
    secondary: 'bg-white/10 text-white border border-white/20 hover:bg-white/20 disabled:opacity-50',
    ghost: 'text-white hover:bg-white/10 disabled:opacity-50'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} rounded-lg font-medium ${className}`}
    >
      {children}
    </motion.button>
  );
}

