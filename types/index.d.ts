import * as React from "react";

export interface SelectOption {
  id: string | number;
  label: string;
}

export interface RenderOptionMeta {
  selected: boolean;
}

export interface SelectProps {
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
    meta: RenderOptionMeta
  ) => React.ReactNode;

  renderChipValue?: (
    option: SelectOption
  ) => React.ReactNode;
}

declare const Select: React.FC<SelectProps>;
export default Select;
