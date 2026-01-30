import { useEffect, useRef, useState } from "react";
import Select from "./Select";
import "./Select.css";

const LIMIT = 10;
const STORAGE_KEY = "selected-users";
const DEFAULT_ID = [10, 20, 30];

const emojis = ["😊", "🔥", "⚡", "🚀", "🌟"];
function getEmojiById(userId) {
  return emojis[userId % emojis.length];
}

function normalizeUser(user) {
  return {
    id: user.id,
    label: `${user.firstName} ${user.lastName}`
  };
}

function AsyncSelect() {

  //CONTROLLED MODE
  const [value, setValue] = useState([]);

  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const requestIdRef = useRef(0);

  // Fetch paginated options
  useEffect(() => {
    const requestId = ++requestIdRef.current;

    async function fetchUsers() {
      setLoading(true);

      const params = new URLSearchParams({
        q: query,
        limit: LIMIT,
        skip: page * LIMIT
      });

      const response = await fetch(
        `https://dummyjson.com/users/search?${params}`
      );
      const data = await response.json();

      if (requestId !== requestIdRef.current) return;

      const usersArray = Array.isArray(data.users)
        ? data.users
        : [];

      const mappedOptions = usersArray.map(normalizeUser);

      setOptions(previousOptions =>
        page === 0
          ? mappedOptions
          : mergeOptions(previousOptions, mappedOptions)
      );

      setHasMore(mappedOptions.length === LIMIT);
      setLoading(false);
    }

    fetchUsers();
  }, [page, query]);

  // defaults values - parent updates it through onChange
  useEffect(() => {
    async function fetchDefaults() {
      const results = await Promise.all(
        DEFAULT_ID.map(async userId => {
          const res = await fetch(
            `https://dummyjson.com/users/${userId}`
          );
          const data = await res.json();
          return normalizeUser(data);
        })
      );

      handleChange(results);
    }

    fetchDefaults();
  }, []);

  function mergeOptions(existing, incoming) {
    const map = new Map();
    [...existing, ...incoming].forEach(option => {
      map.set(option.id, option);
    });
    return Array.from(map.values());
  }

  // Side-effect only in uncontrolled
  // State update only in controlled
  function handleChange(nextValue) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextValue)
    );

    // CONTROLLED
    setValue(nextValue);
  }

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY);

    // CONTROLLED 
    setValue([]);
  }

  function handleSearch(searchQuery) {
    setQuery(searchQuery ?? "");
    setPage(0);
    setHasMore(true);
  }

  return (
    <div className="form-container">
      <Select
        options={options}

  
        // uncontrolled: comment value
        value={value}

        onChange={handleChange}
        onClear={handleClear}
        loading={loading}
        hasMore={hasMore}
        onReachEnd={() =>
          setPage(previousPage => previousPage + 1)
        }
        onSearch={handleSearch}
        placeholder="Search user"
        renderOption={(option, { selected }) => (
          <div style={{ display: "flex", gap: 8 }}>
            <span>{getEmojiById(option.id)}</span>
            <span>{option.label}</span>
            {selected && (
              <span style={{ marginLeft: "auto" }}>☑️</span>
            )}
          </div>
        )}
        renderSelectedValue={option => (
          <span>
            {getEmojiById(option.id)} {option.label}
          </span>
        )}
      />
    </div>
  );
}

export default AsyncSelect;
