import { Heart } from 'lucide-react';
import SavedContentPage from '../../components/movies/SavedContentPage';
import { useMediaLibrary } from '../../contexts/MediaLibraryContext';

interface LikedPageProps {
  navigateTo?: (path: string) => void;
}

export default function LikedPage({ navigateTo }: LikedPageProps) {
  const { likedItems } = useMediaLibrary();

  return (
    <SavedContentPage
      title="Liked Titles"
      icon={Heart}
      items={likedItems}
      accent="red"
      searchPlaceholder="Search liked titles..."
      emptyTitle="Nothing liked yet"
      emptyDescription="Tap the heart on any movie, series, or animation to build a fresh liked collection."
      emptyActionLabel="Browse Titles"
      statsLabel={(count) => `${count} ${count === 1 ? 'title' : 'titles'} liked`}
      noItemsLabel="No liked titles yet"
      noResultsLabel={'No liked titles match your search for "{query}"'}
      navigateTo={navigateTo}
    />
  );
}
