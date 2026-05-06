import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
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
import Badge from '../common/Badge';
import VideoSourceSelector from '../video/VideoSourceSelector';
import VideoLoadingBanner from '../ui/VideoLoadingBanner';
import {
  getContentReleaseDate,
  getContentTitle,
  getContentTypeLabel,
  getContentYear,
  getGenreNames,
  getImageUrl,
  getTvEpisodeDetails,
  getTvShowDetails,
  getVidsrcUrl,
  isTvLikeContent,
  type MovieData,
  type TvEpisodeDetails,
  type TvShowDetails,
  type VideoSource,
} from '../../services/movieService';
import { useMediaLibrary } from '../../contexts/MediaLibraryContext';

interface ModernMovieDetailsModalProps {
  movie: MovieData | null;
  isPlaying: boolean;
  isPlayerLoading: boolean;
  playerError: string | null;
  playerUrl: string | null;
  relatedMovies: MovieData[];
  currentSource: VideoSource;
  onClose: () => void;
  onPlay: (season?: number, episode?: number) => void;
  onSourceChange: (source: VideoSource, season?: number, episode?: number) => void;
  onPlayerReady?: () => void;
}

export default function ModernMovieDetailsModal({
  movie,
  isPlaying,
  isPlayerLoading,
  playerError,
  playerUrl,
  currentSource,
  onClose,
  onPlay,
  onSourceChange,
  onPlayerReady,
}: ModernMovieDetailsModalProps) {
  const [tvDetails, setTvDetails] = useState<TvShowDetails | null>(null);
  const [episodeDetails, setEpisodeDetails] = useState<TvEpisodeDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [isEpisodeLoading, setIsEpisodeLoading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  const { hasLikedItem, toggleLikedItem, hasQueuedItem, toggleQueuedItem } = useMediaLibrary();

  const title = movie ? getContentTitle(movie) : '';
  const releaseDate = movie ? getContentReleaseDate(movie) : '';
  const year = movie ? getContentYear(movie) : 'N/A';
  const contentType = movie ? getContentTypeLabel(movie) : 'Movie';
  const isSeries = movie ? isTvLikeContent(movie) : false;
  const isLiked = movie ? hasLikedItem(movie) : false;
  const isInQueue = movie ? hasQueuedItem(movie) : false;

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
  const downloadTargetUrl = movie
    ? (
        isSeries
          ? getVidsrcUrl(movie, effectiveSeason, effectiveEpisode, currentSource)
          : getVidsrcUrl(movie, 1, 1, currentSource)
      )
    : null;

  useEffect(() => {
    if (!movie) return;

    setTvDetails(null);
    setEpisodeDetails(null);
    setSelectedSeason(1);
    setSelectedEpisode(1);
    setIsEpisodeLoading(false);
    setDownloadMessage(null);

    if (!isTvLikeContent(movie)) return;

    let cancelled = false;

    void getTvShowDetails(movie.id).then((details) => {
      if (cancelled || !details) return;
      setTvDetails(details);
      const firstSeason = details.seasons.find((season) => season.season_number > 0 && season.episode_count > 0);
      if (firstSeason) {
        setSelectedSeason(firstSeason.season_number);
        setSelectedEpisode(1);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [movie]);

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
    const safeTitle = title.replace(/[<>:"/\\|?*\u0000-\u001F]/g, '').trim() || 'Movie';
    if (isSeries) {
      return `${safeTitle}-S${String(effectiveSeason).padStart(2, '0')}E${String(effectiveEpisode).padStart(2, '0')}-MovieNight.mp4`;
    }
    return `${safeTitle}-MovieNight.mp4`;
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
          <div className="fixed left-4 top-4 z-[1002] flex items-center gap-3 rounded-full border border-white/10 bg-black/70 px-3 py-2 shadow-xl backdrop-blur-md sm:left-6 sm:top-6">
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              aria-label="Close details"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <div className="min-w-0 pr-2">
              <h1 className="truncate text-sm font-semibold text-white sm:text-base">{title}</h1>
              <p className="text-[11px] text-gray-400">{contentType}</p>
            </div>
          </div>

          <div className="relative mt-16 mb-6 min-h-[48vh] bg-black pb-6 sm:mb-8 sm:min-h-[60vh] sm:pb-8">
            {isPlaying && currentVideoUrl ? (
              <div className="relative z-0 h-[48vh] w-full overflow-hidden rounded-b-[2rem] sm:h-[60vh] lg:h-[72vh]">
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
              <div className="relative z-0 h-[48vh] w-full overflow-hidden rounded-b-[2rem] sm:h-[60vh] lg:h-[72vh]">
                <img src={getImageUrl(heroImagePath || movie.backdrop_path, 'original')} alt={title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/60" />

                <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-8 lg:p-12">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-3xl space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge text="HD" className="border border-white/20 bg-white/10 text-white" />
                        <Badge text={contentType} className="bg-red-600/80 text-white" />
                        {isSeries && <Badge text={`S${effectiveSeason} • E${effectiveEpisode}`} className="bg-sky-600/80 text-white" />}
                      </div>
                      <h1 className="text-3xl font-black text-white sm:text-4xl lg:text-6xl">{title}</h1>
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

                  <div className="flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePlayClick}
                      disabled={isPlayerLoading}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-black shadow-2xl transition-all hover:bg-gray-100 disabled:opacity-50 sm:h-24 sm:w-24"
                    >
                      {isPlayerLoading ? <LoaderCircle className="h-9 w-9 animate-spin" /> : <Play className="ml-1 h-9 w-9 fill-black" />}
                    </motion.button>
                  </div>

                  <div className="max-w-2xl" />
                </div>
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

          <div className="relative z-10 border-t border-white/10 bg-black">
            <div className="grid gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)] lg:px-8">
              <div className="flex flex-col gap-5">
                <div className="relative z-20 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handlePlayClick}
                      className="rounded-xl bg-white/12 px-5 py-3 font-semibold text-white transition-colors hover:bg-white/20"
                    >
                      {isSeries ? `Play S${effectiveSeason}E${effectiveEpisode}` : 'Play Now'}
                    </button>
                    <button
                      onClick={handleQueue}
                      className={`rounded-xl border px-4 py-3 transition-colors ${
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
                      className={`rounded-xl border px-4 py-3 transition-colors ${
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
                      className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white transition-colors hover:bg-white/20"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Share
                      </span>
                    </button>
                    <button
                      onClick={() => void handleDownload()}
                      className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white transition-colors hover:bg-white/20"
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
                          {availableSeasons.map((season) => (
                            <button
                              key={season.season_number}
                              onClick={() => {
                                setSelectedSeason(season.season_number);
                                setSelectedEpisode(1);
                              }}
                              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                                effectiveSeason === season.season_number
                                  ? 'bg-sky-500 text-white'
                                  : 'border border-white/15 bg-black/35 text-gray-200 hover:bg-white/10'
                              }`}
                            >
                              Season {season.season_number}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-sm text-gray-300">Episodes</p>
                        <div className="flex max-h-52 flex-wrap gap-2 overflow-y-auto pr-1">
                          {Array.from({ length: maxEpisode }, (_, index) => index + 1).map((episodeNumber) => (
                            <button
                              key={episodeNumber}
                              onClick={() => setSelectedEpisode(episodeNumber)}
                              className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                                effectiveEpisode === episodeNumber
                                  ? 'bg-white text-black'
                                  : 'border border-white/15 bg-black/35 text-gray-200 hover:bg-white/10'
                              }`}
                            >
                              Episode {episodeNumber}
                            </button>
                          ))}
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
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="mb-3 text-xl font-bold text-white">{isSeries ? 'Episode Summary' : 'Synopsis'}</h3>
                  <p className="leading-relaxed text-gray-300">{summaryText}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailCard label="Type" value={contentType} />
                  <DetailCard label="Release Date" value={releaseDate || 'N/A'} />
                  <DetailCard label="Rating" value={`${movie.vote_average.toFixed(1)}/10`} />
                  <DetailCard label="Genres" value={getGenreNames(movie.genre_ids) || 'N/A'} />
                  {isSeries && episodeDetails && <DetailCard label="Selected Episode" value={episodeDetails.name} />}
                </div>

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
