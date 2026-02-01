import * as React from "react";


export interface SelectOption {
  id: string | number;
  label: string;
  [key: string]: any;
}

export interface RenderOptionMeta {
  selected: boolean;
}

export interface SelectProps<
  T extends SelectOption = SelectOption
> {
  /** List of available options */
  options: T[];

  /**
   * Controlled value
   * - single: T | null
   * - multiple: T[]
   */
  value?: T | T[] | null;

  /**
   * Fired on selection change
   * Matches single / multiple mode automatically
   */
  onChange?: (value: T | T[] | null) => void;

  /** Clear selection callback */
  onClear?: () => void;

  /** Search callback (debounced internally) */
  onSearch?: (query: string) => void;

  /** Triggered when dropdown scroll reaches end */
  onReachEnd?: () => void;

  /** Loading state */
  isLoading?: boolean;

  /** Whether more options are available */
  hasMoreOptions?: boolean;

  /** Enable multi-select mode */
  isMultipleAllowed?: boolean;

  /** Placeholder text */
  placeholder?: string;

  /**
   * Custom option renderer
   */
  renderOption?: (
    option: T,
    meta: RenderOptionMeta
  ) => React.ReactNode;

  /**
   * Custom selected value renderer (chips)
   */
  renderChipValue?: (option: T) => React.ReactNode;
}

/**
 * Select component
 */
declare const Select: <
  T extends SelectOption = SelectOption
>(
  props: SelectProps<T>
) => React.ReactElement;

export default Select;
