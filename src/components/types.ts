import type React from "react";
import type { Dispatch, SetStateAction } from "react";

export interface SelectOption {
  id: string | number;
  label: string;
}

export interface DropdownKeyDownParams {
  event: React.KeyboardEvent<HTMLDivElement>;
  open: boolean;
  options: SelectOption[];
  highlightedIndex: number;
  setHighlightedIndex: Dispatch<SetStateAction<number>>;
  onSelect: (option: SelectOption) => void;
  closeDropdown: () => void;
  userNavigatedRef: React.RefObject<boolean>;
}

export interface SelectProps {
  options: SelectOption[];
  value?: SelectOption | SelectOption[] | null;
  onChange?: (value: SelectOption | SelectOption[] | null) => void;
  onClear?: () => void;
  onSearch?: (query: string) => void;
  onReachEnd?: () => void;
  isLoading?: boolean;
  hasMoreOptions?: boolean;
  isMultipleAllowed?: boolean;
  placeholder?: string;
  isClearable?: boolean; 
  renderOption?: (
    option: SelectOption,
    meta: { selected: boolean }
  ) => React.ReactNode;

  renderChipValue?: (option: SelectOption) => React.ReactNode;
}
