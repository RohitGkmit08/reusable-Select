import { useEffect, useRef, useState } from "react";
import "./Select.css";

const Select = ({
  options,
  value,
  onChange,
  onClear,
  onSearch,
  onReachEnd,
  loading,
  hasMore,
  multiple = true,
  placeholder,
  renderOption,
  renderValue
}) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const debounceRef = useRef(null);
  const fetchingMoreRef = useRef(false);
  const prevOptionsLengthRef = useRef(options.length);

  const defaultRenderOption = (option, { selected }) => (
    <>
      {multiple && (
        <input type="checkbox" readOnly checked={selected} />
      )}
      {option.label}
    </>
  );

  const defaultRenderValue = option => option.label;

  useEffect(() => {
    const handler = e => {
      if (!wrapperRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () =>
      document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;

    inputRef.current?.focus();
    setHighlightedIndex(0);
  }, [open]);

  useEffect(() => {
    if (options.length > prevOptionsLengthRef.current) {
      fetchingMoreRef.current = false;
    }

    prevOptionsLengthRef.current = options.length;
    setHighlightedIndex(0);
  }, [options]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.children[
      highlightedIndex
    ]?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, open]);

  const handleSearchChange = e => {
    const raw = e.target.value;
    setSearchQuery(raw);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch?.(raw.trim());
    }, 300);
  };

  const handleScroll = e => {
    if (!hasMore || fetchingMoreRef.current) return;

    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      fetchingMoreRef.current = true;
      onReachEnd();
    }
  };

  const handleSelect = option => {
    const exists = value.some(
      selectedItem => selectedItem.id === option.id
    );

    if (!multiple) {
      onChange([option]);
      setOpen(false);
      return;
    }

    onChange(
      exists
        ? value.filter(
            selectedItem => selectedItem.id !== option.id
          )
        : [...value, option]
    );
  };

  return (
    <div
      ref={wrapperRef}
      className="select-wrapper"
      tabIndex={0}
    >
      <div
        className="select-trigger"
        onClick={() => setOpen(o => !o)}
      >
        <div className="chips">
          {value.map(item => (
            <span key={item.id} className="chip">
              {(renderValue ?? defaultRenderValue)(item)}

              {multiple && (
                <button
                  className="chip-remove"
                  onClick={e => {
                    e.stopPropagation();
                    onChange(
                      value.filter(
                        selectedItem =>
                          selectedItem.id !== item.id
                      )
                    );
                  }}
                >
                  ×
                </button>
              )}
            </span>
          ))}

          {value.length === 0 && (
            <span className="placeholder">{placeholder}</span>
          )}
        </div>

        {value.length > 0 && (
          <button
            className="clear-btn"
            onClick={e => {
              e.stopPropagation();
              onClear();
            }}
          >
            Clear
          </button>
        )}
      </div>

      {open && (
        <>
          <input
            ref={inputRef}
            className="select-search"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search…"
          />

          <ul
            ref={listRef}
            className="select-dropdown"
            onScroll={handleScroll}
          >
            {options.map((option, index) => {
              const selected = value.some(
                item => item.id === option.id
              );
              const highlighted = index === highlightedIndex;

              return (
                <li
                  key={option.id}
                  className={`select-option ${
                    selected ? "selected" : ""
                  } ${highlighted ? "highlighted" : ""}`}
                  onMouseEnter={() =>
                    setHighlightedIndex(index)
                  }
                  onClick={() => handleSelect(option)}
                >
                  {(renderOption ?? defaultRenderOption)(
                    option,
                    { selected, highlighted }
                  )}
                </li>
              );
            })}

            {loading && (
              <li className="select-loading">Loading…</li>
            )}
            {!loading && options.length === 0 && (
              <li className="select-empty">No results</li>
            )}
          </ul>
        </>
      )}
    </div>
  );
};

export default Select;
