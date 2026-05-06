import { motion } from 'motion/react';
import { Radio } from 'lucide-react';
import { VIDEO_SOURCE_OPTIONS, type VideoSource } from '../../services/movieService';

interface VideoSourceSelectorProps {
  currentSource: VideoSource;
  onSourceChange: (source: VideoSource) => void;
  disabled?: boolean;
}

export default function VideoSourceSelector({ currentSource, onSourceChange, disabled = false }: VideoSourceSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/20 bg-black/60 p-1.5 backdrop-blur-md">
      {VIDEO_SOURCE_OPTIONS.map((source) => {
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
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Radio className="w-4 h-4" />
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
