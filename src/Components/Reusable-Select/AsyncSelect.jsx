import { useEffect, useRef, useState } from "react";
import Select from "./Select";
import "./Select.css";

const lt = 10;
const storage_key = "selected-users";
const default_id = [12, 37, 100];

const emojis = ["😊", "🔥", "⚡", "🚀", "🌟"];
const getEmoji = id => emojis[id % emojis.length];

const loadingValueById = id => ({
  id,
  label: "Loading"
});

const normalizeUser = user => ({
  id: user.id,
  label: `${user.firstName} ${user.lastName}`
});

const AsyncSelect = () => {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(storage_key);
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch {}

    return default_id.map(loadingValueById);
  });

  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const requestIdRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestIdRef.current;

    const fetchUsers = async () => {
      setLoading(true);

      const params = new URLSearchParams({
        q: query,
        limit: lt,
        skip: page * lt
      });

      const res = await fetch(
        `https://dummyjson.com/users/search?${params}`
      );
      const data = await res.json();

      if (requestId !== requestIdRef.current) return;

      const users = Array.isArray(data.users) ? data.users : [];
      const mapped = users.map(normalizeUser);

      setOptions(prev =>
        page === 0 ? mapped : mergeOptions(prev, mapped)
      );

      setHasMore(mapped.length === lt);
      setLoading(false);
    };

    fetchUsers();
  }, [page, query]);

  useEffect(() => {
    value.forEach(selectedItem => {
      const exists = options.some(
        option => option.id === selectedItem.id
      );

      if (!exists) {
        fetchUserById(selectedItem.id);
      }
    });
  }, [value, options]);

  const fetchUserById = async id => {
    try {
      const res = await fetch(
        `https://dummyjson.com/users/${id}`
      );
      const data = await res.json();

      if (!data?.id) return;

      const normalized = normalizeUser(data);

      setOptions(prev => mergeOptions(prev, [normalized]));
      setValue(prev =>
        prev.map(item => (item.id === id ? normalized : item))
      );
    } catch {
      console.log("Failed to fetch user:", id);
    }
  };

  const mergeOptions = (existing, incoming) => {
    const map = new Map();

    [...existing, ...incoming].forEach(option => {
      map.set(option.id, option);
    });

    return Array.from(map.values());
  };

  const handleChange = nextValue => {
    setValue(nextValue);
    localStorage.setItem(
      storage_key,
      JSON.stringify(nextValue)
    );
  };

  const handleClear = () => {
    setValue([]);
    localStorage.removeItem(storage_key);
  };

  const handleSearch = q => {
    setQuery(q ?? "");
    setPage(0);
    setHasMore(true);
  };

  return (
    <div className="form-container">
      <Select
        options={options}
        value={value}
        loading={loading}
        hasMore={hasMore}
        onChange={handleChange}
        onClear={handleClear}
        onReachEnd={() => setPage(prev => prev + 1)}
        onSearch={handleSearch}
        placeholder="Search user"
        renderOption={(option, { selected }) => (
          <div style={{ display: "flex", gap: 8 }}>
            <span>{getEmoji(option.id)}</span>
            <span>{option.label}</span>
            {selected && (
              <span style={{ marginLeft: "auto" }}>☑️</span>
            )}
          </div>
        )}
        renderValue={option => (
          <span>
            {getEmoji(option.id)} {option.label}
          </span>
        )}
      />
    </div>
  );
};

export default AsyncSelect;
