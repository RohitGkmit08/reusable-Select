import { useEffect, useRef, useState } from "react";
import "./Select.css";

export default function Select({
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
  renderSelectedValue
}) {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const debounceRef = useRef(null);
  const fetchingMoreRef = useRef(false);
  const prevOptionsLengthRef = useRef(options.length);
  const userNavigatedRef = useRef(false);

  const defaultRenderOption = (opt, { selected }) => (
    <>
      {multiple && <input type="checkbox" readOnly checked={selected} />}
      {opt.label}
    </>
  );

  const defaultRenderValue = opt => opt.label;

  useEffect(() => {
    const clickOutside = e => {
      if (!wrapperRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setHighlightedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (options.length > prevOptionsLengthRef.current) {
      fetchingMoreRef.current = false;
    }
    prevOptionsLengthRef.current = options.length;
  }, [options.length]);


  useEffect(() => {
    if (!open || !listRef.current) return;
    if (!userNavigatedRef.current) return;

    listRef.current.children[highlightedIndex]
      ?.scrollIntoView({ block: "nearest" });

    userNavigatedRef.current = false;
  }, [highlightedIndex, open]);

  const handleKeyDown = e => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      userNavigatedRef.current = true;
      setHighlightedIndex(i => Math.min(i + 1, options.length - 1));
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      userNavigatedRef.current = true;
      setHighlightedIndex(i => Math.max(i - 1, 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[highlightedIndex];
      opt && handleSelect(opt);
    }

    if (e.key === "Escape") setOpen(false);
  };

  const handleSelect = option => {
    const exists = value.some(val => val.id === option.id);

    if (!multiple) {
      onChange([option]);
      setOpen(false);
      return;
    }

    onChange(
      exists
        ? value.filter(val => val.id !== option.id)
        : [...value, option]
    );
  };

  const handleScroll = e => {
    if (!hasMore || fetchingMoreRef.current) return;

    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5) {
      fetchingMoreRef.current = true;
      onReachEnd();
    }
  };
  
  useEffect(() => {
  if (!open) {
    setSearchQuery("");
    setHighlightedIndex(0);
    if(onSearch !== null){
      onSearch("")
    }
  }
}, [open]);

  return (
    <div
      ref={wrapperRef}
      className="select-wrapper"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className="select-trigger"
        onClick={() => setOpen(open => !open)}
      >
        <div className="chips">
          {value.map(val => (
            <span key={val.id} className="chip">
              {(renderSelectedValue ?? defaultRenderValue)(val)}
              {multiple && (
                <button
                  className="chip-remove"
                  onClick={e => {
                    e.stopPropagation();
                    onChange(value.filter(idx => idx.id !== val.id));
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
            onChange={e => {
              const val = e.target.value;
              setSearchQuery(val);
              clearTimeout(debounceRef.current);
              debounceRef.current = setTimeout(
                () => onSearch?.(val.trim()),
                300
              );
            }}
            
          />

          <ul
            ref={listRef}
            className="select-dropdown"
            onScroll={handleScroll}
          >
            {options.map((opt, idx) => {
              const selected = value.some(val=> val.id === opt.id);
              const highlighted = idx === highlightedIndex;

              return (
                <li
                  key={opt.id}
                  className={`select-option ${selected ? "selected" : ""} ${highlighted ? "highlighted" : ""}`}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => handleSelect(opt)}
                >
                  {(renderOption ?? defaultRenderOption)(opt, {
                    selected,
                    highlighted
                  })}
                </li>
              );
            })}

            {loading && <li className="select-loading">Loading…</li>}
            {!loading && options.length === 0 && (
              <li className="select-empty">No results</li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
