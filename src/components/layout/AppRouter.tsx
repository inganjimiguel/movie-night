import { useState } from 'react';
import HomePage from '../../pages/home/HomePage';
import FavoritesPage from '../../pages/favorites/FavoritesPage';
import WatchLaterPage from '../../pages/watchlater/WatchLaterPage';
import TVShowsPage from '../../pages/tvshows/TVShowsPage';
import TrailersPage from '../../pages/trailers/TrailersPage';

type PageType = 'home' | 'favorites' | 'watchlater' | 'tvshows' | 'movies' | 'new' | 'trailers';

export default function AppRouter() {
  const [currentPage, setCurrentPage] = useState<PageType>('home');

  const navigateTo = (path: string) => {
    switch (path) {
      case '/':
        setCurrentPage('home');
        break;
      case '/favorites':
        setCurrentPage('favorites');
        break;
      case '/watchlater':
        setCurrentPage('watchlater');
        break;
      case '/tv-shows':
        setCurrentPage('tvshows');
        break;
      case '/movies':
        setCurrentPage('movies');
        break;
      case '/new':
        setCurrentPage('new');
        break;
      case '/trailers':
        setCurrentPage('trailers');
        break;
      default:
        setCurrentPage('home');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigateTo={navigateTo} />;
      case 'favorites':
        return <FavoritesPage navigateTo={navigateTo} />;
      case 'watchlater':
        return <WatchLaterPage navigateTo={navigateTo} />;
      case 'tvshows':
        return <TVShowsPage />;
      case 'trailers':
        return <TrailersPage navigateTo={navigateTo} />;
      case 'movies':
        return <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Movies Page</h1>
            <p className="text-gray-400 mb-8">Browse our complete movie collection</p>
            <button
              onClick={() => navigateTo('/')}
              className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>;
      case 'new':
        return <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">New & Popular</h1>
            <p className="text-gray-400 mb-8">Discover the latest releases and trending content</p>
            <button
              onClick={() => navigateTo('/')}
              className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>;
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };

  return renderPage();
}
