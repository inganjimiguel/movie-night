import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  movieTitle?: string;
  movieDescription?: string;
}

export default function SEOHead({
  title = 'Movie Night - Watch Free Movies Online | Stream Latest Films',
  description = 'Watch the latest movies online for free! Movie Night offers unlimited streaming of popular films, blockbusters, and hidden gems. Enjoy HD quality movies with no subscription required.',
  keywords = 'watch movies online, free movie streaming, latest films, HD movies, online cinema, movie night, free films, watch movies free, stream movies, latest movies 2024, popular films, donate movies, support cinema, movie donations, independent films, film funding',
  image = '/og-image.jpg',
  url = 'https://movienight.com',
  type = 'website',
  movieTitle,
  movieDescription
}: SEOHeadProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update or create meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Primary Meta Tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'Movie Night');
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('language', 'en');
    updateMetaTag('revisit-after', '1 days');
    
    // Open Graph / Facebook
    updateMetaTag('og:type', type);
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
    updateMetaTag('og:url', url);
    updateMetaTag('og:site_name', 'Movie Night');
    updateMetaTag('og:locale', 'en_US');
    
    // Twitter
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:site', '@MovieNight');
    updateMetaTag('twitter:creator', '@MovieNight');
    
    // Additional SEO Meta Tags
    updateMetaTag('theme-color', '#dc2626');
    updateMetaTag('msapplication-TileColor', '#dc2626');
    updateMetaTag('application-name', 'Movie Night');
    updateMetaTag('apple-mobile-web-app-title', 'Movie Night');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');
    
    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
    
    // Structured Data
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': movieTitle ? 'Movie' : 'WebSite',
      name: movieTitle || 'Movie Night',
      description: movieDescription || description,
      url: movieTitle ? `${url}/movies/${movieTitle?.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}` : url,
      image: image,
      potentialAction: {
        '@type': 'WatchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: url,
          inLanguage: 'en-US'
        }
      },
      ...(movieTitle && {
        director: {
          '@type': 'Person',
          name: 'Various Directors'
        },
        actor: {
          '@type': 'Person',
          name: 'Various Actors'
        },
        genre: ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi'],
        datePublished: new Date().toISOString(),
        contentRating: 'PG-13',
        inLanguage: 'en-US'
      }),
      ...(!movieTitle && {
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${url}/search?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      })
    };

    // Update or create structured data script
    let structuredScript = document.querySelector('script[type="application/ld+json"]');
    if (!structuredScript) {
      structuredScript = document.createElement('script');
      structuredScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredScript);
    }
    structuredScript.textContent = JSON.stringify(structuredData);
    
    // DNS Prefetch for Performance
    const addLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        link.setAttribute('href', href);
        document.head.appendChild(link);
      }
    };
    
    addLink('dns-prefetch', '//image.tmdb.org');
    addLink('dns-prefetch', '//vidsrc.to');
    addLink('dns-prefetch', '//fonts.googleapis.com');
    addLink('preconnect', 'https://image.tmdb.org');
    addLink('preconnect', 'https://vidsrc.to');
    
    return () => {
      // Cleanup on unmount if needed
    };
  }, [title, description, keywords, image, url, type, movieTitle, movieDescription]);

  return null; // This component doesn't render anything
}
