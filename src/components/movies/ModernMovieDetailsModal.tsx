import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  Check,
  Clock,
  Download,
  Heart,
  LoaderCircle,
  Play,
  Share2,
  SkipBack,
  SkipForward,
  Star,
  Tv2,
  X,
} from 'lucide-react';
import { useContinueWatching } from '../../contexts/ContinueWatchingContext';
import Badge from '../common/Badge';
import VideoSourceSelector from '../video/VideoSourceSelector';
import VideoLoadingBanner from '../ui/VideoLoadingBanner';
import {
  getContentReleaseDate,
  getContentTitle,
  getContentTypeLabel,
  getContentYear,
  getEditorialContentDetails,
  getGenreNames,
  getImageUrl,
  getSimilarContentForDetails,
  getVideoSourceName,
  getTvEpisodeDetails,
  getTvShowDetails,
  getVidsrcUrl,
  isTvLikeContent,
  type MovieData,
  type EditorialContentDetails,
  type TvEpisodeDetails,
  type TvShowDetails,
  type VideoSource,
} from '../../services/movieService';
import { useMediaLibrary } from '../../contexts/MediaLibraryContext';

interface ModernMovieDetailsModalProps {
  movie: MovieData | null;
  initialSeason?: number;
  initialEpisode?: number;
  isPlaying: boolean;
  isPlayerLoading: boolean;
  playerError: string | null;
  playerUrl: string | null;
  relatedMovies: MovieData[];
  currentSource: VideoSource;
  onClose: () => void;
  onPlay: (season?: number, episode?: number) => void;
  onPlaySimilar?: (movie: MovieData, season?: number, episode?: number) => void;
  onSourceChange: (source: VideoSource, season?: number, episode?: number) => void;
  onPlayerReady?: () => void;
}

export default function ModernMovieDetailsModal({
  movie,
  initialSeason = 1,
  initialEpisode = 1,
  isPlaying,
  isPlayerLoading,
  playerError,
  playerUrl,
  currentSource,
  onClose,
  onPlay,
  onPlaySimilar,
  onSourceChange,
  onPlayerReady,
}: ModernMovieDetailsModalProps) {
  const [tvDetails, setTvDetails] = useState<TvShowDetails | null>(null);
  const [episodeDetails, setEpisodeDetails] = useState<TvEpisodeDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isEpisodeLoading, setIsEpisodeLoading] = useState(false);
  const [editorialDetails, setEditorialDetails] = useState<EditorialContentDetails | null>(null);
  const [isEditorialLoading, setIsEditorialLoading] = useState(false);
  const [similarItems, setSimilarItems] = useState<MovieData[]>([]);
  const [isSimilarLoading, setIsSimilarLoading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  const { hasLikedItem, toggleLikedItem, hasQueuedItem, toggleQueuedItem } = useMediaLibrary();
  const { getEntry, markAsWatched, removeEntry, markEpisodeWatched } = useContinueWatching();

  const title = movie ? getContentTitle(movie) : '';
  const releaseDate = movie ? getContentReleaseDate(movie) : '';
  const year = movie ? getContentYear(movie) : 'N/A';
  const contentType = movie ? getContentTypeLabel(movie) : 'Movie';
  const isSeries = movie ? isTvLikeContent(movie) : false;
  const detailsRequestKey = movie ? `${isSeries ? 'tv' : 'movie'}:${movie.id}` : '';
  const isLiked = movie ? hasLikedItem(movie) : false;
  const isInQueue = movie ? hasQueuedItem(movie) : false;
  const continueWatchingEntry = movie ? getEntry(movie) : undefined;

  const availableSeasons = useMemo(
    () => (tvDetails?.seasons ?? []).filter((season) => season.season_number > 0 && season.episode_count > 0),
    [tvDetails]
  );

  const selectedSeasonData = useMemo(
    () => availableSeasons.find((season) => season.season_number === selectedSeason) ?? availableSeasons[0] ?? null,
    [availableSeasons, selectedSeason]
  );

  const maxEpisode = selectedSeasonData?.episode_count ?? 1;
  const effectiveSeason = selectedSeasonData?.season_number ?? selectedSeason;
  const effectiveEpisode = Math.min(selectedEpisode, maxEpisode);
  const currentVideoUrl = movie
    ? (
        isSeries
          ? playerUrl || (isPlaying ? getVidsrcUrl(movie, effectiveSeason, effectiveEpisode, currentSource) : null)
          : playerUrl || (isPlaying ? getVidsrcUrl(movie, 1, 1, currentSource) : null)
      )
    : null;
  const heroImagePath = isSeries && episodeDetails?.still_path ? episodeDetails.still_path : movie?.backdrop_path;
  const summaryText = isSeries ? episodeDetails?.overview || movie?.overview || '' : movie?.overview || '';
  const runtimeLabel = editorialDetails?.runtime ? `${editorialDetails.runtime} min` : isSeries ? 'Episode length varies' : 'HD stream';
  const detailGenres = editorialDetails?.genres.length ? editorialDetails.genres.join(', ') : getGenreNames(movie?.genre_ids || []);
  const crewHighlights = editorialDetails?.crew
    .filter((person) => /director|creator|showrunner|screenplay|writer|producer/i.test(person.role))
    .slice(0, 4);
  const watchedEpisodes = continueWatchingEntry?.watchedEpisodes ?? [];
  const watchedEpisodeKeys = useMemo(
    () => new Set(watchedEpisodes.map((entry) => `${entry.season}:${entry.episode}`)),
    [watchedEpisodes]
  );
  const watchedCount = watchedEpisodes.length;
  const downloadTargetUrl = movie
    ? (
        isSeries
          ? getVidsrcUrl(movie, effectiveSeason, effectiveEpisode, 'sflix')
          : getVidsrcUrl(movie, 1, 1, 'sflix')
      )
    : null;

  useEffect(() => {
    if (!movie) return;

    setSelectedSeason(Math.max(1, initialSeason));
    setSelectedEpisode(Math.max(1, initialEpisode));
  }, [detailsRequestKey, initialEpisode, initialSeason, movie]);

  useEffect(() => {
    if (!movie) return;

    const previousTitle = document.title;
    const previousDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    const description = `Watch ${title}${year !== 'N/A' ? ` (${year})` : ''} on Movie Night with ${isSeries ? 'episode navigation' : 'HD playback'}, cast details, viewer notes, and similar ${isSeries ? 'TV shows' : 'movies'}.`;

    document.title = `Watch ${title} | Movie Night`;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[property="${name}"]`) || document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMetaTag('og:title', `Watch ${title} | Movie Night`);
    updateMetaTag('og:description', description);
    updateMetaTag('twitter:title', `Watch ${title} | Movie Night`);
    updateMetaTag('twitter:description', description);

    setTvDetails(null);
    setEpisodeDetails(null);
    setEditorialDetails(null);
    setSimilarItems([]);
    setSelectedSeason(Math.max(1, initialSeason));
    setSelectedEpisode(Math.max(1, initialEpisode));
    setIsEpisodeLoading(false);
    setIsEditorialLoading(true);
    setIsSimilarLoading(true);
    setDownloadMessage(null);

    let cancelled = false;

    void getEditorialContentDetails(movie)
      .then((details) => {
        if (cancelled) return;
        setEditorialDetails(details);
      })
      .catch((error) => {
        console.error('Editorial details failed:', error);
        if (!cancelled) setEditorialDetails(null);
      })
      .finally(() => {
        if (!cancelled) setIsEditorialLoading(false);
      });

    void getSimilarContentForDetails(movie)
      .then((items) => {
        if (cancelled) return;
        setSimilarItems(items);
      })
      .catch((error) => {
        console.error('Similar details failed:', error);
        if (!cancelled) setSimilarItems([]);
      })
      .finally(() => {
        if (!cancelled) setIsSimilarLoading(false);
      });

    if (!isTvLikeContent(movie)) {
      return () => {
        cancelled = true;
        setIsEditorialLoading(false);
        setIsSimilarLoading(false);
        document.title = previousTitle;
        metaDescription.setAttribute('content', previousDescription);
      };
    }

    void getTvShowDetails(movie.id).then((details) => {
      if (cancelled || !details) return;
      setTvDetails(details);
      const firstSeason = details.seasons.find((season) => season.season_number > 0 && season.episode_count > 0);
      const preferredSeason = details.seasons.find(
        (season) => season.season_number === Math.max(1, initialSeason) && season.season_number > 0 && season.episode_count > 0
      );
      const targetSeason = preferredSeason ?? firstSeason;

      if (targetSeason) {
        setSelectedSeason(targetSeason.season_number);
        setSelectedEpisode(Math.max(1, initialEpisode));
      }
    });

    return () => {
      cancelled = true;
      setIsEditorialLoading(false);
      setIsSimilarLoading(false);
      document.title = previousTitle;
      metaDescription.setAttribute('content', previousDescription);
    };
  }, [detailsRequestKey, initialEpisode, initialSeason]);

  useEffect(() => {
    if (!selectedSeasonData) return;
    if (selectedEpisode > selectedSeasonData.episode_count) {
      setSelectedEpisode(selectedSeasonData.episode_count);
    }
  }, [selectedEpisode, selectedSeasonData]);

  useEffect(() => {
    if (!movie || !isSeries) return;

    let cancelled = false;
    setIsEpisodeLoading(true);

    void getTvEpisodeDetails(movie.id, effectiveSeason, effectiveEpisode).then((details) => {
      if (cancelled) return;
      setEpisodeDetails(details);
      setIsEpisodeLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [movie, isSeries, effectiveSeason, effectiveEpisode]);

  useEffect(() => {
    if (!movie) return;

    const structuredData = buildContentStructuredData({
      movie,
      title,
      description: editorialDetails?.editorialBlurb || summaryText || movie.overview,
      releaseDate,
      image: getImageUrl(movie.poster_path || movie.backdrop_path, 'original'),
      url: window.location.href,
      isSeries,
      genres: editorialDetails?.genres.length ? editorialDetails.genres : getGenreNames(movie.genre_ids).split(', ').filter(Boolean),
      cast: editorialDetails?.cast ?? [],
      crew: editorialDetails?.crew ?? [],
      runtime: editorialDetails?.runtime
    });

    let structuredScript = document.querySelector<HTMLScriptElement>('#movie-night-content-jsonld');
    if (!structuredScript) {
      structuredScript = document.createElement('script');
      structuredScript.id = 'movie-night-content-jsonld';
      structuredScript.type = 'application/ld+json';
      document.head.appendChild(structuredScript);
    }
    structuredScript.textContent = JSON.stringify(structuredData);

    return () => {
      structuredScript?.remove();
    };
  }, [movie, title, editorialDetails, summaryText, releaseDate, isSeries]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  const handleLike = () => {
    toggleLikedItem(movie);
  };

  const handleQueue = () => {
    toggleQueuedItem(movie);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title,
        text: movie.overview,
        url: window.location.href,
      });
    }
  };

  const buildDownloadName = () => {
    const safeTitle = title.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '').replace(/\s+/g, ' ').trim() || 'Movie';
    const signature = 'MovieNight';

    if (isSeries) {
      return `${signature} - ${safeTitle} - S${String(effectiveSeason).padStart(2, '0')}E${String(effectiveEpisode).padStart(2, '0')}.mp4`;
    }

    return `${signature} - ${safeTitle}.mp4`;
  };

  const triggerBrowserDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownload = async () => {
    if (!downloadTargetUrl) return;

    setDownloadMessage('Preparing your download...');
    const fileName = buildDownloadName();

    try {
      const response = await fetch(downloadTargetUrl);
      if (!response.ok) {
        throw new Error(`Download request failed with ${response.status}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      triggerBrowserDownload(blobUrl, fileName);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      setDownloadMessage(`Download started as ${fileName}.`);
    } catch (error) {
      console.error('Direct download fallback triggered:', error);
      triggerBrowserDownload(downloadTargetUrl, fileName);
      setDownloadMessage('The source did not expose a direct file, so we opened the active stream source instead.');
    }
  };

  const handleEpisodeStep = (direction: 'prev' | 'next') => {
    if (!selectedSeasonData) return;

    if (direction === 'prev') {
      if (effectiveEpisode > 1) {
        setSelectedEpisode((episode) => episode - 1);
        return;
      }

      const previousSeasonIndex =
        availableSeasons.findIndex((season) => season.season_number === selectedSeasonData.season_number) - 1;
      const previousSeason = availableSeasons[previousSeasonIndex];
      if (previousSeason) {
        setSelectedSeason(previousSeason.season_number);
        setSelectedEpisode(previousSeason.episode_count);
      }
      return;
    }

    if (effectiveEpisode < selectedSeasonData.episode_count) {
      setSelectedEpisode((episode) => episode + 1);
      return;
    }

    const nextSeasonIndex =
      availableSeasons.findIndex((season) => season.season_number === selectedSeasonData.season_number) + 1;
    const nextSeason = availableSeasons[nextSeasonIndex];
    if (nextSeason) {
      setSelectedSeason(nextSeason.season_number);
      setSelectedEpisode(1);
    }
  };

  const handlePlayClick = () => {
    if (isSeries) {
      onPlay(effectiveSeason, effectiveEpisode);
      return;
    }

    onPlay();
  };

  const handleSourceChange = (source: VideoSource) => {
    if (source === currentSource) return;

    if (isSeries) {
      onSourceChange(source, effectiveSeason, effectiveEpisode);
      return;
    }

    onSourceChange(source);
  };

  const getNextEpisodeTarget = () => {
    if (!selectedSeasonData) {
      return null;
    }

    if (effectiveEpisode < selectedSeasonData.episode_count) {
      return {
        season: effectiveSeason,
        episode: effectiveEpisode + 1,
      };
    }

    const currentSeasonIndex = availableSeasons.findIndex((season) => season.season_number === effectiveSeason);
    const nextSeason = availableSeasons[currentSeasonIndex + 1];
    if (!nextSeason) {
      return null;
    }

    return {
      season: nextSeason.season_number,
      episode: 1,
    };
  };

  const handleMarkSelectedEpisodeWatched = () => {
    if (!movie || !isSeries) return;

    const nextTarget = getNextEpisodeTarget();
    markEpisodeWatched(movie, {
      season: effectiveSeason,
      episode: effectiveEpisode,
      source: currentSource,
      resumeSeason: nextTarget?.season ?? effectiveSeason,
      resumeEpisode: nextTarget?.episode ?? effectiveEpisode,
    });

    if (nextTarget) {
      setSelectedSeason(nextTarget.season);
      setSelectedEpisode(nextTarget.episode);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          className="flex h-full flex-col overflow-y-auto bg-black"
        >
          <div className="fixed left-3 right-3 top-3 z-[1002] flex max-w-[calc(100vw-24px)] items-center gap-3 rounded-full border border-white/10 bg-black/70 px-3 py-2 shadow-xl backdrop-blur-md sm:left-6 sm:right-auto sm:top-6 sm:max-w-[min(560px,calc(100vw-48px))]">
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              aria-label="Close details"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <div className="min-w-0 pr-2">
              <p className="truncate text-sm font-semibold text-white sm:text-base">{title}</p>
              <p className="text-[11px] text-gray-400">{contentType}</p>
            </div>
          </div>

          <div className="relative mt-16 bg-black px-0 sm:px-6 lg:px-8">
            {isPlaying && currentVideoUrl ? (
              <div className="relative z-0 mx-auto aspect-video w-full max-w-6xl overflow-hidden rounded-b-[1.5rem] bg-black">
                <iframe
                  key={currentVideoUrl}
                  src={currentVideoUrl}
                  className="h-full w-full border-0"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  loading="eager"
                  title={`${title} player`}
                  referrerPolicy="strict-origin-when-cross-origin"
                  onLoad={onPlayerReady}
                />
              </div>
            ) : (
              <div className="relative z-0 mx-auto aspect-video w-full max-w-6xl overflow-hidden rounded-b-[1.5rem] bg-black">
                <img src={getImageUrl(heroImagePath || movie.backdrop_path, 'original')} alt={title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/60" />

                <div className="absolute inset-0 p-4 sm:p-8 lg:p-12">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-3xl space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge text="HD" className="border border-white/20 bg-white/10 text-white" />
                        <Badge text={contentType} className="bg-red-600/80 text-white" />
                        {isSeries && <Badge text={`S${effectiveSeason} • E${effectiveEpisode}`} className="bg-sky-600/80 text-white" />}
                      </div>
                      <h1 className="break-words text-2xl font-black leading-tight text-white sm:text-4xl lg:text-6xl">{title}</h1>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-200 sm:text-base">
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                          {movie.vote_average.toFixed(1)}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{year}</span>
                        {isSeries && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="inline-flex items-center gap-1">
                              <Tv2 className="h-4 w-4 text-sky-400" />
                              {episodeDetails?.name || `Season ${effectiveSeason}, Episode ${effectiveEpisode}`}
                            </span>
                          </>
                        )}
                      </div>
                      {isSeries && (
                        <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-sm">
                          <p className="text-sm font-medium text-white">
                            {isEpisodeLoading
                              ? `Loading Season ${effectiveSeason}, Episode ${effectiveEpisode} details...`
                              : episodeDetails?.name || `Season ${effectiveSeason}, Episode ${effectiveEpisode}`}
                          </p>
                          <p className="mt-1 text-xs text-gray-300">
                            {isEpisodeLoading
                              ? 'Hang tight, we are getting the episode image and info ready for you.'
                              : 'Episode 1 is the default starting point so you can jump in immediately.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePlayClick}
                  disabled={isPlayerLoading}
                  className="absolute left-1/2 top-1/2 z-10 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-2xl transition-all hover:bg-gray-100 disabled:opacity-50 sm:h-24 sm:w-24"
                  aria-label={`Play ${title}`}
                >
                  {isPlayerLoading ? <LoaderCircle className="h-9 w-9 animate-spin" /> : <Play className="ml-1 h-9 w-9 fill-black" />}
                </motion.button>
              </div>
            )}

            <AnimatePresence>
              {isPlayerLoading && (
                <VideoLoadingBanner
                  isLoading={isPlayerLoading}
                  message={isSeries ? `Loading Season ${effectiveSeason}, Episode ${effectiveEpisode}... grab a snack.` : 'Loading a movie player... grab a snack.'}
                  showConnectionStatus={true}
                />
              )}
            </AnimatePresence>
          </div>

          <div className="relative z-0 bg-black">
            <div className="grid gap-8 px-4 pt-6 pb-6 sm:px-6 sm:pt-8 lg:grid-cols-[minmax(0,1fr)] lg:px-8">
              <div className="flex flex-col gap-5">
                <div className="relative z-0 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-5">
                    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center">
                    <button
                      onClick={handlePlayClick}
                      className="min-h-11 rounded-xl bg-white/12 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20 sm:px-5 sm:text-base"
                    >
                      {isSeries ? `Play S${effectiveSeason}E${effectiveEpisode}` : 'Play Now'}
                    </button>
                    <button
                      onClick={handleQueue}
                      className={`min-h-11 rounded-xl border px-3 py-3 text-sm transition-colors sm:px-4 sm:text-base ${
                        isInQueue ? 'border-green-500 bg-green-600/20 text-white' : 'border-white/20 bg-white/10 text-gray-100 hover:bg-white/20'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {isInQueue ? 'Queued' : 'Queue'}
                      </span>
                    </button>
                    <button
                      onClick={handleLike}
                      className={`min-h-11 rounded-xl border px-3 py-3 text-sm transition-colors sm:px-4 sm:text-base ${
                        isLiked ? 'border-red-500 bg-red-600/20 text-white' : 'border-white/20 bg-white/10 text-gray-100 hover:bg-white/20'
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                        {isLiked ? 'Liked' : 'Like'}
                      </span>
                    </button>
                    <button
                      onClick={() => void handleShare()}
                      className="min-h-11 rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-sm text-white transition-colors hover:bg-white/20 sm:px-4 sm:text-base"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Share
                      </span>
                    </button>
                    <button
                      onClick={() => void handleDownload()}
                      className="min-h-11 rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-sm text-white transition-colors hover:bg-white/20 sm:px-4 sm:text-base"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download
                      </span>
                    </button>
                    </div>
                  </div>
                  {downloadMessage && <p className="mt-3 text-sm text-gray-300">{downloadMessage}</p>}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3">
                    <h3 className="text-base font-semibold text-white">Playback Source</h3>
                    <p className="mt-1 text-sm text-gray-400">
                      If one player opens to a black screen, switch to another source here and try again.
                    </p>
                  </div>
                  <VideoSourceSelector
                    currentSource={currentSource}
                    onSourceChange={handleSourceChange}
                    disabled={false}
                  />
                </div>

                {continueWatchingEntry && (
                  <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Continue Watching</h3>
                        <p className="mt-1 text-sm text-sky-100/80">
                          {continueWatchingEntry.isSeries
                            ? `Resume from Season ${continueWatchingEntry.season ?? 1}, Episode ${continueWatchingEntry.episode ?? 1}, with ${watchedCount} watched ${watchedCount === 1 ? 'episode' : 'episodes'} already marked.`
                            : 'This movie is saved in your in-progress rail so you can jump back in quickly.'}
                        </p>
                      </div>
                      <div className="rounded-full bg-black/30 px-3 py-1 text-sm text-white">
                        Last source: {getVideoSourceName(continueWatchingEntry.lastSource)}
                      </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-gray-200">
                        <p className="font-medium text-white">
                          {continueWatchingEntry.isSeries
                            ? `Saved point: S${continueWatchingEntry.season ?? 1} • E${continueWatchingEntry.episode ?? 1}`
                            : 'Saved point: Started movie'}
                        </p>
                        <p className="mt-1 text-gray-400">Last opened {formatLastOpened(continueWatchingEntry.lastOpenedAt)}</p>
                        {continueWatchingEntry.isSeries && continueWatchingEntry.latestWatchedSeason && continueWatchingEntry.latestWatchedEpisode ? (
                          <p className="mt-1 text-gray-400">
                            Latest watched: S{continueWatchingEntry.latestWatchedSeason} â€¢ E{continueWatchingEntry.latestWatchedEpisode}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => markAsWatched(continueWatchingEntry.entryKey)}
                          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 transition-colors hover:bg-emerald-500/20"
                        >
                          <span className="inline-flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Mark Watched
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEntry(continueWatchingEntry.entryKey)}
                          className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-gray-200 transition-colors hover:bg-white/10"
                        >
                          <span className="inline-flex items-center gap-2">
                            <X className="h-4 w-4" />
                            Remove
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isSeries && (
                  <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-semibold text-white">Episode Navigation</h4>
                        <p className="text-sm text-sky-100/80">Tap a season, tap an episode, then press play.</p>
                      </div>
                      <div className="rounded-full bg-black/30 px-3 py-1 text-sm text-white">
                        S{effectiveSeason} • E{effectiveEpisode}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="mb-2 text-sm text-gray-300">Seasons</p>
                        <div className="flex flex-wrap gap-2">
                          {availableSeasons.map((season) => {
                            const seasonNumber = season.season_number;
                            const hasWatchedEpisodes = watchedEpisodes.some((entry) => entry.season === seasonNumber);
                            const isLatestWatchedSeason = continueWatchingEntry?.latestWatchedSeason === seasonNumber;

                            return (
                              <button
                                key={seasonNumber}
                                onClick={() => {
                                  setSelectedSeason(seasonNumber);
                                  setSelectedEpisode(1);
                                }}
                                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                                  effectiveSeason === seasonNumber
                                    ? 'bg-sky-500 text-white'
                                    : hasWatchedEpisodes
                                      ? 'border border-emerald-400/25 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15'
                                      : 'border border-white/15 bg-black/35 text-gray-200 hover:bg-white/10'
                                }`}
                              >
                                <span className="inline-flex items-center gap-2">
                                  Season {seasonNumber}
                                  {isLatestWatchedSeason ? (
                                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-white">
                                      Latest
                                    </span>
                                  ) : hasWatchedEpisodes ? (
                                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-100">
                                      Watched
                                    </span>
                                  ) : null}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-sm text-gray-300">Episodes</p>
                        <div className="flex max-h-52 flex-wrap gap-2 overflow-y-auto pr-1">
                          {Array.from({ length: maxEpisode }, (_, index) => index + 1).map((episodeNumber) => {
                            const episodeKey = `${effectiveSeason}:${episodeNumber}`;
                            const isWatchedEpisode = watchedEpisodeKeys.has(episodeKey);
                            const isLatestWatchedEpisode =
                              continueWatchingEntry?.latestWatchedSeason === effectiveSeason &&
                              continueWatchingEntry?.latestWatchedEpisode === episodeNumber;
                            const isResumeEpisode =
                              continueWatchingEntry?.season === effectiveSeason &&
                              continueWatchingEntry?.episode === episodeNumber;

                            return (
                              <button
                                key={episodeNumber}
                                onClick={() => setSelectedEpisode(episodeNumber)}
                                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                                  effectiveEpisode === episodeNumber
                                    ? 'bg-white text-black'
                                    : isLatestWatchedEpisode
                                      ? 'border border-emerald-300/40 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/25'
                                      : isResumeEpisode
                                        ? 'border border-sky-300/35 bg-sky-500/20 text-sky-100 hover:bg-sky-500/25'
                                        : isWatchedEpisode
                                          ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15'
                                          : 'border border-white/15 bg-black/35 text-gray-200 hover:bg-white/10'
                                }`}
                              >
                                <span className="inline-flex items-center gap-2">
                                  Episode {episodeNumber}
                                  {isLatestWatchedEpisode ? (
                                    <span className="rounded-full bg-emerald-500/25 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-100">
                                      Latest
                                    </span>
                                  ) : isResumeEpisode ? (
                                    <span className="rounded-full bg-sky-500/25 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-sky-100">
                                      Resume
                                    </span>
                                  ) : isWatchedEpisode ? (
                                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-100">
                                      Watched
                                    </span>
                                  ) : null}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-100">
                            Watched
                          </span>
                          <span className="rounded-full border border-sky-300/25 bg-sky-500/10 px-3 py-1 text-sky-100">
                            Resume
                          </span>
                          <span className="rounded-full border border-emerald-300/25 bg-emerald-500/20 px-3 py-1 text-emerald-100">
                            Latest watched
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleEpisodeStep('prev')}
                        disabled={effectiveSeason === availableSeasons[0]?.season_number && effectiveEpisode === 1}
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span className="inline-flex items-center gap-2">
                          <SkipBack className="h-4 w-4" />
                          Previous Episode
                        </span>
                      </button>
                      <button
                        onClick={() => handleEpisodeStep('next')}
                        disabled={
                          effectiveSeason === availableSeasons[availableSeasons.length - 1]?.season_number &&
                          effectiveEpisode === maxEpisode
                        }
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <span className="inline-flex items-center gap-2">
                          <SkipForward className="h-4 w-4" />
                          Next Episode
                        </span>
                      </button>
                      <button
                        onClick={handlePlayClick}
                        className="rounded-xl bg-sky-600 px-4 py-3 font-medium text-white transition-colors hover:bg-sky-500"
                      >
                        Play Selected Episode
                      </button>
                      <button
                        onClick={handleMarkSelectedEpisodeWatched}
                        className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 font-medium text-emerald-100 transition-colors hover:bg-emerald-500/20"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          Mark Selected Watched
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mb-3 text-xl font-bold text-white">{isSeries ? 'Episode Summary' : 'Synopsis'}</h3>
                  <p className="leading-relaxed text-gray-300">{summaryText}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">Movie Night Take</h3>
                      <p className="mt-1 text-sm text-gray-400">Original page notes built from cast, crew, format, and viewer signals.</p>
                    </div>
                    {isEditorialLoading && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-gray-300">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Loading details
                      </span>
                    )}
                  </div>
                  <p className="leading-relaxed text-gray-300">
                    {editorialDetails?.editorialBlurb ||
                      `${title} is listed on Movie Night with quick watch facts, playback options, and curated context so visitors can decide what to stream next.`}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailCard label="Type" value={contentType} />
                  <DetailCard label="Release Date" value={releaseDate || 'N/A'} />
                  <DetailCard label="Rating" value={`${movie.vote_average.toFixed(1)}/10`} />
                  <DetailCard label={isSeries ? 'Runtime' : 'Runtime'} value={runtimeLabel} />
                  <DetailCard label="Status" value={editorialDetails?.status || 'Available'} />
                  <DetailCard label="Streaming Quality" value="HD playback with multiple player sources" />
                  <DetailCard label="Genres" value={detailGenres || 'N/A'} />
                  {editorialDetails?.tagline && <DetailCard label="Tagline" value={editorialDetails.tagline} />}
                  {editorialDetails?.languages.length ? <DetailCard label="Languages" value={editorialDetails.languages.slice(0, 4).join(', ')} /> : null}
                  {isSeries && episodeDetails && <DetailCard label="Selected Episode" value={episodeDetails.name} />}
                </div>

                {(isEditorialLoading || editorialDetails?.cast.length || crewHighlights?.length) ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {editorialDetails?.cast.length ? (
                      <PeoplePanel title="Cast" people={editorialDetails.cast} />
                    ) : isEditorialLoading ? (
                      <LoadingPanel title="Cast" message="Loading cast details..." />
                    ) : null}
                    {crewHighlights?.length ? (
                      <PeoplePanel title="Crew" people={crewHighlights} />
                    ) : isEditorialLoading ? (
                      <LoadingPanel title="Crew" message="Loading director and crew details..." />
                    ) : null}
                  </div>
                ) : null}

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-white">Viewer Activity</h3>
                      <p className="mt-1 text-sm text-gray-400">Ratings, saved-list intent, and comments add useful signals beyond the basic description.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-yellow-200">{movie.vote_average.toFixed(1)}/10 rating</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-gray-200">{isLiked ? 'Liked by you' : 'Like to rate'}</span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-gray-200">{isInQueue ? 'In your queue' : 'Queue available'}</span>
                    </div>
                  </div>
                  {editorialDetails?.reviews.length ? (
                    <div className="grid gap-3 lg:grid-cols-3">
                      {editorialDetails.reviews.map((review) => (
                        <div key={`${review.author}-${review.content.slice(0, 18)}`} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                          <p className="text-sm font-semibold text-white">{review.author}</p>
                          <p className="mt-2 line-clamp-5 text-sm leading-relaxed text-gray-300">{review.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300">Be the first to shape this title on your list by liking it, queueing it, or sharing it with friends.</p>
                  )}
                </div>

                {(isSimilarLoading || similarItems.length > 0) ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-white">{isSeries ? 'Similar TV Shows' : 'Similar Movies'}</h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {isSimilarLoading ? 'Loading similar titles from the recommendation feed...' : 'Editorial picks from the similar-title feed, with short context for discovery.'}
                      </p>
                    </div>
                    {isSimilarLoading ? (
                      <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-gray-300">Similar titles are loading...</div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                        {similarItems.map((item) => (
                          <div key={`${item.imdb_id || item.id}-${item.title}`} className="overflow-hidden rounded-2xl border border-white/10 bg-black/35">
                            <img src={getImageUrl(item.poster_path)} alt={getContentTitle(item)} className="aspect-[2/3] w-full object-cover" loading="lazy" />
                            <div className="p-3">
                              <p className="line-clamp-2 text-sm font-semibold text-white">{getContentTitle(item)}</p>
                              <p className="mt-1 text-xs text-gray-400">{getContentYear(item)} | {getGenreNames(item.genre_ids) || getContentTypeLabel(item)}</p>
                              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-gray-300">
                                {getContentTitle(item)} is a useful next pick for viewers who want a related tone, genre, or story rhythm after {title}.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onPlaySimilar) {
                                    onPlaySimilar(item, 1, 1);
                                    return;
                                  }

                                  window.open(getVidsrcUrl(item, 1, 1, currentSource), '_blank', 'noreferrer');
                                }}
                                className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-gray-200"
                                aria-label={`Play ${getContentTitle(item)} now`}
                              >
                                <Play className="h-3.5 w-3.5 fill-black" />
                                Play Now
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                {playerError && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-600/15 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
                      <p className="text-sm text-white">{playerError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-gray-400">{label}</p>
      <p className="mt-2 text-white">{value}</p>
    </div>
  );
}

function buildContentStructuredData({
  movie,
  title,
  description,
  releaseDate,
  image,
  url,
  isSeries,
  genres,
  cast,
  crew,
  runtime
}: {
  movie: MovieData;
  title: string;
  description: string;
  releaseDate: string;
  image: string;
  url: string;
  isSeries: boolean;
  genres: string[];
  cast: Array<{ name: string; role: string }>;
  crew: Array<{ name: string; role: string }>;
  runtime?: number;
}) {
  const directors = crew.filter((person) => /director|creator|showrunner/i.test(person.role));
  const structuredData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': isSeries ? 'TVSeries' : 'Movie',
    name: title,
    image,
    description,
    url,
    datePublished: releaseDate || undefined,
    genre: genres.length ? genres : undefined,
    actor: cast.slice(0, 8).map((person) => ({
      '@type': 'Person',
      name: person.name,
      characterName: person.role
    })),
    potentialAction: {
      '@type': 'WatchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: url
      }
    }
  };

  if (directors.length > 0) {
    structuredData.director = directors.slice(0, 4).map((person) => ({
      '@type': 'Person',
      name: person.name
    }));
  }

  if (!isSeries && runtime) {
    structuredData.duration = `PT${runtime}M`;
  }

  if (movie.vote_average > 0) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(movie.vote_average.toFixed(1)),
      bestRating: 10,
      worstRating: 1
    };
  }

  return Object.fromEntries(
    Object.entries(structuredData).filter(([, value]) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== '';
    })
  );
}

function PeoplePanel({ title, people }: { title: string; people: Array<{ name: string; role: string; profile?: string | null }> }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-4 text-xl font-bold text-white">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {people.map((person) => (
          <div key={`${title}-${person.name}-${person.role}`} className="flex min-w-0 items-center gap-3 rounded-2xl bg-black/35 p-3">
            {person.profile ? (
              <img src={person.profile} alt={person.name} className="h-12 w-12 rounded-xl object-cover" loading="lazy" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-sm font-semibold text-white">
                {person.name.slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{person.name}</p>
              <p className="truncate text-xs text-gray-400">{person.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-4 text-xl font-bold text-white">{title}</h3>
      <div className="flex items-center gap-2 rounded-2xl bg-black/35 p-4 text-sm text-gray-300">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        {message}
      </div>
    </div>
  );
}

function formatLastOpened(value: string) {
  const openedAt = new Date(value);
  const deltaMs = Date.now() - openedAt.getTime();

  if (Number.isNaN(openedAt.getTime())) {
    return 'recently';
  }

  const minutes = Math.floor(deltaMs / 60000);
  if (minutes < 1) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  return openedAt.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}
