import { useEffect, useRef, useState } from "react";
import Select from "./Components/Select";

const LIMIT = 10;
const STORAGE_KEY = "selected-users";
const DEFAULT_ID = [10, 20, 30];

const emojis = ["😊", "🔥", "⚡", "🚀", "🌟"];
const getEmojiById = id => emojis[id % emojis.length];

// Normalize API
function normalizeUser(user) {
  return {
    id: user.id,
    label: `${user.firstName} ${user.lastName}`
  };
}

function Home() {
  // Single-select → value MUST be null | option
  const [value, setValue] = useState(null);

  // Async state
  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [hasMoreOptions, setHasMoreOptions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Prevent stale async updates
  const requestIdRef = useRef(0);


  // Fetch paginated users
  useEffect(() => {
    const requestId = ++requestIdRef.current;

    async function fetchUsers() {
      setIsLoading(true);

      const params = new URLSearchParams({
        q: query,
        limit: LIMIT,
        skip: page * LIMIT
      });

      const response = await fetch(
        `https://dummyjson.com/users/search?${params}`
      );
      const data = await response.json();

      // Ignore outdated responses
      if (requestId !== requestIdRef.current) return;

      const mapped = Array.isArray(data.users)
        ? data.users.map(normalizeUser)
        : [];

      setOptions(prev =>
        page === 0 ? mapped : mergeOptions(prev, mapped)
      );

      setHasMoreOptions(mapped.length === LIMIT);
      setIsLoading(false);
    }

    fetchUsers();
  }, [page, query]);


  // Fetch default selected users
  useEffect(() => {
    async function fetchDefaults() {
      const results = await Promise.all(
        DEFAULT_ID.map(async id => {
          const res = await fetch(
            `https://dummyjson.com/users/${id}`
          );
          const data = await res.json();
          return normalizeUser(data);
        })
      );

      // Single-select → pick one or null
      handleChange(results[0] ?? null);
    }

    fetchDefaults();
  }, []);

  function mergeOptions(existing, incoming) {
    const map = new Map();
    [...existing, ...incoming].forEach(option =>
      map.set(option.id, option)
    );
    return Array.from(map.values());
  }

  // Controlled change
  function handleChange(nextValue) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextValue));
    setValue(nextValue);
  }

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY);
    setValue(null);
  }

  function handleSearch(searchQuery) {
    setQuery(searchQuery ?? "");
    setPage(0);
    setHasMoreOptions(true);
  }

  return (
    <div className="form-container">
      <Select
        options={options}
        value={value}
        onChange={handleChange}
        onClear={handleClear}
        isLoading={isLoading}
        hasMoreOptions={hasMoreOptions}
        isMultipleAllowed={false}
        onReachEnd={() =>
          setPage(prev => prev + 1)
        }
        onSearch={handleSearch}
        placeholder="Search user"
        renderOption={(option, { selected }) => (
          <div className="option-row">
            <span>{getEmojiById(option.id)}</span>
            <span>{option.label}</span>
            {selected && (
              <span className="option-check">☑️</span>
            )}
          </div>
        )}
        renderChipValue={option => (
          <span>
            {getEmojiById(option.id)} {option.label}
          </span>
        )}
      />
    </div>
  );
}

export default Home;
