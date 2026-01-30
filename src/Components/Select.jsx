import React, { useEffect, useRef, useState } from "react";
import "./Select.css";

function Select({
  options = [],
  value,
  onChange,
  onClear,
  onSearch,
  onReachEnd,
  loading = false,
  hasMore = false,
  multiple = true,
  placeholder,
  renderOption,
  renderSelectedValue
}) {
  // Controlled check
  const isControlled = value !== undefined;

  // Internal state (uncontrolled)
  const [internalValue, setInternalValue] = useState(
    multiple ? [] : null
  );

  const selectedValue = isControlled
    ? value
    : internalValue;

  const normalizedValue = multiple
    ? Array.isArray(selectedValue)
      ? selectedValue
      : []
    : selectedValue ?? null;

  function updateValue(nextValue) {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  }

  // UI state
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const debounceRef = useRef(null);
  const fetchingMoreRef = useRef(false);
  const previousOptionsLengthRef = useRef(options.length);
  const userNavigatedRef = useRef(false);

  // Outside click
  useEffect(() => {
    function handleOutsideClick(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Focus search
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setHighlightedIndex(0);
    }
  }, [open]);

  // Pagination unlock
  useEffect(() => {
    if (options.length > previousOptionsLengthRef.current) {
      fetchingMoreRef.current = false;
    }
    previousOptionsLengthRef.current = options.length;
  }, [options.length]);

  // Scroll highlight
  useEffect(() => {
    if (!open || !listRef.current) return;
    if (!userNavigatedRef.current) return;

    listRef.current.children[highlightedIndex]
      ?.scrollIntoView({ block: "nearest" });

    userNavigatedRef.current = false;
  }, [highlightedIndex, open]);

  // Reset search on close
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setHighlightedIndex(0);
      onSearch?.("");
    }
  }, [open]);

  function handleKeyDown(event) {
    if (!open) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      userNavigatedRef.current = true;
      setHighlightedIndex(i =>
        Math.min(i + 1, options.length - 1)
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      userNavigatedRef.current = true;
      setHighlightedIndex(i =>
        Math.max(i - 1, 0)
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = options[highlightedIndex];
      option && handleSelect(option);
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  }

  function handleSelect(option) {
    if (!multiple) {
      updateValue(option);
      setOpen(false);
      return;
    }

    const exists = normalizedValue.some(
      item => item.id === option.id
    );

    updateValue(
      exists
        ? normalizedValue.filter(
            item => item.id !== option.id
          )
        : [...normalizedValue, option]
    );
  }

  function handleScroll(event) {
    if (!hasMore || fetchingMoreRef.current) return;

    const element = event.currentTarget;
    if (
      element.scrollTop + element.clientHeight >=
      element.scrollHeight - 5
    ) {
      fetchingMoreRef.current = true;
      onReachEnd?.();
    }
  }

  const displayList = multiple
    ? normalizedValue
    : normalizedValue
    ? [normalizedValue]
    : [];

  return (
    <div
      ref={wrapperRef}
      className="select-wrapper"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div
        className="select-trigger"
        onClick={() => setOpen(p => !p)}
      >
        <div className="chips">
          {displayList.map(item => (
            <span key={item.id} className="chip">
              <span className="chip-content">
                {renderSelectedValue
                  ? React.Children.toArray(
                      renderSelectedValue(item)
                    )
                  : item.label}
              </span>
              {multiple && (
                <button
                  className="chip-remove"
                  onClick={event => {
                    event.stopPropagation();
                    updateValue(
                      normalizedValue.filter(
                        v => v.id !== item.id
                      )
                    );
                  }}
                >
                  ×
                </button>
              )}
            </span>
          ))}

          {displayList.length === 0 && (
            <span className="placeholder">
              {placeholder}
            </span>
          )}
        </div>

        {displayList.length > 0 && (
          <button
            className="clear-btn"
            onClick={event => {
              event.stopPropagation();
              updateValue(multiple ? [] : null);
              onClear?.();
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
            onChange={event => {
              const val = event.target.value;
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
            {options.map((option, index) => {
              const selected = multiple
                ? normalizedValue.some(
                    v => v.id === option.id
                  )
                : normalizedValue?.id === option.id;

              const highlighted =
                index === highlightedIndex;

              return (
                <li
                  key={option.id}
                  className={`select-option ${
                    selected ? "selected" : ""
                  } ${
                    highlighted ? "highlighted" : ""
                  }`}
                  onMouseEnter={() =>
                    setHighlightedIndex(index)
                  }
                  onClick={() =>
                    handleSelect(option)
                  }
                >
                  {renderOption
                    ? React.Children.toArray(
                        renderOption(option, {
                          selected,
                          highlighted
                        })
                      )
                    : option.label}
                </li>
              );
            })}

            {loading && (
              <li key="loading" className="select-loading">
                Loading…
              </li>
            )}

            {!loading && options.length === 0 && (
              <li key="empty" className="select-empty">
                No results
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}

export default Select;
