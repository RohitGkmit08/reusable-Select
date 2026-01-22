import { useEffect, useRef, useState } from "react";
import "./async.css"
const matchesSearch = (option, term) => {
  return option.label
    .toLowerCase()
    .includes(term.trim().toLowerCase());
};

const resetState = ({setOpen,setHighlightedIndex, setSearchTerm }) => {
  setOpen(false);
  setHighlightedIndex(-1);
  setSearchTerm("");
};

const Select1 = ({
  label,
  options,
  value,
  onChange,
  onClear,
  loading = false,
  error = null,
  enableSearch = true
}) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");

  const wrapperRef = useRef(null);
  const optionRefs = useRef([]);

  const handleDocumentClick = (event) => {
    if (!wrapperRef.current) {
      return;
    }

    const clickedInside = wrapperRef.current.contains(event.target);

    if (!clickedInside) {
      resetState({
        setOpen,
        setHighlightedIndex,
        setSearchTerm
      });
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);


  useEffect(() => {
    if (loading) {
      setOpen(false);
    }
  }, [loading]);


  useEffect(() => {
    if (value === null) {
      setHighlightedIndex(-1);
      setSearchTerm("");
    }
  }, [value]);


  const filteredOptions = enableSearch
    ? options.filter(option =>
        matchesSearch(option, searchTerm)
      )
    : options;

  
  useEffect(() => {
    optionRefs.current = [];

    if (filteredOptions.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [searchTerm, options]);

  
  useEffect(() => {
    if (highlightedIndex === -1) return;

    optionRefs.current[highlightedIndex]?.scrollIntoView({
      block: "nearest"
    });
  }, [highlightedIndex]);

  
  const handleKeyDown = (e) => {
    if (!open || loading || error) return;

    if (
      ["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)
    ) {
      e.preventDefault();
    }

    if (e.key === "ArrowDown") {
      setHighlightedIndex(i =>
        Math.min(i + 1, filteredOptions.length - 1)
      );
    }

    if (e.key === "ArrowUp") {
      setHighlightedIndex(i =>
        Math.max(i - 1, 0)
      );
    }

    if (e.key === "Escape") {
      resetState({
        setOpen,
        setHighlightedIndex,
        setSearchTerm
      });
    }

    if (e.key === "Enter" && highlightedIndex !== -1) {
      onChange(filteredOptions[highlightedIndex]);
      resetState({
        setOpen,
        setHighlightedIndex,
        setSearchTerm
      });
    }
  };

  
  let displayText = label;

  if (loading) {
    displayText = "Loading...";
  } else if (error) {
    displayText = "Failed to load";
  } else if (value) {
    displayText = value.label;
  }

  
  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="select-wrapper"
    >
      <div
        className="select-control"
        onClick={(e) => {
          e.stopPropagation();
          if (loading || error) return;
          setOpen(o => !o);
        }}
      >
        <span>{displayText}</span>

        {value && !loading && !error && (
          <span
            className="select-clear"
            onClick={(e) => {
              e.stopPropagation();
              onClear?.();
              resetState({
                setOpen,
                setHighlightedIndex,
                setSearchTerm
              });
            }}
          >
            ✕
          </span>
        )}
      </div>

      {open && (
        <ul
          className="select-dropdown"
          onClick={(e) => e.stopPropagation()}
        >
          {!loading && !error && enableSearch && (
            <li>
              <input
                className="select-search"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />
            </li>
          )}

          {!loading &&
            !error &&
            filteredOptions.map((option, index) => (
              <li
                key={option.id}
                ref={(el) =>
                  (optionRefs.current[index] = el)
                }
                className={`select-option ${
                  index === highlightedIndex
                    ? "highlighted"
                    : ""
                }`}
                onMouseEnter={() =>
                  setHighlightedIndex(index)
                }
                onClick={() => {
                  onChange(option);
                  resetState({
                    setOpen,
                    setHighlightedIndex,
                    setSearchTerm
                  });
                }}
              >
                {option.label}
              </li>
            ))}

          {!loading &&
            !error &&
            filteredOptions.length === 0 && (
              <li className="select-empty">
                No options found
              </li>
            )}
        </ul>
      )}
    </div>
  );
};

export default Select1;
