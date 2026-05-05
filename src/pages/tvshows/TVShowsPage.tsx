import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Tv, ArrowLeft, Search, Grid, List, Play } from 'lucide-react';
import ModernMovieCard from '../../components/movies/ModernMovieCard';
import ModernFeaturedHero from '../../components/movies/ModernFeaturedHero';
import ModernMovieDetailsModal from '../../components/movies/ModernMovieDetailsModal';
import { DEFAULT_VIDEO_SOURCE, getVidsrcUrl, getVideoSourceName, type MovieData, type VideoSource } from '../../services/movieService';

const PLAYER_READY_GRACE_MS = 1800;
const PLAYER_LOAD_TIMEOUT_MS = 12000;

// Mock TV shows data (in a real app, this would come from an API)
const mockTVShows = [
  {
    id: 1001,
    name: 'Stranger Things',
    title: 'Stranger Things',
    overview: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
    poster_path: '/x2LSRK2Cm7kQdNQYBZyj5r2jN51.jpg',
    backdrop_path: '/xWCK6mmbgBVpUNQAcYvaqqHnWgr.jpg',
    release_date: '2016-07-15',
    first_air_date: '2016-07-15',
    vote_average: 8.4,
    genre_ids: [10765, 18, 9648],
    media_type: 'tv' as const
  },
  {
    id: 1002,
    name: 'The Crown',
    title: 'The Crown',
    overview: "Follows the political rivalries and romance of Queen Elizabeth II's reign and the events that shaped the second half of the 20th century.",
    poster_path: '/9l1pZ2E9NivxoFp7xgHEhP7yTzl.jpg',
    backdrop_path: '/8kWuhQWA1XWTuV7c6u3zePEVqJp.jpg',
    release_date: '2016-11-04',
    first_air_date: '2016-11-04',
    vote_average: 8.6,
    genre_ids: [18, 10759],
    media_type: 'tv' as const
  },
  {
    id: 1003,
    name: 'Breaking Bad',
    title: 'Breaking Bad',
    overview: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
    poster_path: '/ggFHVNu6YYI5z913tN5GrqBGHcU.jpg',
    backdrop_path: '/3gzJN2T4KxgB2iM2I6hLMWu2g2m.jpg',
    release_date: '2008-01-20',
    first_air_date: '2008-01-20',
    vote_average: 9.5,
    genre_ids: [18, 80],
    media_type: 'tv' as const
  },
  {
    id: 1004,
    name: 'The Mandalorian',
    title: 'The Mandalorian',
    overview: 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.',
    poster_path: '/odJ4hxUgqozB24JbJNgxnWq6nQz.jpg',
    backdrop_path: '/v9L7O1LAMIEjs9jk8kflbKJAdhq.jpg',
    release_date: '2019-11-12',
    first_air_date: '2019-11-12',
    vote_average: 8.7,
    genre_ids: [10759, 10765],
    media_type: 'tv' as const
  },
  {
    id: 1005,
    name: 'Wednesday',
    title: 'Wednesday',
    overview: 'While attending Nevermore Academy, Wednesday Addams attempts to master her emerging psychic ability and solve a murder mystery.',
    poster_path: '/9PFonBhx4pCGnzXvBrlJzya1J9F.jpg',
    backdrop_path: '/9PBvR5LRSAMXK2W4u0hJ2bG7d2j.jpg',
    release_date: '2022-11-16',
    first_air_date: '2022-11-16',
    vote_average: 8.1,
    genre_ids: [10765, 35, 18],
    media_type: 'tv' as const
  },
  {
    id: 1006,
    name: 'House of the Dragon',
    title: 'House of the Dragon',
    overview: "The story of the Targaryen civil war that took place about 200 years before events portrayed in 'Game of Thrones'.",
    poster_path: '/z2yahl2vefxIu4nKDp9U6b9B9CM.jpg',
    backdrop_path: '/p6D5s3jO6S10xvrrk2a8I7mIjAa.jpg',
    release_date: '2022-08-21',
    first_air_date: '2022-08-21',
    vote_average: 8.4,
    genre_ids: [10759, 10765],
    media_type: 'tv' as const
  }
];

export default function TVShowsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'date' | 'rating'>('title');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerLoading, setIsPlayerLoading] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const [playerUrl, setPlayerUrl] = useState<string | null>(null);
  const [currentSource, setCurrentSource] = useState<VideoSource>(DEFAULT_VIDEO_SOURCE);
  const playerTimeoutRef = useRef<number | null>(null);

  const clearPlayerTimeout = () => {
    if (playerTimeoutRef.current) {
      window.clearTimeout(playerTimeoutRef.current);
      playerTimeoutRef.current = null;
    }
  };

  const openShowDetails = (show: MovieData, shouldAutoplay = false) => {
    clearPlayerTimeout();
    setSelectedMovie(show);
    setIsPlaying(false);
    setIsPlayerLoading(false);
    setPlayerError(null);
    setPlayerUrl(null);

    if (shouldAutoplay) {
      void playShow(show);
    }
  };

  const playShow = async (show: MovieData, season = 1, episode = 1, source: VideoSource = currentSource) => {
    clearPlayerTimeout();
    setSelectedMovie(show);
    setIsPlaying(true);
    setIsPlayerLoading(true);
    setPlayerError(null);
    setPlayerUrl(getVidsrcUrl(show, season, episode, source));
    playerTimeoutRef.current = window.setTimeout(() => {
      setIsPlayerLoading(false);
      setPlayerError(`Playback is taking longer than expected on ${getVideoSourceName(source)}. Try switching sources.`);
    }, PLAYER_LOAD_TIMEOUT_MS);
  };

  const handlePlayerReady = () => {
    clearPlayerTimeout();
    window.setTimeout(() => {
      setIsPlayerLoading(false);
    }, PLAYER_READY_GRACE_MS);
  };

  const closeMovieDetails = () => {
    clearPlayerTimeout();
    setSelectedMovie(null);
    setIsPlaying(false);
    setIsPlayerLoading(false);
    setPlayerError(null);
    setPlayerUrl(null);
  };

  useEffect(() => () => clearPlayerTimeout(), []);

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
    <div className="min-h-screen bg-black pt-18 sm:pt-20">
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="flex items-center gap-3">
            <Tv className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              TV Shows
            </h1>
          </div>
        </div>

        <div className="mb-8">
          <ModernFeaturedHero
            movie={mockTVShows[0]}
            isMuted={false}
            onToggleMute={() => {}}
            onPlay={() => openShowDetails(mockTVShows[0], true)}
          />
        </div>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-gray-400">
            <span>{mockTVShows.length} TV shows available</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search TV shows..."
                className="rounded-lg border border-white/20 bg-white/10 py-2 pl-10 pr-4 text-white placeholder-gray-400 transition-colors focus:border-blue-600 focus:outline-none"
              />
            </div>

            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white transition-colors focus:border-blue-600 focus:outline-none"
            >
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>{genre.name}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'title' | 'date' | 'rating')}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-white transition-colors focus:border-blue-600 focus:outline-none"
            >
              <option value="title">Sort by Title</option>
              <option value="date">Sort by Date</option>
              <option value="rating">Sort by Rating</option>
            </select>

            <div className="flex rounded-lg border border-white/20 bg-white/10 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        {sortedTVShows.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-800">
              <Tv className="h-10 w-10 text-gray-600" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-white">No TV shows found</h2>
            <p className="mb-4 text-gray-400">
              No TV shows match your search criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedGenre('all');
              }}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
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
                ? 'grid grid-cols-2 gap-4 pb-12 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                : 'space-y-4 pb-12'
            }
          >
            {sortedTVShows.map((show, index) => (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={
                  viewMode === 'grid' ? '' : 'group flex cursor-pointer gap-4 rounded-lg bg-white/5 p-4 transition-colors hover:bg-white/10'
                }
                onClick={() => openShowDetails(show)}
              >
                {viewMode === 'grid' ? (
                  <ModernMovieCard
                    movie={show}
                    layout="poster"
                    size="medium"
                    onSelect={(item) => openShowDetails(item)}
                    showPlayButton={true}
                  />
                ) : (
                  <>
                    <div className="relative h-36 w-24 flex-shrink-0">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
                        alt={show.title}
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-2 truncate text-lg font-bold text-white">{show.title}</h3>
                      <p className="mb-2 line-clamp-2 text-sm text-gray-400">{show.overview}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{show.release_date.split('-')[0]}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span>{show.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            void playShow(show);
                          }}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
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

      <ModernMovieDetailsModal
        movie={selectedMovie}
        isPlaying={isPlaying}
        isPlayerLoading={isPlayerLoading}
        playerError={playerError}
        playerUrl={playerUrl}
        relatedMovies={[]}
        currentSource={currentSource}
        onClose={closeMovieDetails}
        onPlay={(season, episode) => selectedMovie && void playShow(selectedMovie, season, episode, currentSource)}
        onSourceChange={(source, season, episode) => {
          setCurrentSource(source);
          if (selectedMovie) {
            void playShow(selectedMovie, season, episode, source);
          }
        }}
        onPlayerReady={handlePlayerReady}
      />
    </div>
  );
}
