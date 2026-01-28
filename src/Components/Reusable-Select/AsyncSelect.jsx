import { useEffect, useRef, useState } from "react";
import Select from "./Select";
import "./Select.css"

const lt = 10;
const storage_key = "localStorage-key";
const default_id = [12, 37, 100];
const emojis = ["😊", "🔥", "⚡", "🚀", "🌟"];
const getEmoji = id => emojis[id % emojis.length];

const normalizeUser = user => ({
  id: user.id,
  label: `${user.firstName} ${user.lastName}`
});

const AsyncSelect = () => {

  const [value, setValue] = useState(() => {
    let initialValue = [];

    try {
      const stored = localStorage.getItem(storage_key);

      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          initialValue = parsed;
        }
      } else {
        initialValue = default_id.map(id => ({
          id,
          label: "Loading"
        }));
      }
    } catch (err) {
      initialValue = default_id.map(id => ({
        id,
        label: "Loading"
      }));
    }

    return initialValue;
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

      let mapped;
      if (data.users) {
        mapped = data.users.map(user => normalizeUser(user));
      } else {
        mapped = [];
      }

    setOptions(prev => {
        if (page === 0) {
          return mapped;
        }
        return mergeOptions(prev, mapped);
      });


      setHasMore(mapped.length === lt);
      setLoading(false);
    };

    fetchUsers();
  }, [page, query]);

  useEffect(() => {
    for (let i = 0; i < value.length; i++) {
      const selected = value[i];

      let found = false;
      for (let j = 0; j < options.length; j++) {
        if (options[j].id === selected.id) {
          found = true;
          break;
        }
      }

      if (!found) {
        fetchUserById(selected.id);
      }
    }
  }, [value, options]);

  const fetchUserById = async id => {
    try {
      const res = await fetch(
        `https://dummyjson.com/users/${id}`
      );
      const data = await res.json();

      if (data && data.id) {
        const normalized = normalizeUser(data);
        setOptions(prev => mergeOptions(prev, [normalized]));
        setValue(prev =>
          prev.map(v => (v.id === id ? normalized : v))
        );
      }
    } catch (err) {
      console.log("Failed to fetch user:", id);
    }
  };

  const mergeOptions = (existing, incoming) => {
    const map = new Map();

    for (let i = 0; i < existing.length; i++) {
      map.set(existing[i].id, existing[i]);
    }

    for (let i = 0; i < incoming.length; i++) {
      map.set(incoming[i].id, incoming[i]);
    }

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
    if (q) {
      setQuery(q);
    } else {
      setQuery("");
    }
    setPage(0);
    setHasMore(true);
  };

  return (
    <div className="form-container">
      <Select
        multiple={true}
        options={options}
        value={value}
        loading={loading}
        hasMore={hasMore}
        onChange={handleChange}
        onClear={handleClear}
        onReachEnd={() => setPage(p => p + 1)}
        onSearch={handleSearch}
        placeholder="Search user"
        renderOption={(option, { selected }) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%"
            }}
          >
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
