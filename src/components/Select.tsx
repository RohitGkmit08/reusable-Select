import {
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction
} from "react";
import type React from "react";
import "./Select.css";

export interface SelectOption {
  id: string | number;
  label: string;
}

interface DropdownKeyDownParams {
  event: React.KeyboardEvent<HTMLDivElement>;
  open: boolean;
  options: SelectOption[];
  highlightedIndex: number;
  setHighlightedIndex: Dispatch<SetStateAction<number>>;
  onSelect: (option: SelectOption) => void;
  closeDropdown: () => void;
  userNavigatedRef: React.RefObject<boolean>;
}

function handleDropdownKeyDown(
  params: DropdownKeyDownParams
): void {
  const event = params.event;
  const open = params.open;
  const options = params.options;
  const highlightedIndex = params.highlightedIndex;
  const setHighlightedIndex = params.setHighlightedIndex;
  const onSelect = params.onSelect;
  const closeDropdown = params.closeDropdown;
  const userNavigatedRef = params.userNavigatedRef;

  if (!open) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    userNavigatedRef.current = true;
    setHighlightedIndex(function (index) {
      return Math.min(index + 1, options.length - 1);
    });
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    userNavigatedRef.current = true;
    setHighlightedIndex(function (index) {
      return Math.max(index - 1, 0);
    });
  }

  if (event.key === "Enter") {
    event.preventDefault();
    const option = options[highlightedIndex];
    if (option) {
      onSelect(option);
    }
  }

  if (event.key === "Escape") {
    closeDropdown();
  }
}


interface SelectProps {
  options: SelectOption[];
  value?: SelectOption | SelectOption[] | null;
  onChange?: (
    value: SelectOption | SelectOption[] | null
  ) => void;
  onClear?: () => void;
  onSearch?: (query: string) => void;
  onReachEnd?: () => void;
  isLoading?: boolean;
  hasMoreOptions?: boolean;
  isMultipleAllowed?: boolean;
  placeholder?: string;
  renderOption?: (
    option: SelectOption,
    meta: { selected: boolean }
  ) => React.ReactNode;
  renderChipValue?: (
    option: SelectOption
  ) => React.ReactNode;
}

function Select({
  options,
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
}: SelectProps): React.ReactElement {
  /* ---------- controlled / uncontrolled ---------- */
  const isControlled = value !== undefined;

  const [internalValue, setInternalValue] = useState<
    SelectOption[] | SelectOption | null
  >(isMultipleAllowed ? [] : null);

  const selectedValue = isControlled ? value : internalValue;

  /* ---------- normalization ---------- */
  let normalizedValue: SelectOption[] | SelectOption | null;

  if (isMultipleAllowed) {
    normalizedValue = Array.isArray(selectedValue)
      ? selectedValue
      : [];
  } else {
    normalizedValue = Array.isArray(selectedValue)
      ? null
      : selectedValue ?? null;
  }

  function updateValue(
    nextValue: SelectOption[] | SelectOption | null
  ): void {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onChange?.(nextValue);
  }

  /* ---------- UI state ---------- */
  const [open, setOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] =
    useState<number>(0);
  const [searchQuery, setSearchQuery] =
    useState<string>("");

  /* ---------- refs ---------- */
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const debounceRef = useRef<number | null>(null);
  const fetchingMoreRef = useRef<boolean>(false);
  const userNavigatedRef = useRef<boolean>(false);

  /* ---------- derived ---------- */
  const displayList: SelectOption[] = isMultipleAllowed
    ? (normalizedValue as SelectOption[])
    : normalizedValue
    ? [normalizedValue as SelectOption]
    : [];

  const hasSelection = displayList.length > 0;

  const closeDropdown = (): void => setOpen(false);
  const toggleDropdown = (): void =>
    setOpen(prev => !prev);

  const handleWrapperKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>
  ): void =>
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

  const handleClearClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    event.stopPropagation();
    updateValue(isMultipleAllowed ? [] : null);
    onClear?.();
  };

  const handleSearchChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = event.target.value;
    setSearchQuery(value);

    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      onSearch?.(value.trim());
    }, 300);
  };

  /* ---------- effects ---------- */
  useEffect(() => {
    function handleOutsideClick(event: MouseEvent): void {
      if (
        !wrapperRef.current?.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
  }, []);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setHighlightedIndex(0);
      onSearch?.("");
    }
  }, [open, onSearch]);

  /* ---------- selection logic ---------- */
  function toggleOptionSelection(
    option: SelectOption
  ): void {
    if (!isMultipleAllowed) {
      updateValue(option);
      setOpen(false);
      return;
    }

    const current = normalizedValue as SelectOption[];

    const isAlreadySelected = current.some(
      value => value.id === option.id
    );

    updateValue(
      isAlreadySelected
        ? current.filter(
            value => value.id !== option.id
          )
        : [...current, option]
    );
  }

  function handleChipRemove(option: SelectOption) {
    return (
      event: React.MouseEvent<HTMLButtonElement>
    ): void => {
      event.stopPropagation();
      updateValue(
        (normalizedValue as SelectOption[]).filter(
          value => value.id !== option.id
        )
      );
    };
  }

  /* ---------- scroll ---------- */
  function handleScroll(
    event: React.UIEvent<HTMLUListElement>
  ): void {
    if (!hasMoreOptions || fetchingMoreRef.current)
      return;

    const element = event.currentTarget;

    if (
      element.scrollTop + element.clientHeight >=
      element.scrollHeight - 5
    ) {
      fetchingMoreRef.current = true;
      onReachEnd?.();
    }
  }

  /* ---------- helpers ---------- */
  function getOptionClassName({
    selected,
    highlighted
  }: {
    selected: boolean;
    highlighted: boolean;
  }): string {
    return `select-option ${
      selected ? "selected" : ""
    } ${highlighted ? "highlighted" : ""}`;
  }

  /* ---------- render ---------- */
  function renderChips(): React.ReactElement {
    if (!hasSelection) {
      return (
        <span className="placeholder">
          {placeholder}
        </span>
      );
    }

    return (
      <>
        {displayList.map(option => (
          <span
            key={option.id}
            className="chip"
          >
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
        ))}
      </>
    );
  }

  function renderOptions(): React.ReactElement[] {
    return options.map((option, index) => {
      const selected = isMultipleAllowed
        ? (normalizedValue as SelectOption[]).some(
            value => value.id === option.id
          )
        : (normalizedValue as SelectOption | null)
            ?.id === option.id;

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

  function renderStatusRow():
    | React.ReactElement
    | null {
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

  function renderDropdown():
    | React.ReactElement
    | null {
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
