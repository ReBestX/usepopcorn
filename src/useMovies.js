import { useState, useEffect } from "react";

// Export the API key so it can be reused in other components
export const API_KEY = "e79e40ca";

export function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  // Fetch movies based on query and page
  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      setIsLoading(true);
      setError("");

      try {
        let url;

        if (query.length >= 3) {
          // If there's a valid search query (3+ characters), use it
          url = `http://www.omdbapi.com/?apikey=${API_KEY}&s=${query}&page=${page}`;
        } else {
          // If no query or too short, fetch popular movies
          // Using a popular movie genre or recent year as default
          const currentYear = new Date().getFullYear();
          url = `http://www.omdbapi.com/?apikey=${API_KEY}&s=movie&y=${currentYear}&type=movie&page=${page}`;
        }

        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          throw new Error("Something went wrong with fetching movies");
        }

        const data = await res.json();

        if (data.Response === "True") {
          // If first page, replace movies. Otherwise add to existing
          setMovies((movies) =>
            page === 1 ? data.Search : [...movies, ...data.Search]
          );
          setTotalResults(Number(data.totalResults));
          setError("");
        } else {
          setError(data.Error || "No movies found");
          if (page === 1) {
            setMovies([]);
          }
          setTotalResults(0);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          if (page === 1) {
            setMovies([]);
          }
          setTotalResults(0);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchMovies();

    // Cleanup function
    return () => {
      controller.abort();
    };
  }, [query, page]);

  // Function to load more movies (pagination)
  function loadMoreMovies() {
    if (movies.length < totalResults) {
      setPage((page) => page + 1);
    }
  }

  // Compute whether we have valid search results
  // Only show results message if the query is at least 3 characters
  const hasValidResults =
    query.trim().length >= 3 && movies.length > 0 && !error;

  // Check if there are more movies to load
  const hasMoreMovies = movies.length < totalResults;

  return {
    movies,
    isLoading,
    error,
    totalResults,
    loadMoreMovies,
    hasMoreMovies,
    hasValidResults,
  };
}
