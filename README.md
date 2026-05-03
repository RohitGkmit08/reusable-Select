# Reusable Select Component

A fully featured React dropdown component built from scratch.
Supports single and multi-select, async data loading with pagination,
keyboard navigation, debounced search, and custom rendering.

## Features

- Single and multi-select modes
- Controlled and uncontrolled usage
- Keyboard navigation — Arrow keys, Enter, Escape
- Debounced search (300ms) with external search handler
- Infinite scroll pagination via `onReachEnd`
- Loading and empty states
- Custom option and selected value rendering via render props
- Chip display for selected values with individual remove
- Clear all selection
- Outside click to close
- Auto-scrolls to highlighted option during keyboard navigation

## Usage

### Basic multi-select (uncontrolled)
```jsx
<Select
  options={[
    { id: 1, label: "Option A" },
    { id: 2, label: "Option B" }
  ]}
  placeholder="Select options"
/>
```

### Controlled single select
```jsx
<Select
  options={options}
  value={selected}
  onChange={setSelected}
  multiple={false}
  placeholder="Select one"
/>
```

### Async with pagination and search
```jsx
<Select
  options={options}
  value={value}
  onChange={handleChange}
  onSearch={handleSearch}
  onReachEnd={() => setPage(p => p + 1)}
  onClear={handleClear}
  loading={loading}
  hasMore={hasMore}
  placeholder="Search users"
  renderOption={(option, { selected }) => (
    <div>
      <span>{option.label}</span>
      {selected && <span>✓</span>}
    </div>
  )}
  renderSelectedValue={option => (
    <span>{option.label}</span>
  )}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `array` | `[]` | Array of `{ id, label }` objects |
| `value` | `array \| object \| null` | — | Selected value. Pass to enable controlled mode |
| `onChange` | `function` | — | Called with next selected value |
| `onClear` | `function` | — | Called when selection is cleared |
| `onSearch` | `function` | — | Called with search query (debounced 300ms) |
| `onReachEnd` | `function` | — | Called when dropdown is scrolled to bottom |
| `loading` | `boolean` | `false` | Shows loading indicator in dropdown |
| `hasMore` | `boolean` | `false` | Controls whether pagination is active |
| `multiple` | `boolean` | `true` | Enable multi-select |
| `placeholder` | `string` | — | Placeholder text |
| `renderOption` | `function` | — | Custom option renderer `(option, { selected, highlighted }) => ReactNode` |
| `renderSelectedValue` | `function` | — | Custom chip renderer `(option) => ReactNode` |

## Local Setup
```bash
npm install
npm run dev
```

The `AsyncSelect` component in `src/Components/AsyncSelect.jsx`
demonstrates a real-world usage with paginated API calls,
default pre-selected values, and custom rendering.
