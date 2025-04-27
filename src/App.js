import { useState } from "react";
import "./App.css";
import { NavBar, Search, NumResults } from "./NavBar";
import Main from "./Main";
import { useMovies } from "./useMovies";

// Helper function to calculate the average of an array
export const average = (arr) => {
  // Filter out NaN, null, and undefined values
  const validValues = arr.filter(
    (val) => val !== null && val !== undefined && !isNaN(val)
  );

  // Return 0 if no valid values
  if (validValues.length === 0) return 0;

  // Calculate average of valid values
  return validValues.reduce((acc, cur) => acc + cur, 0) / validValues.length;
};

export default function App() {
  const [query, setQuery] = useState("");

  // Use our custom hook
  const {
    movies,
    isLoading,
    error,
    totalResults,
    loadMoreMovies,
    hasMoreMovies,
    hasValidResults,
  } = useMovies(query);

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        {hasValidResults && <NumResults totalResults={totalResults} />}
      </NavBar>
      <Main
        movies={movies}
        isLoading={isLoading}
        error={error}
        loadMoreMovies={loadMoreMovies}
        hasMoreMovies={hasMoreMovies}
      />
    </>
  );
}
