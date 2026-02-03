import * as React from "react";

export interface SelectOption {
  id: string | number;
  label: string;
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
  renderOption?: (
    option: SelectOption,
    meta: {
      selected: boolean;
    }
  ) => React.ReactNode;
  renderChipValue?: (option: SelectOption) => React.ReactNode;
}

declare function Select(props: SelectProps): React.ReactElement;
export default Select;
