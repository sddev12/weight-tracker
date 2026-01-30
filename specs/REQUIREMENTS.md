# Weight Tracker - Functional Requirements

## Overview

A weight tracking application that allows users to record their weight in UK imperial units (stones and pounds), view historical entries, delete records, and visualize weight trends over time.

---

## Data Model

### Weight Reading Entity

Each weight reading contains the following properties:

| Field                   | Type            | Description                       | Validation                                             |
| ----------------------- | --------------- | --------------------------------- | ------------------------------------------------------ |
| `date`                  | Date (ISO 8601) | Date of weight measurement        | Required, format: YYYY-MM-DD                           |
| `weight_stones`         | Decimal         | Weight in stones                  | Required, ≥ 0                                          |
| `weight_lbs`            | Decimal         | Additional pounds                 | Required, ≥ 0, < 14                                    |
| `weight_total_lbs`      | Decimal         | Calculated total weight in pounds | Auto-calculated: (stones × 14) + lbs                   |
| `weight_decimal_stones` | Decimal         | Calculated decimal stone value    | Auto-calculated: total_lbs ÷ 14, rounded to 2 decimals |
| `weight_kg`             | Decimal         | Calculated weight in kilograms    | Auto-calculated: total_lbs × 0.45359237                |

### Calculations

- **Total Pounds**: `(stones × 14) + lbs`
- **Decimal Stones**: `round((total_lbs ÷ 14) × 100) ÷ 100`
- **Kilograms**: `total_lbs × 0.45359237`

---

## User Flows

### 1. Add Weight Entry

**Primary Flow:**

1. User navigates to "Add Entry" view
2. System displays form with three fields:
   - Date (format: DD-MM-YYYY)
   - Stones (numeric)
   - Pounds (numeric)
3. User enters weight data
4. User can navigate between fields using:
   - Tab / Down Arrow (next field)
   - Shift+Tab / Up Arrow (previous field)
5. User submits form
6. System validates input:
   - Date must be valid DD-MM-YYYY format
   - Stones must be numeric
   - Pounds must be numeric
7. System converts date to ISO format (YYYY-MM-DD)
8. System calculates derived values (total_lbs, decimal_stones, kg)
9. System saves entry to storage
10. System displays success confirmation
11. System clears form for next entry

**Validation Errors:**

- Invalid date format → Show error: "Invalid date format (use DD-MM-YYYY)"
- Invalid stones value → Show error: "Invalid stones value"
- Invalid pounds value → Show error: "Invalid pounds value"
- Save failure → Show error: "Failed to save: [error details]"

---

### 2. View Entries List

**Primary Flow:**

1. User navigates to "Entries" view
2. System loads all weight readings from storage
3. System displays entries in a table with columns:
   - Date (DD-MM-YYYY format)
   - Stones (st)
   - Pounds (lbs)
   - Total (lbs)
   - Decimal (st)
   - Kilograms (kg)
4. Entries are sorted by date (most recent first by default)
5. User can navigate entries using arrow keys
6. User can select an entry for deletion

**Table Format:**

```
| Date       | St    | Lbs   | Total | Decimal | Kg     |
|------------|-------|-------|-------|---------|--------|
| 25-01-2026 | 15    | 3     | 213   | 15.21   | 96.62  |
| 20-01-2026 | 15    | 10    | 220   | 15.71   | 99.79  |
```

---

### 3. Delete Entry

**Primary Flow:**

1. User is viewing "Entries" list
2. User selects an entry using arrow keys
3. User presses Delete key (or designated delete action)
4. System displays confirmation modal:
   - "Delete entry from [date]?"
   - Buttons: "Yes" | "No"
5. If user selects "Yes":
   - System removes entry from storage
   - System refreshes entries table
   - System refreshes chart view
   - System displays success: "Entry deleted successfully!"
6. If user selects "No":
   - Modal closes, no action taken

---

### 4. View Weight Chart

**Primary Flow:**

1. User navigates to "Chart" view
2. System loads all weight readings from storage
3. System sorts entries by date (chronological order)
4. System generates line chart visualization with:
   - **Y-axis**: Weight in pounds
     - Display min and max values
     - Show equivalent stones conversion
   - **X-axis**: Time
     - Display first date (earliest)
     - Display last date (most recent)
     - Show total number of readings
   - **Line graph**: Weight trend over time
5. Chart displays with color coding:
   - Title in cyan
   - Y-axis labels in yellow/white
   - Chart line in green
   - X-axis labels in yellow/white/cyan

**Chart Header Format:**

```
WEIGHT OVER TIME

Y-axis: [min] lbs ([min] st) ▲ [max] lbs ([max] st)

[Line chart visualization]

X-axis: [first date] → [last date] (N readings)
```

**Empty State:**

- If no entries exist → Display: "No weight data to display"

---

## Feature Requirements

### Navigation

- **Tab Cycling**: User can press Tab to cycle through views:
  1. Add Entry
  2. Entries
  3. Chart
  4. (cycles back to Add Entry)
- **Exit**: User can press Ctrl+C to quit application

### Data Persistence

- All weight readings stored in YAML file (`weight_readings.yaml`)
- File location: Same directory as application or configurable path
- Format: Array of weight reading objects with all calculated fields
- Auto-save on add/delete operations
- Load on application start

### Display Preferences

- **Date Format**: DD-MM-YYYY for display (UK format)
- **Date Storage**: YYYY-MM-DD (ISO 8601)
- **Decimal Precision**: 2 decimal places for:
  - Decimal stones
  - Kilograms
- **Numeric Format**:
  - Whole numbers for stones and pounds in entry form
  - Decimals allowed for precise input

---

## UI/UX Requirements

### General

- Clean, minimalist interface
- Clear visual separation between views
- Status messages for user actions
- Modal dialogs for confirmations and errors
- Color coding for better readability

### Add Entry View

- Form title: "WEIGHT TRACKER - Add Entry"
- Field labels clearly visible
- Current value displayed in each field
- Submit button or Enter key to save
- Clear visual feedback on focus
- Instructions displayed: "Tab/Arrows: Navigate | Enter: Submit | Tab: Next Tab | Ctrl+C: Quit"

### Entries View

- Table title: "WEIGHT TRACKER - Entries"
- Header row with column names
- Selectable rows with visual highlight
- Scrollable if entries exceed screen height
- Instructions: "Delete: Remove Entry | Tab: Next Tab | Ctrl+C: Quit"

### Chart View

- Chart title: "WEIGHT TRACKER - Chart"
- Proper axis labeling
- Visual trend line
- Legend/summary information
- Instructions: "Tab: Next Tab | Ctrl+C: Quit"

### Modals

- **Success**: Green/positive styling, single OK button
- **Error**: Red/warning styling, single OK button
- **Confirmation**: Two buttons (Yes/No), clear question text

---

## Business Rules

1. **Date Uniqueness**: Multiple entries can exist for the same date (no unique constraint)
2. **Weight Values**: No minimum or maximum weight limits enforced
3. **Pounds Constraint**: Conventionally < 14 lbs (since 14 lbs = 1 stone), but not strictly enforced
4. **Calculated Fields**: Always auto-calculated, never manually entered
5. **Data Integrity**: All weight entries must have date, stones, and lbs values
6. **Chronological Display**: Chart always displays data in chronological order
7. **Sort Order**: Entries list can be sorted (current: most recent first)

---

## Non-Functional Requirements

### Performance

- Application should load in < 1 second
- Chart rendering should be near-instantaneous (< 100ms)
- Form submission should feel immediate
- Support for at least 1000+ weight entries without performance degradation

### Usability

- Keyboard-first navigation (mouse optional)
- Clear error messages in plain language
- Confirmation before destructive actions (delete)
- Visual feedback for all user actions

### Data

- Data file should be human-readable (YAML)
- Backward compatible data format
- Safe concurrent access (file locking if needed)

---

## Future Enhancements (Out of Scope)

- Weight goals and targets
- BMI calculations (requires height input)
- Multiple user support
- Data export (CSV, JSON)
- Statistics (average, trend analysis, predictions)
- Custom date ranges for chart
- Multiple chart types (bar, scatter)
- Data import from other sources
- Body measurements beyond weight
- Photo attachments
- Notes/journal entries per reading
- Reminders/notifications
- Cloud sync
- Mobile companion app

---

## Technical Notes

### Date Handling

- **Input Format**: DD-MM-YYYY (British format)
- **Storage Format**: YYYY-MM-DD (ISO 8601)
- **Display Format**: DD-MM-YYYY or "DD Jan" for charts
- Timezone: Not currently tracked (dates only, no time component)

### Unit Conversions

- 1 stone = 14 pounds (exact)
- 1 pound = 0.45359237 kilograms (exact conversion factor)
- Stones/pounds displayed as separate values
- Decimal stones calculated for reference
- Kilograms calculated for international users

### Storage Format Example

```yaml
- date: '2026-01-01'
  weight_stones: 15
  weight_lbs: 8
  weight_total_lbs: 218
  weight_decimal_stones: 15.57
  weight_kg: 98.88
```

---

## Success Criteria

The application is considered successful if it:

1. ✅ Allows quick entry of weight in stones/pounds with UK date format
2. ✅ Displays historical weight entries in a readable table
3. ✅ Enables deletion of incorrect entries with confirmation
4. ✅ Shows visual weight trend over time
5. ✅ Persists data reliably between sessions
6. ✅ Provides immediate feedback for all user actions
7. ✅ Handles errors gracefully with clear messages
8. ✅ Supports keyboard-only navigation efficiently
