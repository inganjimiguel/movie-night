import { useEffect } from 'react';
import { getContentSlug, type MovieData } from '../../services/movieService';

interface DynamicSEOProps {
  currentPage?: 'home' | 'search' | 'favorites' | 'watchlater' | 'tvshows';
  searchQuery?: string;
  selectedMovie?: MovieData;
}

export default function DynamicSEO({ 
  currentPage = 'home', 
  searchQuery, 
  selectedMovie 
}: DynamicSEOProps) {
  
  useEffect(() => {
    const updateSEO = () => {
      let title = 'Movie Night - Watch Free Movies Online | Stream Latest Films';
      let description = 'Watch the latest movies online for free! Movie Night offers unlimited streaming of popular films, blockbusters, and hidden gems.';
      let keywords = 'watch movies online, free movie streaming, latest films, HD movies, online cinema, movie night';
      let url = 'https://movienight.giize.com';
      
      switch (currentPage) {
        case 'search':
          title = searchQuery 
            ? `Search Results for "${searchQuery}" - Movie Night`
            : 'Search Movies - Movie Night';
          description = searchQuery
            ? `Search results for "${searchQuery}" on Movie Night. Find the best movies matching your search.`
            : 'Search thousands of movies on Movie Night. Find your next favorite film.';
          keywords += `, movie search, find movies, ${searchQuery || 'search films'}`;
          url += `/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`;
          break;
          
        case 'favorites':
          title = 'My Favorite Movies - Movie Night';
          description = 'Your personal collection of favorite movies on Movie Night. Re-watch your beloved films anytime.';
          keywords += ', favorite movies, personal collection, saved films';
          url += '/favorites';
          break;
          
        case 'watchlater':
          title = 'Watch Later List - Movie Night';
          description = 'Movies you want to watch later on Movie Night. Build your watchlist and never miss great films.';
          keywords += ', watch later, movie queue, watchlist, to-watch';
          url += '/watchlater';
          break;
          
        case 'tvshows':
          title = 'TV Shows - Movie Night';
          description = 'Browse popular TV shows and series on Movie Night. Stream the latest episodes and seasons.';
          keywords += ', tv shows, series, television shows, streaming series';
          url += '/tv-shows';
          break;
      }
      
      if (selectedMovie) {
        title = `Watch ${selectedMovie.title} (2024) - Movie Night`;
        description = `Watch ${selectedMovie.title} online for free! ${selectedMovie.overview?.substring(0, 160)}...`;
        keywords += `, ${selectedMovie.title}, watch ${selectedMovie.title} online, ${selectedMovie.title} streaming`;
        url += `/movies/${getContentSlug(selectedMovie)}`;
      }
      
      // Update document title
      document.title = title;
      
      // Update meta tags
      const updateMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };
      
      updateMetaTag('description', description);
      updateMetaTag('keywords', keywords);
      updateMetaTag('og:title', title);
      updateMetaTag('og:description', description);
      updateMetaTag('twitter:title', title);
      updateMetaTag('twitter:description', description);
      
      // Update canonical URL
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', url);
      
      // Update structured data
      const structuredData = selectedMovie ? {
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name: selectedMovie.title,
        description: selectedMovie.overview,
        image: `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`,
        url: url,
        datePublished: selectedMovie.release_date,
        contentRating: 'PG-13',
        inLanguage: 'en-US',
        genre: ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi'],
        director: {
          '@type': 'Person',
          name: 'Various Directors'
        },
        actor: {
          '@type': 'Person',
          name: 'Various Actors'
        },
        potentialAction: {
          '@type': 'WatchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: url
          }
        }
      } : {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Movie Night',
        description: description,
        url: url,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${url}/search?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      };
      
      let structuredScript = document.querySelector('script[type="application/ld+json"]');
      if (!structuredScript) {
        structuredScript = document.createElement('script');
        structuredScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(structuredScript);
      }
      structuredScript.textContent = JSON.stringify(structuredData);
    };
    
    updateSEO();
  }, [currentPage, searchQuery, selectedMovie]);
  
  return null;
}
