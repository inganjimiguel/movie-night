import { Clock3 } from 'lucide-react';
import SavedContentPage from '../../components/movies/SavedContentPage';
import { useMediaLibrary } from '../../contexts/MediaLibraryContext';

interface QueuePageProps {
  navigateTo?: (path: string) => void;
}

export default function QueuePage({ navigateTo }: QueuePageProps) {
  const { queuedItems } = useMediaLibrary();

  return (
    <SavedContentPage
      title="My Queue"
      icon={Clock3}
      items={queuedItems}
      accent="green"
      searchPlaceholder="Search queue..."
      emptyTitle="Queue is empty"
      emptyDescription="Save movies, shows, and animation to your queue so the next thing to watch is always ready."
      emptyActionLabel="Browse Titles"
      statsLabel={(count) => `${count} ${count === 1 ? 'title' : 'titles'} in queue`}
      noItemsLabel="No queued titles yet"
      noResultsLabel={'No queued titles match your search for "{query}"'}
      navigateTo={navigateTo}
    />
  );
}
