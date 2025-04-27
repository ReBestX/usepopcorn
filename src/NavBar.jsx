import { useEffect, useRef } from "react";

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {/* Render additional children components, such as search or results */}
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img" aria-label="popcorn">
        🍿
      </span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  // Function to clear the search input
  function clearSearch() {
    setQuery("");
    inputEl.current.focus(); // Optionally focus the input after clearing
  }

  // Add this effect to focus the search bar when component mounts
  useEffect(function () {
    inputEl.current.focus();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(
    function () {
      function callback(e) {
        if (document.activeElement === inputEl.current) return;

        if (e.code === "Enter") {
          inputEl.current.focus();
        }
      }

      document.addEventListener("keydown", callback);
      return () => document.removeEventListener("keydown", callback);
    },
    [setQuery]
  );

  return (
    // Wrap input and button for relative positioning
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifySelf: "center",
      }}
    >
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={inputEl}
      />
      {/* Conditionally render the clear button inside the input field */}
      {query && (
        <button className="btn-clear" onClick={clearSearch}>
          &times; {/* Use '×' symbol */}
        </button>
      )}
    </div>
  );
}

function NumResults({ totalResults }) {
  return (
    <p className="num-results">
      {/* Display the total number of search results */}
      Found <strong>{totalResults}</strong> results
    </p>
  );
}

export { NavBar, Logo, Search, NumResults };
