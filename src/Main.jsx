import { useState, useEffect } from "react";
import { average } from "./App";
import "./Loader.css";
import StarRating from "./StarRating";
import { API_KEY } from "./useMovies";

export default function Main({
  movies,
  isLoading,
  error,
  loadMoreMovies,
  hasMoreMovies,
}) {
  const [selectedID, setSelectedID] = useState(null);
  const [watched, setWatched] = useState(
    () => JSON.parse(localStorage.getItem("watchedMovies")) || []
  );

  // Save to localStorage whenever watched changes
  useEffect(
    function () {
      localStorage.setItem("watchedMovies", JSON.stringify(watched));
    },
    [watched]
  );

  // Simplify the logic for setting the document title
  useEffect(() => {
    if (!selectedID) {
      document.title = "usePopcorn";
      return;
    }

    const selectedMovie = movies.find((movie) => movie.imdbID === selectedID);
    document.title = selectedMovie
      ? `Movie | ${selectedMovie.Title}`
      : "usePopcorn";

    return () => {
      document.title = "usePopcorn";
    };
  }, [selectedID, movies]);

  function handleSelectedMovie(id) {
    setSelectedID((currentID) => (id === currentID ? null : id));
  }

  function handleCloseMovie() {
    setSelectedID(null);
  }

  // Add comments to clarify the purpose of key functions
  function handleAddMovie(movie) {
    setWatched((watched) => {
      const existingMovieIndex = watched.findIndex(
        (watchedMovie) => watchedMovie.imdbID === movie.imdbID
      );

      if (existingMovieIndex !== -1) {
        const updatedWatched = [...watched];
        updatedWatched[existingMovieIndex] = movie;
        return updatedWatched;
      }

      return [...watched, movie];
    });
  }

  function handleDeleteMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  // Find the currently selected movie in the watched list (if it exists)
  const watchedMovie = watched.find((movie) => movie.imdbID === selectedID);

  return (
    <main className="main">
      {isLoading && movies.length === 0 ? (
        <Loader />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        <ListBox
          movies={movies}
          isLoading={isLoading}
          loadMoreMovies={loadMoreMovies}
          hasMoreMovies={hasMoreMovies}
          handleSelectedMovie={handleSelectedMovie}
        />
      )}
      {selectedID ? (
        <MovieDetails
          selectedID={selectedID}
          handleCloseMovie={handleCloseMovie}
          handleAddMovie={handleAddMovie}
          watchedMovie={watchedMovie}
        />
      ) : (
        <WatchedBox
          watched={watched}
          handleSelectedMovie={handleSelectedMovie}
          handleDeleteMovie={handleDeleteMovie}
        />
      )}
    </main>
  );
}

function Loader() {
  return (
    <div className="box loader-container">
      <div className="spinner"></div>
      <p className="loader-text">Searching for movies...</p>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="box">
      <p className="error">⛔️ {message}</p>
    </div>
  );
}

function ListBox({
  movies,
  isLoading,
  loadMoreMovies,
  hasMoreMovies,
  handleSelectedMovie,
}) {
  const [isOpen1, setIsOpen1] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen1 ? "–" : "+"}
      </button>
      {isOpen1 && (
        <>
          <MovieList
            movies={movies}
            handleSelectedMovie={handleSelectedMovie}
          />
          {movies.length > 0 && hasMoreMovies && (
            <button
              className="btn-add"
              onClick={loadMoreMovies}
              style={{ margin: "1rem auto", display: "block" }}
            >
              {isLoading ? "Loading..." : "Load More"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

function MovieList({ movies, handleSelectedMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          key={movie.imdbID}
          handleSelectedMovie={handleSelectedMovie}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, handleSelectedMovie }) {
  return (
    <li
      onClick={() => {
        handleSelectedMovie(movie.imdbID);
      }}
    >
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({
  selectedID,
  handleCloseMovie,
  handleAddMovie,
  watchedMovie,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userRating, setUserRating] = useState(0);

  useEffect(
    function () {
      function Exit(e) {
        if (e.code === "Escape") {
          handleCloseMovie();
        }
      }
      document.addEventListener("keydown", Exit);
      return () => {
        document.removeEventListener("keydown", Exit);
      };
    },
    [handleCloseMovie]
  );

  function handleSetRating(rating) {
    setUserRating(rating);
  }

  useEffect(
    function () {
      // If the movie is already in watched list, show its rating
      if (watchedMovie) {
        setUserRating(watchedMovie.userRating);
      } else {
        setUserRating(0);
      }

      async function getMovieDetails() {
        setIsLoading(true);
        setError("");

        try {
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${API_KEY}&i=${selectedID}`
          );

          if (!res.ok) {
            throw new Error("Something went wrong fetching movie details");
          }

          const data = await res.json();

          if (data.Response === "False") {
            throw new Error("Movie not found");
          }

          setMovie(data);
        } catch (err) {
          console.error(err.message);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }

      getMovieDetails();
    },
    [selectedID, watchedMovie]
  );

  if (isLoading)
    return (
      <div className="details">
        <div className="loader-container">
          <div className="spinner"></div>
          <p className="loader-text">Loading movie details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="details">
        <ErrorMessage message={error} />
      </div>
    );

  return (
    <div className="details">
      <div className="details-container">
        <button className="btn-back" onClick={handleCloseMovie}>
          &larr;
        </button>

        <header>
          <img src={movie.Poster} alt={`Poster of ${movie.Title}`} />
          <div className="details-overview">
            <h2>{movie.Title}</h2>
            <p>
              {movie.Released} &bull; {movie.Runtime}
            </p>
            <p>{movie.Genre}</p>
            <p>
              <span>⭐️</span>{" "}
              {movie.imdbRating && movie.imdbRating !== "N/A"
                ? movie.imdbRating
                : "—"}{" "}
              IMDb rating
            </p>
          </div>
        </header>

        <section>
          <div className="rating">
            <StarRating
              maxStars={10}
              value={userRating}
              onChange={handleSetRating}
            />

            {userRating > 0 && (
              <button
                className="btn-add"
                onClick={() => {
                  // Extract runtime value safely
                  let runtimeValue = 0;
                  if (movie.Runtime) {
                    // Extract the numeric part from strings like "155 min"
                    const runtimeStr = movie.Runtime.replace(/[^0-9]/g, "");
                    runtimeValue = runtimeStr ? Number(runtimeStr) : 0;
                  }

                  // Extract imdbRating safely
                  const imdbRating =
                    movie.imdbRating && movie.imdbRating !== "N/A"
                      ? parseFloat(movie.imdbRating)
                      : null;

                  const watchedMovie = {
                    imdbID: movie.imdbID,
                    Title: movie.Title,
                    Year: movie.Year,
                    Poster: movie.Poster,
                    runtime: runtimeValue,
                    imdbRating: imdbRating,
                    userRating: userRating,
                  };
                  handleAddMovie(watchedMovie);
                  handleCloseMovie();
                }}
              >
                {watchedMovie ? "Update rating" : "Add to list"}
              </button>
            )}
          </div>

          <p>
            <em>{movie.Plot}</em>
          </p>
          <p>Starring: {movie.Actors}</p>
          <p>Directed by {movie.Director}</p>
        </section>
      </div>
    </div>
  );
}

function WatchedBox({ watched, handleSelectedMovie, handleDeleteMovie }) {
  const [isOpen2, setIsOpen2] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMoviesList
            watched={watched}
            handleSelectedMovie={handleSelectedMovie}
            handleDeleteMovie={handleDeleteMovie}
          />
        </>
      )}
    </div>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>
            {watched.length > 0
              ? avgImdbRating
                ? avgImdbRating.toFixed(1)
                : "—"
              : "—"}
          </span>
        </p>
        <p>
          <span>🌟</span>
          <span>
            {watched.length > 0
              ? avgUserRating
                ? avgUserRating.toFixed(1)
                : "—"
              : "—"}
          </span>
        </p>
        <p>
          <span>⏳</span>
          <span>
            {watched.length > 0
              ? avgRuntime
                ? `${avgRuntime.toFixed(0)} min`
                : "—"
              : "—"}
          </span>
        </p>
      </div>
    </div>
  );
}

function WatchedMoviesList({
  watched,
  handleSelectedMovie,
  handleDeleteMovie,
}) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovies
          movie={movie}
          key={movie.imdbID}
          handleSelectedMovie={handleSelectedMovie}
          handleDeleteMovie={handleDeleteMovie}
        />
      ))}
    </ul>
  );
}

function WatchedMovies({ movie, handleSelectedMovie, handleDeleteMovie }) {
  return (
    <li onClick={() => handleSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>
            {movie.imdbRating !== null &&
            movie.imdbRating !== undefined &&
            !isNaN(movie.imdbRating) &&
            movie.imdbRating !== 0
              ? movie.imdbRating.toFixed(1)
              : "—"}
          </span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating || "—"}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>
            {movie.runtime !== null &&
            movie.runtime !== undefined &&
            !isNaN(movie.runtime) &&
            movie.runtime !== 0
              ? `${movie.runtime} min`
              : "—"}
          </span>
        </p>
        <button
          className="btn-delete"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the li's onClick
            handleDeleteMovie(movie.imdbID);
          }}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
