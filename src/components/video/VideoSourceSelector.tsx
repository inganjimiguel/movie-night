import React from 'react';
import { motion } from 'motion/react';
import { Video, PlayCircle } from 'lucide-react';
import { type VideoSource } from '../../services/movieService';

interface VideoSourceSelectorProps {
  currentSource: VideoSource;
  onSourceChange: (source: VideoSource) => void;
  disabled?: boolean;
}

const sources = [
  { id: 'vidsrcpro' as VideoSource, name: 'VidSrc.pro', icon: PlayCircle, color: 'green' },
  { id: 'vidsrc' as VideoSource, name: 'VidSrc', icon: Video, color: 'red' },
];

export default function VideoSourceSelector({ currentSource, onSourceChange, disabled = false }: VideoSourceSelectorProps) {
  return (
    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full p-1 border border-white/20">
      {sources.map((source) => {
        const Icon = source.icon;
        const isActive = currentSource === source.id;
        
        return (
          <motion.button
            key={source.id}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            onClick={() => !disabled && onSourceChange(source.id)}
            disabled={disabled}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              isActive 
                ? `bg-${source.color}-600 text-white shadow-lg` 
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={isActive ? { backgroundColor: source.color === 'red' ? '#dc2626' : source.color === 'blue' ? '#2563eb' : '#16a34a' } : {}}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{source.name}</span>
            {isActive && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute inset-0 rounded-full"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
