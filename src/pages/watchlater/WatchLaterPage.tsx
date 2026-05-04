import { Clock } from 'lucide-react';
import SavedContentPage from '../../components/movies/SavedContentPage';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';

interface WatchLaterPageProps {
  navigateTo?: (path: string) => void;
}

export default function WatchLaterPage({ navigateTo }: WatchLaterPageProps) {
  const { watchLater } = useUserPreferences();

  return (
    <SavedContentPage
      title="Watch Later"
      icon={Clock}
      items={watchLater}
      accent="green"
      searchPlaceholder="Search watch later..."
      emptyTitle="Nothing saved for later"
      emptyDescription="Build a queue of movies, series, and animations so your next watch is always one click away."
      emptyActionLabel="Browse Titles"
      statsLabel={(count) => `${count} ${count === 1 ? 'title' : 'titles'} saved for later`}
      noItemsLabel="No titles saved for later"
      noResultsLabel={'No saved titles match your search for "{query}"'}
      navigateTo={navigateTo}
    />
  );
}
