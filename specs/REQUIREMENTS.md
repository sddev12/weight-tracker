# Weight Tracker - Functional Requirements

## Overview

A weight tracking application that allows users to record their weight in UK imperial units (stones and pounds), view historical entries, delete records, and visualize weight trends over time.

---

## Data Model

### Weight Reading Entity

Each weight reading contains the following properties:

| Field    | Type    | Description                | Validation                   |
| -------- | ------- | -------------------------- | ---------------------------- |
| `date`   | Date    | Date of weight measurement | Required, format: YYYY-MM-DD |
| `stones` | Decimal | Weight in stones           | Required, ≥ 0                |
| `pounds` | Decimal | Additional pounds          | Required, ≥ 0, < 14          |

### Calculated/Display Fields

These fields are calculated from the stored data for display purposes:

| Field            | Calculation                                         | Description              |
| ---------------- | --------------------------------------------------- | ------------------------ |
| `total_pounds`   | `(stones × 14) + pounds`                            | Total weight in pounds   |
| `decimal_stones` | `total_pounds ÷ 14` (rounded to 2 decimals)         | Weight as decimal stones |
| `kilograms`      | `total_pounds × 0.45359237` (rounded to 2 decimals) | Weight in kilograms      |

### Unit Conversion Formulas

- **Total Pounds**: `(stones × 14) + pounds`
- **Decimal Stones**: `round((total_lbs ÷ 14) × 100) ÷ 100`
- **Kilograms**: `total_lbs × 0.45359237`
- **Conversion Constant**: 1 pound = 0.45359237 kilograms (exact)

---

## User Flows

### 1. Add Weight Entry

**Primary Flow:**

1. User accesses the weight entry form
2. System displays form with three fields:
   - Date (date picker, default: today)
   - Stones (numeric input)
   - Pounds (numeric input)
3. User enters weight data
4. User submits form
5. System validates input:
   - Date must be valid and not in the future
   - Stones must be a valid number ≥ 0
   - Pounds must be a valid number ≥ 0 and < 14
6. System saves entry
7. System displays success confirmation
8. System refreshes the weight list and chart
9. Form is cleared for next entry

**Validation Rules:**

- **Date**: Required, must be valid date, cannot be in the future
- **Stones**: Required, must be numeric, must be ≥ 0
- **Pounds**: Required, must be numeric, must be ≥ 0 and < 14
- **Duplicate Date**: Only one entry allowed per date (show appropriate error)

**Error Messages:**

- Invalid date → "Please enter a valid date"
- Future date → "Date cannot be in the future"
- Invalid stones → "Stones must be a positive number"
- Invalid pounds → "Pounds must be between 0 and 13.99"
- Duplicate entry → "An entry already exists for this date"
- Save failure → "Failed to save entry: [error details]"

---

### 2. View Entries List

**Primary Flow:**

1. User views the weight entries list
2. System loads all weight readings
3. System displays entries in a table with columns:
   - Date
   - Stones
   - Pounds
   - Total Pounds
   - Decimal Stones
   - Kilograms
   - Actions (Edit/Delete buttons)
4. Entries are sorted by date (most recent first by default)
5. User can interact with entries to edit or delete them

**Display Format:**

- **Date**: User-friendly format (e.g., "27 Jan 2026" or "27/01/2026")
- **Numeric Values**: Appropriate decimal precision (2 decimal places for kg and decimal stones)
- **Empty State**: Display message "No entries yet" when list is empty

**Example Entry:**

| Date        | Stones | Pounds | Total | Decimal | Kg    | Actions     |
| ----------- | ------ | ------ | ----- | ------- | ----- | ----------- |
| 27 Jan 2026 | 12     | 2      | 170   | 12.14   | 77.11 | Edit Delete |
| 26 Jan 2026 | 12     | 5      | 173   | 12.36   | 78.47 | Edit Delete |

---

### 3. Delete Entry

**Primary Flow:**

1. User clicks delete button on an entry
2. System displays confirmation dialog:
   - Message: "Delete entry from [date]?"
   - Buttons: "Confirm" / "Cancel"
3. If user confirms:
   - System removes entry from storage
   - System refreshes entries table
   - System refreshes chart
   - System displays success message: "Entry deleted successfully"
4. If user cancels:
   - Dialog closes, no action taken

### 4. Edit Entry

**Primary Flow:**

1. User clicks edit button on an entry
2. System opens edit dialog pre-populated with current values:
   - Date
   - Stones
   - Pounds
3. User modifies values
4. User saves changes
5. System validates input (same rules as adding entry)
6. System updates the entry
7. System refreshes entries table and chart
8. System displays success message: "Entry updated successfully"

**Validation:**

- Same validation rules as adding a new entry
- Cannot change date to a date that already has an entry (unless it's the same entry)

---

### 5. View Weight Chart

**Primary Flow:**

1. User views the weight chart
2. System loads weight readings based on selected date range
3. System sorts entries by date (chronological order)
4. System generates line chart visualization with:
   - **Y-axis**: Weight (in selected unit: pounds or kilograms)
   - **X-axis**: Time (dates)
   - **Data points**: Weight measurements
   - **Trend line**: Connecting data points to show weight progression

**Chart Features:**

- **Date Range Filter**: Ability to filter by:
  - Last 7 days
  - Last 30 days (1 month)
  - Last 3 months
  - Last 6 months
  - Last 9 months
  - Last 12 months (1 year)
  - All time
- **Unit Toggle**: Switch between imperial (stones/pounds) and metric (kilograms) display
- **Goal Line**: Optional horizontal reference line showing target weight (if goal is set)
- **Interactive**: Hover/click on data points to see exact values and dates
- **Responsive**: Chart adapts to different screen sizes

**Empty State:**

- If no entries exist → Display: "No weight data to display. Add your first entry to get started!"
- If no entries in selected date range → Display: "No entries in this date range. Try selecting a different period."

### 6. Set Goal Weight

**Primary Flow:**

1. User clicks "Set Goal" button
2. System opens goal setting dialog
3. User enters target weight in stones and pounds
4. User saves goal
5. System stores goal weight
6. System displays goal line on chart
7. System shows success message: "Goal weight set successfully"

**Features:**

- **Clear Goal**: Option to remove/clear the goal
- **Update Goal**: Can change goal at any time
- **Visual Indicator**: Goal weight shown as horizontal reference line on chart

---

## Feature Requirements

### Data Persistence

- Weight readings must persist between sessions
- Data integrity maintained across application restarts
- Support for import/export functionality (future enhancement)

### Display Preferences

- **Date Storage**: ISO 8601 format (YYYY-MM-DD)
- **Date Display**: User-friendly format appropriate for locale
- **Decimal Precision**:
  - 2 decimal places for decimal stones
  - 2 decimal places for kilograms
  - 1 decimal place for pounds (optional)
- \*\*Unit Di Principles

- Clean, minimalist interface
- Intuitive navigation
- Responsive design (works on desktop, tablet, mobile)
- Clear status messages for user actions
- Loading indicators for asynchronous operations
- Accessible to keyboard navigation

### Weight Entry Form

- Clear form title
- Field labels clearly visible
- Date picker for easy date selection (default: today, max: today)
- Numeric inputs for stones and pounds
- Submit button with clear label (e.g., "Add Entry")
- Form validation with inline error messages
- Auto-clear form after successful submission

### Entries List

- Table with clear column headers
- Sortable by date (default: most recent first)
- Action buttons for each entry (Edit, Delete)
- Visual distinction between rows (e.g., alternating colors)
- Scrollable if entries exceed viewport
- Empty state with helpful message and call-to-action

### Chart Visualization

- Clear chart title
- Properly labeled axes
- Readable date labels on X-axis
- Weight values on Y-axis (with unit indicator)
- Interactive data points (hover to see details)
- Legend explaining any reference lines (e.g., goal weight)
- Date range selector clearly visible
- Unit toggle prominently displayed

### Modals/Dialogs

- **Confirmation Dialogs**:
  - Clear question
  - Distinct "Confirm" and "Cancel" buttons
  - Close on outside click or ESC key
- **Success Messages**:
  - Brief, positive feedback
  - Auto-dismiss after a few seconds
  - Green/success color scheme
- **Error Messages**:
  - Clear explanation of the error
  - Suggestions for resolution if applicable
  - Red/warning color scOnly one entry allowed per date (enforce UNIQUE constraint)

2. **Future Dates**: Entries cannot be created for future dates
3. **Weight Values**:
   - Stones must be ≥ 0
   - Pounds must be ≥ 0 and < 14 (by convention, since 14 lbs = 1 stone)
   - No strict maximum weight limits enforced
4. **Calculated Fields**: Total pounds, decimal stones, and kilograms are always calculated from stones and pounds, never stored or manually entered
5. **Data Integrity**: All weight entries must have valid date, stones, and pounds values
6. **Chronological Display**: Chart displays data in chronological order (oldest to newest)
7. **Default Sorting**: Entries list sorted by date, most recent first
8. **Confirmation Required**: Destructive actions (delete) require explicit user confirmation
9. **Goal Weight**: Optional feature, can be set, updated, or cleared at any time

- Loading states for async operations
- Smooth transitions and animations (subtle, not distracting)
- Visual trend line
- Legend/summary information
- Instructions: "Tab: Next Tab | Ctrl+C: Quit"

### Modals

- **Success**: Green/positive styling, single OK button
- Intuitive user interface requiring minimal learning
- Keyboard shortcuts supported where appropriate
- Clear error messages in plain language
- Confirmation before destructive actions (delete, clear goal)
- Visual feedback for all user actions
- Accessible to users with disabilities (WCAG 2.1 Level AA target)

### Data

- Data persistence and reliability
- Data integrity maintained across sessions
- Backup and restore capability (future enhancement)
- Data privacy (local storage only, no external transmissions (since 14 lbs = 1 stone), but not strictly enforced

4. **Calculated Fields**: Always auto-calculated, never manually entered
5. **Data Integrity**: All weight entries must have date, stones, and lbs values

### Analytics and Insights

- BMI calculations (requires height input)
- Statistics dashboard (average, rate of change, predictions)
- Trend analysis with regression lines
- Achievement badges and milestones

### Data Management

- Multiple user support
- Data export (CSV, JSON, PDF reports)
- Data import from other sources (CSV, fitness apps)
- Backup and restore functionality
- Cloud synchronization

### Extended Tracking

- Body measurements beyond weight (waist, body fat %, etc.)
- Photo progress tracking
- Notes/journal entries per reading
- Mood or energy level tracking

### Advanced Visualization

- Multiple chart types (bar, scatter, area)
- Comparison charts (multiple time periods)
- Body composition charts
- Custom date ranges with calendar picker

### Notifications and Reminders

- Scheduled reminders to log weight
- Goal achievement notifications
- Progress reports (weekly/monthly summaries)

### Integration

- Mobile companion app
- Fitness tracker integration
- Health app synchronization (Apple Health, Google Fit)
- Social sharing features

### Usability

- Keyboard-first navigation (mouse optional)
- Clear error messages in plain language
- Confirmation before destructive actions (delete)
- Visual feedback for all user actions

### Data

- Data file should be human-readable (YAML)
- Backward compatible data format
- Safe concurrent access (file locking if needed)

---Data and Calculation Notes

### Date Handling

- **Storage Format**: ISO 8601 (YYYY-MM-DD) for consistency and sortability
- **Display Format**: User-friendly locale-appropriate format (e.g., "27 Jan 2026" or "27/01/2026")
- **Timezone**: Not required (dates only, no time component)
- **Validation**: Dates must be valid and not in the future

### Unit Conversions

**Conversion Constants:**

- 1 stone = 14 pounds (exact)
- 1 pound = 0.45359237 kilograms (exact conversion factor)

**Display Formats:**

- **Imperial**: Stones and pounds as separate whole numbers (e.g., "12 st 5 lbs")
- **Decimal Stones**: Total weight expressed as decimal stones (e.g., "12.36 st")
- **Metric**: Weight in kilograms (e.g., "78.47 kg")

**Calculation Examples:**

````
Input: 12 stones, 5 pounds
Total Pounds: (12 × 14) + 5 = 173 lbs
Decimal Stones: 173 ÷ 14 = 12.36 st
Kilograms: 173 × 0.45359237 = 78.47 kg: DD-MM-YYYY (British format)
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
````

---

## Success Criteria

The application is considered successful if it:

1. ✅ **Easy Entry**: Users can quickly add weight entries with date, stones, and pounds
2. ✅ **Historical View**: Displays all historical weight entries in a clear, readable table
3. ✅ **Safe Deletion**: Allows deletion of entries with confirmation to prevent accidents
4. ✅ **Edit Capability**: Users can correct mistakes by editing existing entries
5. ✅ **Visual Trends**: Shows weight progression over time with an intuitive chart
6. ✅ **Flexible Display**: Supports both imperial (stones/pounds) and metric (kg) units
7. ✅ **Date Filtering**: Allows filtering chart data by various time periods
8. ✅ **Goal Tracking**: Optional goal weight feature with visual indicator on chart
9. ✅ **Data Persistence**: Reliably stores data between sessions
10. ✅ **User Feedback**: Provides immediate, clear feedback for all user actions
11. ✅ **Error Handling**: Handles errors gracefully with helpful messages
12. ✅ **Performance**: Application loads quickly and responds immediately to user input
13. ✅ **Usability**: Intuitive interface requiring minimal learning
14. ✅ **Responsive**: Works well on different screen sizes (desktop, tablet, mobile)
