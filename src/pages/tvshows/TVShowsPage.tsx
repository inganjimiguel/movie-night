import { useState } from 'react';
import { motion } from 'motion/react';
import { Tv, ArrowLeft, Search, Filter, Grid, List, Play, TrendingUp } from 'lucide-react';
import ModernMovieCard from '../../components/movies/ModernMovieCard';

// Mock TV shows data (in a real app, this would come from an API)
const mockTVShows = [
  {
    id: 1001,
    title: "Stranger Things",
    overview: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
    poster_path: "/x2LSRK2Cm7kQdNQYBZyj5r2jN51.jpg",
    backdrop_path: "/xWCK6mmbgBVpUNQAcYvaqqHnWgr.jpg",
    release_date: "2016-07-15",
    vote_average: 8.4,
    genre_ids: [10765, 18, 9648]
  },
  {
    id: 1002,
    title: "The Crown",
    overview: "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the 20th century.",
    poster_path: "/9l1pZ2E9NivxoFp7xgHEhP7yTzl.jpg",
    backdrop_path: "/8kWuhQWA1XWTuV7c6u3zePEVqJp.jpg",
    release_date: "2016-11-04",
    vote_average: 8.6,
    genre_ids: [18, 10759]
  },
  {
    id: 1003,
    title: "Breaking Bad",
    overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.",
    poster_path: "/ggFHVNu6YYI5z913tN5GrqBGHcU.jpg",
    backdrop_path: "/3gzJN2T4KxgB2iM2I6hLMWu2g2m.jpg",
    release_date: "2008-01-20",
    vote_average: 9.5,
    genre_ids: [18, 80]
  },
  {
    id: 1004,
    title: "The Mandalorian",
    overview: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
    poster_path: "/odJ4hxUgqozB24JbJNgxnWq6nQz.jpg",
    backdrop_path: "/v9L7O1LAMIEjs9jk8kflbKJAdhq.jpg",
    release_date: "2019-11-12",
    vote_average: 8.7,
    genre_ids: [10759, 10765]
  },
  {
    id: 1005,
    title: "Wednesday",
    overview: "While attending Nevermore Academy, Wednesday Addams attempts to master her emerging psychic ability and solve a murder mystery.",
    poster_path: "/9PFonBhx4pCGnzXvBrlJzya1J9F.jpg",
    backdrop_path: "/9PBvR5LRSAMXK2W4u0hJ2bG7d2j.jpg",
    release_date: "2022-11-16",
    vote_average: 8.1,
    genre_ids: [10765, 35, 18]
  },
  {
    id: 1006,
    title: "House of the Dragon",
    overview: "The story of the Targaryen civil war that took place about 200 years before events portrayed in 'Game of Thrones'.",
    poster_path: "/z2yahl2vefxIu4nKDp9U6b9B9CM.jpg",
    backdrop_path: "/p6D5s3jO6S10xvrrk2a8I7mIjAa.jpg",
    release_date: "2022-08-21",
    vote_average: 8.4,
    genre_ids: [10759, 10765]
  }
];

export default function TVShowsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'rating'>('title');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const filteredTVShows = mockTVShows.filter(show =>
    show.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedGenre === 'all' || show.genre_ids.includes(parseInt(selectedGenre)))
  );

  const sortedTVShows = [...filteredTVShows].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'date':
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      case 'rating':
        return b.vote_average - a.vote_average;
      default:
        return 0;
    }
  });

  const genres = [
    { id: 'all', name: 'All Genres' },
    { id: '10759', name: 'Action & Adventure' },
    { id: '16', name: 'Animation' },
    { id: '35', name: 'Comedy' },
    { id: '80', name: 'Crime' },
    { id: '18', name: 'Drama' },
    { id: '99', name: 'Documentary' },
    { id: '10751', name: 'Family' },
    { id: '10762', name: 'Kids' },
    { id: '9648', name: 'Mystery' },
    { id: '10763', name: 'News' },
    { id: '10764', name: 'Reality' },
    { id: '10765', name: 'Sci-Fi & Fantasy' },
    { id: '10766', name: 'Soap' },
    { id: '10767', name: 'Talk' },
    { id: '10768', name: 'War & Politics' },
    { id: '37', name: 'Western' }
  ];

  return (
    <div className="min-h-screen bg-black pt-4">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <Tv className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                Watch TV Shows Online
              </h1>
            </div>
          </div>

          {/* Featured Show */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold text-white">Featured This Week</h2>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <img
                src={`https://image.tmdb.org/t/p/original${mockTVShows[0].backdrop_path}`}
                alt={mockTVShows[0].title}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{mockTVShows[0].title}</h3>
                <p className="text-gray-300 mb-4 line-clamp-2">{mockTVShows[0].overview}</p>
                <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Watch Now
                </button>
              </div>
            </div>
          </div>

          {/* Stats and Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="text-gray-400">
              <span>{mockTVShows.length} TV shows available</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search TV shows..."
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              {/* Genre Filter */}
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-600 transition-colors"
              >
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-600 transition-colors"
              >
                <option value="title">Sort by Title</option>
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
              </select>

              {/* View Mode */}
              <div className="flex bg-white/10 border border-white/20 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8">
          {sortedTVShows.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tv className="w-10 h-10 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">No TV shows found</h2>
              <p className="text-gray-400 mb-4">
                No TV shows match your search criteria
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGenre('all');
                }}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={
                viewMode === 'grid'
                  ? `grid grid-cols-2 justify-items-center gap-3 pb-12 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`
                  : `space-y-4 pb-12`
              }
            >
              {sortedTVShows.map((show, index) => (
                <motion.div
                  key={show.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={
                    viewMode === 'grid' ? '' : 'flex gap-4 bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer group'
                  }
                  onClick={() => {}}
                >
                  {viewMode === 'grid' ? (
                    <ModernMovieCard
                      movie={show}
                      layout="poster"
                      size="medium"
                      onSelect={() => {}}
                      showPlayButton={true}
                    />
                  ) : (
                    <>
                      <div className="w-24 h-36 flex-shrink-0 relative group">
                        <img
                          src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                          alt={show.title}
                          className="w-full h-full object-cover rounded-lg"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white mb-2 truncate">{show.title}</h3>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">{show.overview}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{show.release_date.split('-')[0]}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span>{show.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="mt-3">
                          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                            Watch Now
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
    </div>
  );
}
