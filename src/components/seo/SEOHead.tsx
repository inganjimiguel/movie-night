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
  url = 'https://movienight.giize.com',
  type = 'website',
  movieTitle,
  movieDescription
}: SEOHeadProps) {

  useEffect(() => {
    document.title = title;

    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(name.startsWith('og:') ? 'property' : 'name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const removeMetaTag = (name: string) => {
      const meta = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (meta) meta.remove();
    };

    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'Movie Night');
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('language', 'en');
    updateMetaTag('revisit-after', '1 days');

    updateMetaTag('og:type', type);
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image.startsWith('http') ? image : `https://movienight.giize.com${image}`);
    updateMetaTag('og:image:width', '1200');
    updateMetaTag('og:image:height', '630');
    updateMetaTag('og:url', url);
    updateMetaTag('og:site_name', 'Movie Night');
    updateMetaTag('og:locale', 'en_US');

    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image.startsWith('http') ? image : `https://movienight.giize.com${image}`);
    updateMetaTag('twitter:site', '@MovieNight');
    updateMetaTag('twitter:creator', '@MovieNight');

    updateMetaTag('theme-color', '#dc2626');
    updateMetaTag('msapplication-TileColor', '#dc2626');
    updateMetaTag('application-name', 'Movie Night');
    updateMetaTag('apple-mobile-web-app-title', 'Movie Night');
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'black-translucent');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    const movieSlug = movieTitle
      ? movieTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : '';

    const pageType = movieTitle ? 'Movie' : 'WebSite';
    const baseStructured: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': pageType,
      name: movieTitle || 'Movie Night',
      description: movieDescription || description,
      url: movieTitle ? `${url}/movies/${movieSlug}` : url,
      image: image.startsWith('http') ? image : `https://movienight.giize.com${image}`,
      inLanguage: 'en-US',
    };

    if (movieTitle) {
      baseStructured.genre = ['Action', 'Drama', 'Comedy', 'Thriller', 'Sci-Fi'];
      baseStructured.datePublished = new Date().toISOString();
      baseStructured.contentRating = 'PG-13';
      baseStructured.potentialAction = {
        '@type': 'WatchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${url}/movies/${movieSlug}`,
          inLanguage: 'en-US'
        }
      };
    }

    if (!movieTitle) {
      baseStructured.potentialAction = {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${url}/search?q={search_term_string}`
        },
        'query-input': 'required name=search_term_string'
      };
    }

    const structuredScriptId = 'movie-night-content-jsonld';
    let structuredScript = document.querySelector(`script#${structuredScriptId}`) as HTMLScriptElement | null;
    if (!structuredScript) {
      structuredScript = document.createElement('script');
      structuredScript.id = structuredScriptId;
      structuredScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredScript);
    }
    structuredScript.textContent = JSON.stringify(baseStructured);

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
      removeMetaTag('movie-night-seo');
    };
  }, [title, description, keywords, image, url, type, movieTitle, movieDescription]);

  return null;
}
