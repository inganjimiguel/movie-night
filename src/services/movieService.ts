/// <reference types="vite/client" />
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// User provided credentials for the demo
const FALLBACK_API_KEY = "8cb4712984e3c0d68f880b04c4d4f278";
const FALLBACK_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4Y2I0NzEyOTg0ZTNjMGQ2OGY4ODBiMDRjNGQ0ZjI3OCIsIm5iZiI6MTc3NjkzNDY1Ni4xNzgsInN1YiI6IjY5ZTlkZjAwZjY0NjE2ZGNmZmJiMWNjNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.kwHMCXgkOcz8pjX-sdIvrPB9D_7vWIYvoND0RvByB1A";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || FALLBACK_API_KEY;
const ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN || FALLBACK_TOKEN;

export interface MovieData {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface MovieVideoResult {
  key: string;
  name: string;
  official: boolean;
  site: string;
  type: string;
}

export interface TrailerData {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  videos: MovieVideoResult[];
}

export type VideoSource = 'vidsrcpro' | 'vidsrc';

export const getVideoUrl = (id: number, source: VideoSource = 'vidsrcpro'): string => {
  switch (source) {
    case 'vidsrcpro':
      return `https://vidsrc.pro/embed/movie/${id}`;
    case 'vidsrc':
      return `https://vidsrc.to/embed/movie/${id}`;
    default:
      return `https://vidsrc.pro/embed/movie/${id}`;
  }
};

export const getVidsrcUrl = (id: number): string => {
  return getVideoUrl(id, 'vidsrcpro');
};

const getHeaders = () => ({
  'Authorization': `Bearer ${ACCESS_TOKEN}`,
  'Content-Type': 'application/json'
});

export const getTrendingMovies = async (): Promise<MovieData[]> => {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/movie/day`, {
      headers: getHeaders()
    });
    const data = await res.json();
    return data.results || getFallbackMovies();
  } catch (err) {
    console.error('TMDB Fetch Error:', err);
    return getFallbackMovies();
  }
};

export const searchMovies = async (query: string): Promise<MovieData[]> => {
  if (!query) return [];
  
  try {
    // Use TMDB API to search for all movies
    const res = await fetch(`${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`, {
      headers: getHeaders()
    });
    const data = await res.json();
    const results = data.results || [];
    
    // Transform TMDB results to MovieData format
    const movies: MovieData[] = results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview || '',
      poster_path: movie.poster_path || '',
      backdrop_path: movie.backdrop_path || '',
      release_date: movie.release_date || '',
      vote_average: movie.vote_average || 0,
      genre_ids: movie.genre_ids || []
    }));
    
    return movies;
  } catch (err) {
    console.error('TMDB Search Error:', err);
    
    // Fallback to hardcoded list if API fails
    const vidsrcCompatibleMovies: MovieData[] = [
      {
        id: 693134,
        title: "Dune: Part Two",
        overview: "Paul Atreides unites with Chani and the Fremen...",
        poster_path: "/1pdfLvkbYvwOhVnCF3LpxnfbscC.jpg",
        backdrop_path: "/1pdfLvkbYvwOhVnCF3LpxnfbscC.jpg",
        release_date: "2024-03-01",
        vote_average: 8.4,
        genre_ids: [28, 12, 878]
      },
      {
        id: 872585,
        title: "Oppenheimer",
        overview: "The story of the atomic bomb and J. Robert Oppenheimer...",
        poster_path: "/8Gx9keQ4BmJdCv1J7uqh0eV9gJg.jpg",
        backdrop_path: "/8Gx9keQ4BmJdCv1J7uqh0eV9gJg.jpg",
        release_date: "2023-07-21",
        vote_average: 8.4,
        genre_ids: [18, 36, 10752]
      },
      {
        id: 634649,
        title: "Spider-Man: No Way Home",
        overview: "Peter Parker is unmasked and no longer able to separate his normal life...",
        poster_path: "/1g0dhYtWyWtSSTvTOB3U9zY9Vv6.jpg",
        backdrop_path: "/iQFcwSG7CZpOMIuRYrSTP3pFCDf.jpg",
        release_date: "2021-12-15",
        vote_average: 8.0,
        genre_ids: [28, 12, 878]
      },
      {
        id: 299536,
        title: "Avengers: Endgame",
        overview: "The epic conclusion to the Infinity Saga...",
        poster_path: "/or06FN3Dka5zwKSqRqU2IlMeRco.jpg",
        backdrop_path: "/or06FN3Dka5zwKSqRqU2IlMeRco.jpg",
        release_date: "2019-04-24",
        vote_average: 8.4,
        genre_ids: [28, 12, 878]
      },
      {
        id: 475557,
        title: "Joker",
        overview: "Arthur Fleck's transformation into the Joker...",
        poster_path: "/udDclJoHjfjb8Ekgsd4RD3Ry6vq.jpg",
        backdrop_path: "/udDclJoHjfjb8Ekgsd4RD3Ry6vq.jpg",
        release_date: "2019-10-04",
        vote_average: 8.4,
        genre_ids: [18, 80, 53]
      },
      {
        id: 361743,
        title: "Top Gun: Maverick",
        overview: "After thirty years, Maverick is still pushing the envelope...",
        poster_path: "/j3L1kQgPnB6nJc4hLwD2hG0hG2.jpg",
        backdrop_path: "/j3L1kQgPnB6nJc4hLwD2hG0hG2.jpg",
        release_date: "2022-05-27",
        vote_average: 8.3,
        genre_ids: [28, 12, 18]
      },
      {
        id: 578,
        title: "Dune",
        overview: "Paul Atreides, a brilliant and gifted young man...",
        poster_path: "/d5NXSklZfsNcSR9pWhv97NVpms6.jpg",
        backdrop_path: "/lz21LZEjG7mS7AgmQO0LYG9YmQQ.jpg",
        release_date: "2021-09-15",
        vote_average: 7.8,
        genre_ids: [12, 18, 878]
      },
      {
        id: 299537,
        title: "Avengers: Infinity War",
        overview: "The Avengers and their allies must be willing to sacrifice all...",
        poster_path: "/7WsyChQLEftNiDO6GvyIzR4RbUv.jpg",
        backdrop_path: "/7WsyChQLEftNiDO6GvyIzR4RbUv.jpg",
        release_date: "2018-04-27",
        vote_average: 8.4,
        genre_ids: [28, 12, 878]
      }
    ];

    // Filter movies based on search query
    const filteredMovies = vidsrcCompatibleMovies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      movie.overview.toLowerCase().includes(query.toLowerCase())
    );

    return filteredMovies;
  }
};

export const searchMoviesByLetter = async (letter: string): Promise<MovieData[]> => {
  if (!letter || letter.length !== 1) return [];
  
  try {
    // Use TMDB discover API to get movies starting with a specific letter
    // We'll use the discover endpoint with primary_release_year to get more results
    const res = await fetch(`${TMDB_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`, {
      headers: getHeaders()
    });
    const data = await res.json();
    const results = data.results || [];
    
    // Filter movies that start with the letter (case-insensitive)
    const filteredMovies = results.filter((movie: any) => {
      const title = movie.title || '';
      return title.toLowerCase().startsWith(letter.toLowerCase());
    });
    
    // Transform to MovieData format
    const movies: MovieData[] = filteredMovies.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview || '',
      poster_path: movie.poster_path || '',
      backdrop_path: movie.backdrop_path || '',
      release_date: movie.release_date || '',
      vote_average: movie.vote_average || 0,
      genre_ids: movie.genre_ids || []
    }));
    
    return movies;
  } catch (err) {
    console.error('TMDB Search by Letter Error:', err);
    return [];
  }
};

export const getPopularMoviesByYear = async (year: number): Promise<MovieData[]> => {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&primary_release_year=${year}&sort_by=popularity.desc`, {
      headers: getHeaders()
    });
    const data = await res.json();
    const results = data.results || [];
    const movies: MovieData[] = results.map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview || '',
      poster_path: movie.poster_path || '',
      backdrop_path: movie.backdrop_path || '',
      release_date: movie.release_date || '',
      vote_average: movie.vote_average || 0,
      genre_ids: movie.genre_ids || []
    }));
    return movies;
  } catch (err) {
    console.error(`TMDB Popular Movies by Year (${year}) Error:`, err);
    return [];
  }
};

export const getPopularMoviesByYearRange = async (startYear: number, endYear: number): Promise<{ [year: number]: MovieData[] }> => {
  const moviesByYear: { [year: number]: MovieData[] } = {};
  
  for (let year = endYear; year >= startYear; year--) {
    const movies = await getPopularMoviesByYear(year);
    if (movies.length > 0) {
      moviesByYear[year] = movies.slice(0, 5); // Limit to 5 movies per year
    }
  }
  
  return moviesByYear;
};

const getFallbackMovies = (): MovieData[] => [
  {
    id: 157336,
    title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2QniE6EszQwQvK6t6fxYvbtS.jpg",
    backdrop_path: "/rAiY_pUm9v9qEMpep9p4j70OESt.jpg",
    release_date: "2014-11-05",
    vote_average: 8.4,
    genre_ids: [12, 18, 878]
  },
  {
    id: 634649,
    title: "Spider-Man: No Way Home",
    overview: "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero. When he asks for help from Doctor Strange the stakes become even more dangerous, forcing him to discover what it truly means to be Spider-Man.",
    poster_path: "/1g0dhYtWyWtSSTvTOB3U9zY9Vv6.jpg",
    backdrop_path: "/iQFcwSG7CZpOMIuRYrSTP3pFCDf.jpg",
    release_date: "2021-12-15",
    vote_average: 8.0,
    genre_ids: [28, 12, 878]
  },
  {
    id: 438631,
    title: "Dune",
    overview: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
    poster_path: "/d5NXSklZfsNcSR9pWhv97NVpms6.jpg",
    backdrop_path: "/lz21LZEjG7mS7AgmQO0LYG9YmQQ.jpg",
    release_date: "2021-09-15",
    vote_average: 7.8,
    genre_ids: [12, 18, 878]
  },
  {
    id: 155,
    title: "The Dark Knight",
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    poster_path: "/qJ2tW6WMUDp9aqSbtmNrkGv93ky.jpg",
    backdrop_path: "/oXUunYhnun0D7VfIqX0Z6V87clw.jpg",
    release_date: "2008-07-16",
    vote_average: 8.5,
    genre_ids: [18, 28, 80, 53]
  },
  {
    id: 19995,
    title: "Avatar",
    overview: "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following his orders and protecting the world he feels is his home.",
    poster_path: "/6EiRUJp6vSbtxq9ZqcH0CbkKp0s.jpg",
    backdrop_path: "/8rm3S4cr9m0STu9Y8Xp2Z8YNo9q.jpg",
    release_date: "2009-12-10",
    vote_average: 7.5,
    genre_ids: [28, 12, 14, 878]
  },
  {
    id: 27205,
    title: "Inception",
    overview: "Cobb, a skilled thief who steals corporate secrets from use of dream-sharing technology, is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster_path: "/edv5CZv0jH9NX186R3yq7vLcQ9u.jpg",
    backdrop_path: "/8Z79vS8Inp6FmR3w5K8XfH6SrtS.jpg",
    release_date: "2010-07-15",
    vote_average: 8.3,
    genre_ids: [28, 878, 12]
  },
  {
    id: 671,
    title: "Harry Potter and the Philosopher's Stone",
    overview: "Harry Potter has lived under the stairs at his aunt and uncle's house his whole life. But on his 11th birthday, he learns he's a powerful wizard—with a place waiting for him at the Hogwarts School of Witchcraft and Wizardry.",
    poster_path: "/wuMc08IPKEatv9rnMNXv3BCI9Y2.jpg",
    backdrop_path: "/hziRFr3uYp1zY9vK3j9B6wOUAsT.jpg",
    release_date: "2001-11-16",
    vote_average: 7.9,
    genre_ids: [12, 14]
  }
];

export const getImageUrl = (path: string, size: 'w500' | 'original' = 'w500') => {
  if (!path) return "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const getTrailerUrl = async (movieId: number): Promise<string | null> => {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/videos`, {
      headers: getHeaders()
    });
    const data = await res.json();
    const videos = data.results || [];

    const trailer = videos.find((video) =>
      video.site === 'YouTube' &&
      video.type === 'Trailer' &&
      video.official
    ) ?? videos.find((video) =>
      video.site === 'YouTube' &&
      video.type === 'Trailer'
    ) ?? videos.find((video) =>
      video.site === 'YouTube' &&
      video.type === 'Teaser'
    );

    if (!trailer?.key) {
      return null;
    }

    return `https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`;
  } catch (err) {
    console.error('TMDB Trailer Fetch Error:', err);
    return null;
  }
};

export const getTrailers = async (): Promise<TrailerData[]> => {
  try {
    // Get trending movies
    const res = await fetch(`${TMDB_BASE_URL}/trending/movie/day`, {
      headers: getHeaders()
    });
    const data = await res.json();
    const movies = data.results || [];

    // Fetch videos for each movie
    const trailersWithVideos = await Promise.all(
      movies.slice(0, 20).map(async (movie: MovieData) => {
        try {
          const videoRes = await fetch(`${TMDB_BASE_URL}/movie/${movie.id}/videos`, {
            headers: getHeaders()
          });
          const videoData = await videoRes.json();
          const videos = videoData.results || [];

          // Filter for YouTube trailers
          const youtubeTrailers = videos.filter((v: MovieVideoResult) => 
            v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
          );

          if (youtubeTrailers.length > 0) {
            return {
              ...movie,
              videos: youtubeTrailers
            } as TrailerData;
          }
          return null;
        } catch (err) {
          console.error(`Error fetching videos for movie ${movie.id}:`, err);
          return null;
        }
      })
    );

    // Filter out nulls and return only movies with trailers
    return trailersWithVideos.filter((t): t is TrailerData => t !== null);
  } catch (err) {
    console.error('TMDB Trailers Fetch Error:', err);
    return [];
  }
};

export const genreMap: { [key: number]: string } = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

export const getGenreNames = (ids: number[] = []) => {
  return ids.map(id => genreMap[id]).filter(Boolean).join(', ');
};
