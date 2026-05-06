import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Search, 
  User, 
  Home, 
  Film, 
  Tv, 
  TrendingUp, 
  Bookmark,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  Play,
  Heart,
  Clock,
  Star
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useMediaLibrary } from '../../contexts/MediaLibraryContext';

interface ResponsiveNavigationProps {
  isScrolled: boolean;
  isSearching: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onResetToBrowse: () => void;
  navigateTo?: (path: string) => void;
}

const navigationItems = [
  { name: 'Home', icon: Home, active: true, path: '/' },
  { name: 'TV Shows', icon: Tv, path: '/tv-shows' },
  { name: 'Animations', icon: Film, path: '/animations' },
  { name: 'Movies', icon: Film, path: '/movies' },
  { name: 'New & Popular', icon: TrendingUp, path: '/new' },
  { name: 'My List', icon: Bookmark, path: '/my-list' },
];

export default function ResponsiveNavigation({
  isScrolled,
  isSearching,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  onResetToBrowse,
  navigateTo,
}: ResponsiveNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const { likedItems, queuedItems } = useMediaLibrary();
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    if (!searchQuery) {
      setIsSearchFocused(false);
    }
  };

  const handleNavigation = (path: string) => {
    if (navigateTo) {
      navigateTo(path);
    } else if (path === '/') {
      onResetToBrowse();
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={`fixed top-0 w-full z-[100] transition-all duration-300 px-4 sm:px-6 lg:px-8 py-4 ${
          isScrolled 
            ? 'bg-black/95 backdrop-blur-lg border-b border-white/10 shadow-2xl' 
            : 'bg-gradient-to-b from-black/80 via-black/50 to-transparent'
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo and Desktop Nav */}
          <div className="flex items-center gap-6 lg:gap-8">
            {/* Logo */}
            <button
              type="button"
              onClick={onResetToBrowse}
              className="text-red-600 text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter uppercase cursor-pointer hover:text-red-500 transition-colors"
            >
              MovieNight
            </button>

            {/* Desktop Navigation Items */}
            <div className="hidden lg:flex items-center gap-6 text-sm font-medium">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigation(item.path)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      item.active && !isSearching
                        ? 'text-white bg-white/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Bar */}
            <div className="relative group">
              <form onSubmit={onSearchSubmit}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => onSearchQueryChange(event.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  placeholder="Search movies..."
                  className={`bg-black/40 border border-white/20 px-4 py-2 pl-10 rounded-full text-sm focus:outline-none transition-all w-32 sm:w-48 md:w-64 lg:w-80 ${
                    isSearchFocused || searchQuery
                      ? 'border-red-600 bg-white/10 w-48 sm:w-64 md:w-80 lg:w-96'
                      : 'hover:border-white/40'
                  }`}
                />
                <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                  isSearchFocused || searchQuery ? 'text-red-600' : 'text-gray-400'
                }`} />
              </form>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Bell className="w-5 h-5 text-white" />
                {likedItems.length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full"
                  />
                )}
              </motion.button>
              
              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 bg-black/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[200]"
                  >
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-white font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {likedItems.length > 0 && (
                        <div className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <Heart className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">New Favorites</p>
                              <p className="text-gray-400 text-xs">You have {likedItems.length} title{likedItems.length > 1 ? 's' : ''} in liked</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {queuedItems.length > 0 && (
                        <div className="p-4 hover:bg-white/5 transition-colors cursor-pointer">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <Clock className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white text-sm font-medium">Watch Later</p>
                              <p className="text-gray-400 text-xs">{queuedItems.length} title{queuedItems.length > 1 ? 's' : ''} in queue</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {likedItems.length === 0 && queuedItems.length === 0 && (
                        <div className="p-8 text-center">
                          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Bell className="w-6 h-6 text-gray-600" />
                          </div>
                          <p className="text-gray-400 text-sm">No new notifications</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center font-bold text-sm text-white">
                  M
                </div>
                <ChevronDown className={`w-4 h-4 text-white transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </motion.button>
              
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-black/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[200]"
                  >
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center font-bold text-white">
                          M
                        </div>
                        <div>
                          <p className="text-white font-medium">Movie User</p>
                          <p className="text-gray-400 text-xs">Premium Member</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button
                        onClick={() => {
                          if (navigateTo) navigateTo('/liked');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-red-600" />
                        <span className="text-white text-sm">Liked</span>
                        {likedItems.length > 0 && (
                          <span className="ml-auto text-gray-400 text-xs">{likedItems.length}</span>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          if (navigateTo) navigateTo('/queue');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                      >
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="text-white text-sm">Queue</span>
                        {queuedItems.length > 0 && (
                          <span className="ml-auto text-gray-400 text-xs">{queuedItems.length}</span>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          if (navigateTo) navigateTo('/trailers');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                      >
                        <Play className="w-4 h-4 text-red-600" />
                        <span className="text-white text-sm">Trailers</span>
                      </button>
                      
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors">
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span className="text-white text-sm">Settings</span>
                      </button>
                      
                      <div className="border-t border-white/10 my-2" />
                      
                      <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors">
                        <LogOut className="w-4 h-4 text-gray-400" />
                        <span className="text-white text-sm">Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={handleMobileMenuToggle}
              className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[99] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleMobileMenuToggle}
          />

          {/* Mobile Menu Panel */}
          <div className="absolute top-20 right-4 w-80 max-w-[90vw] bg-black/95 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              {/* Mobile Search */}
              <div className="mb-6">
                <form onSubmit={onSearchSubmit}>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => onSearchQueryChange(event.target.value)}
                      placeholder="Search movies..."
                      className="w-full bg-white/10 border border-white/20 px-4 py-3 pl-12 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-all"
                    />
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </form>
              </div>

              {/* Mobile Navigation Items */}
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        handleNavigation(item.path);
                        handleMobileMenuToggle();
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                        item.active && !isSearching
                          ? 'bg-red-600/20 text-red-600 border border-red-600/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
