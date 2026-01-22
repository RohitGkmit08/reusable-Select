import { useState, useEffect } from "react";
import "./select.css"
const matchesSearch = (option, searchTerm) => {
  return option.toLowerCase().includes(searchTerm.toLowerCase());
};

const resetDropdownState = ({
  setOpen,
  setHighlightedIndex,
  setSearchTerm
}) => {
  setOpen(false);
  setHighlightedIndex(-1);
  setSearchTerm("");
};

const Select = ({
  label,
  options,
  value,
  onChange,
  onClear,
  disabledOptions = [],
  enableSearch = true
}) => {
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!open) return;

    const handleClick = () => {
      resetDropdownState({
        setOpen,
        setHighlightedIndex,
        setSearchTerm
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [open]);

  useEffect(() => {
    if (!enableSearch) return;
    setHighlightedIndex(-1);
  }, [searchTerm, enableSearch]);

  const filteredOptions = enableSearch
    ? options.filter(option => matchesSearch(option, searchTerm))
    : options;

  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      setHighlightedIndex(prev =>
        Math.min(prev + 1, filteredOptions.length - 1)
      );
    }

    if (e.key === "ArrowUp") {
      setHighlightedIndex(prev =>
        Math.max(prev - 1, 0)
      );
    }

    if (e.key === "Escape") {
      resetDropdownState({
        setOpen,
        setHighlightedIndex,
        setSearchTerm
      });
    }

    if (e.key === "Enter" && highlightedIndex !== -1) {
      const option = filteredOptions[highlightedIndex];
      if (!disabledOptions.includes(option)) {
        onChange(option);
        resetDropdownState({
          setOpen,
          setHighlightedIndex,
          setSearchTerm
        });
      }
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    }
    resetDropdownState({
      setOpen,
      setHighlightedIndex,
      setSearchTerm
    });
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="select-wrapper"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpen(prev => !prev);
        }}
        className="select-control"
      >
        <span>{value ?? label}</span>
        {value && (
          <span
            onClick={handleClear}
            className="select-clear"
          >
            ✕
          </span>
        )}
      </div>

      {open && (
        <ul
          onClick={(e) => e.stopPropagation()}
          className="select-dropdown"
        >
          {enableSearch && (
            <li>
              <input
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value.trim())
                }
                placeholder="Search"
                className="select-search"
              />
            </li>
          )}

          {filteredOptions.map((option, index) => {
            const isHighlighted = index === highlightedIndex;
            const isDisabled = disabledOptions.includes(option);

            return (
              <li
                key={option}
                onClick={() => {
                  if (isDisabled) return;
                  onChange(option);
                  resetDropdownState({
                    setOpen,
                    setHighlightedIndex,
                    setSearchTerm
                  });
                }}
                className={`select-option
                  ${isHighlighted ? "highlighted" : ""}
                  ${isDisabled ? "disabled" : ""}`}
              >
                {option}
              </li>
            );
          })}

          {enableSearch && filteredOptions.length === 0 && (
            <li className="select-empty">
              No results found
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Select;
