import React, { useEffect, useRef, useState } from "react";
import "./Select.css";

// Reusable keyboard navigation logic
function handleDropdownKeyDown({
  event,
  open,
  options,
  highlightedIndex,
  setHighlightedIndex,
  onSelect,
  closeDropdown,
  userNavigatedRef
}) {
  if (!open) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    userNavigatedRef.current = true;
    setHighlightedIndex(index =>
      Math.min(index + 1, options.length - 1)
    );
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    userNavigatedRef.current = true;
    setHighlightedIndex(index =>
      Math.max(index - 1, 0)
    );
  }

  if (event.key === "Enter") {
    event.preventDefault();
    const option = options[highlightedIndex];
    option && onSelect(option);
  }

  if (event.key === "Escape") {
    closeDropdown();
  }
}

function Select({
  options = [],
  value,
  onChange,
  onClear,
  onSearch,
  onReachEnd,
  isLoading = false,
  hasMoreOptions = false,
  isMultipleAllowed = true,
  placeholder,
  renderOption,
  renderChipValue
}) {

 // Controlled or uncontrolled
  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState(
    isMultipleAllowed ? [] : null
  );

  const selectedValue = isControlled ? value : internalValue;

// Normalization
let normalizedValue;

if (isMultipleAllowed) {
  if (Array.isArray(selectedValue)) {
    normalizedValue = selectedValue;
  } else {
    normalizedValue = [];
  }
} else {
  if (Array.isArray(selectedValue)) {
    normalizedValue = null;
  } else {
    normalizedValue = selectedValue ?? null;
  }
}


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

 
 // Refs
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const debounceRef = useRef(null);
  const fetchingMoreRef = useRef(false);
  const userNavigatedRef = useRef(false);


// Handlers
  const displayList = isMultipleAllowed
    ? normalizedValue
    : normalizedValue
    ? [normalizedValue]
    : [];

  const hasSelection = displayList.length > 0;

  const closeDropdown = () => setOpen(false);
  const toggleDropdown = () => setOpen(prev => !prev);

  const handleWrapperKeyDown = event =>
    handleDropdownKeyDown({
      event,
      open,
      options,
      highlightedIndex,
      setHighlightedIndex,
      onSelect: toggleOptionSelection,
      closeDropdown,
      userNavigatedRef
    });

  const handleClearClick = event => {
    event.stopPropagation();
    updateValue(isMultipleAllowed ? [] : null);
    onClear?.();
  };

  const handleSearchChange = event => {
    const value = event.target.value;
    setSearchQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => onSearch?.(value.trim()),
      300
    );
  };


//  Effects
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

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setHighlightedIndex(0);
      onSearch?.("");
    }
  }, [open]);


// Selection logic
  function toggleOptionSelection(option) {
    if (!isMultipleAllowed) {
      updateValue(option);
      setOpen(false);
      return;
    }

    const isAlreadySelected = normalizedValue.some(
      value => value.id === option.id
    );

    updateValue(
      isAlreadySelected
        ? normalizedValue.filter(
            value => value.id !== option.id
          )
        : [...normalizedValue, option]
    );
  }

  function handleChipRemove(option) {
    return event => {
      event.stopPropagation();
      updateValue(
        normalizedValue.filter(
          value => value.id !== option.id
        )
      );
    };
  }


// Scroll / pagination
  function handleScroll(event) {
    if (!hasMoreOptions || fetchingMoreRef.current) return;

    const element = event.currentTarget;
    if (
      element.scrollTop + element.clientHeight >=
      element.scrollHeight - 5
    ) {
      fetchingMoreRef.current = true;
      onReachEnd?.();
    }
  }
// Class assignment to an option
  function getOptionClassName({ selected, highlighted }) {
    return `select-option ${
      selected ? "selected" : ""
    } ${highlighted ? "highlighted" : ""}`;
  }

  function renderChips() {
    if (!hasSelection) {
      return (
        <span className="placeholder">
          {placeholder}
        </span>
      );
    }
    return displayList.map(option => (
      <span key={option.id} className="chip">
        {renderChipValue
          ? renderChipValue(option)
          : option.label}

        {isMultipleAllowed && (
          <button
            className="chip-remove"
            onClick={handleChipRemove(option)}
          >
            ×
          </button>
        )}
      </span>
    ));
  }

  function renderOptions() {
    return options.map((option, index) => {
      const selected = isMultipleAllowed
        ? normalizedValue.some(
            value => value.id === option.id
          )
        : normalizedValue?.id === option.id;

      return (
        <li
          key={option.id}
          className={getOptionClassName({
            selected,
            highlighted: index === highlightedIndex
          })}
          onMouseEnter={() =>
            setHighlightedIndex(index)
          }
          onClick={() =>
            toggleOptionSelection(option)
          }
        >
          {renderOption
            ? renderOption(option, { selected })
            : option.label}
        </li>
      );
    });
  }

  function renderStatusRow() {
    if (isLoading) {
      return (
        <li className="select-loading">
          Loading…
        </li>
      );
    }

    if (!isLoading && options.length === 0) {
      return (
        <li className="select-empty">
          No results
        </li>
      );
    }

    return null;
  }

  function renderDropdown() {
    if (!open) return null;
    return (
      <>
        <input
          ref={inputRef}
          className="select-search"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <ul
          ref={listRef}
          className="select-dropdown"
          onScroll={handleScroll}
        >
          {renderOptions()}
          {renderStatusRow()}
        </ul>
      </>
    );
  }

// Final render
return (
    <div
      ref={wrapperRef}
      className="select-wrapper"
      tabIndex={0}
      onKeyDown={handleWrapperKeyDown}
    >
      <div
        className="select-trigger"
        onClick={toggleDropdown}
      >
        <div className="chips">
          {renderChips()}
        </div>

        {hasSelection && (
          <button
            className="clear-btn"
            onClick={handleClearClick}
          >
            Clear
          </button>
        )}
      </div>

      {renderDropdown()}
    </div>
  );
}

export default Select;
