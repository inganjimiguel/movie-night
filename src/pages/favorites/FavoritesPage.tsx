import { Heart } from 'lucide-react';
import SavedContentPage from '../../components/movies/SavedContentPage';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';

interface FavoritesPageProps {
  navigateTo?: (path: string) => void;
}

export default function FavoritesPage({ navigateTo }: FavoritesPageProps) {
  const { favorites } = useUserPreferences();

  return (
    <SavedContentPage
      title="My Favorites"
      icon={Heart}
      items={favorites}
      accent="red"
      searchPlaceholder="Search favorites..."
      emptyTitle="No favorites yet"
      emptyDescription="Start adding movies, series, and animations to your favorites from any card or details panel."
      emptyActionLabel="Browse Titles"
      statsLabel={(count) => `${count} ${count === 1 ? 'title' : 'titles'} favorited`}
      noItemsLabel="No favorites yet"
      noResultsLabel={'No favorites match your search for "{query}"'}
      navigateTo={navigateTo}
    />
  );
}
