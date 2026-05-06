import {Bell, Search} from 'lucide-react';
import type {FormEvent} from 'react';

interface AppHeaderProps {
  isScrolled: boolean;
  isSearching: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onResetToBrowse: () => void;
}

const navigationItems = ['Home', 'TV Shows', 'Movies', 'New & Popular', 'My List'];

export default function AppHeader({
  isScrolled,
  isSearching,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  onResetToBrowse,
}: AppHeaderProps) {
  return (
    <nav
      className={`fixed top-0 w-full z-100 transition-all duration-500 px-4 md:px-12 py-4 flex items-center justify-between ${
        isScrolled ? 'bg-netflix-dark shadow-2xl backdrop-blur-md' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex items-center gap-8">
        <button
          type="button"
          onClick={onResetToBrowse}
          className="text-netflix-red text-2xl md:text-3xl font-black tracking-tighter uppercase italic cursor-pointer scale-110 md:scale-100 origin-left"
        >
          Movie Night
        </button>

        <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-gray-300">
          {navigationItems.map((item) => (
            <span
              key={item}
              className={`transition-colors cursor-default ${item === 'Home' && !isSearching ? 'text-white' : 'hover:text-white'}`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-5">
        <form onSubmit={onSearchSubmit} className="relative group">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Titles, people, genres"
            className="bg-black/40 border border-white/20 px-4 py-1.5 pl-10 rounded text-sm focus:outline-none focus:border-white/40 w-32 md:w-64 transition-all"
          />
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50 group-focus-within:opacity-100" />
        </form>

        <Bell className="w-5 h-5 cursor-pointer hidden md:block" />

        <div className="w-8 h-8 bg-netflix-red rounded cursor-pointer flex items-center justify-center font-bold text-sm">
          M
        </div>
      </div>
    </nav>
  );
}
