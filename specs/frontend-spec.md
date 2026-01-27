# Weight Tracker - Frontend Specification

## Technology Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Date Handling:** date-fns
- **HTTP Client:** fetch API
- **Deployment:** Static export served by nginx

## Configuration

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
```

### Environment Variables

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Page Structure

### Main Page (/)

Single-page application with all features on home page.

**Layout Sections:**

1. Header with app title and goal setting
2. Weight entry form
3. Unit toggle and date range filter
4. Weight chart
5. Weight entries list

## Components

### 1. Header Component

**File:** `components/Header.tsx`

**Features:**

- App title: "Weight Tracker"
- Goal weight display/edit button
- Goal weight modal for setting target

**Props:**

```typescript
interface HeaderProps {
  goalPounds: number | null;
  onUpdateGoal: (pounds: number | null) => void;
}
```

### 2. WeightEntryForm Component

**File:** `components/WeightEntryForm.tsx`

**Features:**

- Date picker (default: today, max: today)
- Stones input (number, integer >= 0)
- Pounds input (number, 0-13.99)
- Submit button
- Validation messages

**Props:**

```typescript
interface WeightEntryFormProps {
  onSubmit: (date: string, pounds: number) => void;
  onSuccess: () => void;
}
```

**Conversion Logic:**

```typescript
const totalPounds = stones * 14 + pounds;
```

**Validation:**

- Date: Required, cannot be in future
- Stones: Required, integer >= 0
- Pounds: Required, >= 0 and < 14
- Display error if entry already exists for date

### 3. UnitToggle Component

**File:** `components/UnitToggle.tsx`

**Features:**

- Toggle switch between "Imperial" (stones/pounds) and "Metric" (kg)
- Visual indicator of selected unit
- Persists selection to localStorage

**Props:**

```typescript
interface UnitToggleProps {
  unit: 'imperial' | 'metric';
  onUnitChange: (unit: 'imperial' | 'metric') => void;
}
```

### 4. DateRangeFilter Component

**File:** `components/DateRangeFilter.tsx`

**Features:**

- Dropdown selector with predefined ranges
- Options:
  - Last 7 days
  - Last month (30 days)
  - Last 3 months
  - Last 6 months
  - Last 9 months
  - Last year (365 days)
  - All time

**Props:**

```typescript
interface DateRangeFilterProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
}

type DateRange = '7d' | '1m' | '3m' | '6m' | '9m' | '1y' | 'all';
```

### 5. WeightChart Component

**File:** `components/WeightChart.tsx`

**Features:**

- Line chart using Recharts
- X-axis: Date
- Y-axis: Weight (in selected unit)
- Data points for weight entries
- Horizontal reference line for goal weight
- Responsive sizing
- Tooltip showing date and weight

**Props:**

```typescript
interface WeightChartProps {
  weights: WeightEntry[];
  goalPounds: number | null;
  unit: 'imperial' | 'metric';
  dateRange: DateRange;
}

interface WeightEntry {
  id: number;
  date: string;
  pounds: number;
  created_at: string;
  updated_at: string;
}
```

**Conversion Functions:**

```typescript
function poundsToStonesPounds(pounds: number): {
  stones: number;
  pounds: number;
} {
  const stones = Math.floor(pounds / 14);
  const remainingPounds = pounds % 14;
  return { stones, pounds: remainingPounds };
}

function poundsToKg(pounds: number): number {
  return pounds * 0.453592;
}
```

### 6. WeightList Component

**File:** `components/WeightList.tsx`

**Features:**

- Table/list of weight entries
- Columns: Date, Weight (in selected unit), Actions
- Edit button (opens modal to edit entry)
- Delete button (with confirmation)
- Sort by date (newest first)
- Empty state message when no entries

**Props:**

```typescript
interface WeightListProps {
  weights: WeightEntry[];
  unit: 'imperial' | 'metric';
  onEdit: (id: number, date: string, pounds: number) => void;
  onDelete: (id: number) => void;
}
```

### 7. GoalModal Component

**File:** `components/GoalModal.tsx`

**Features:**

- Modal dialog for setting goal weight
- Stones input
- Pounds input
- Save button
- Clear goal button
- Cancel button

**Props:**

```typescript
interface GoalModalProps {
  isOpen: boolean;
  currentGoalPounds: number | null;
  onClose: () => void;
  onSave: (pounds: number | null) => void;
}
```

### 8. EditWeightModal Component

**File:** `components/EditWeightModal.tsx`

**Features:**

- Modal dialog for editing weight entry
- Pre-populated with existing data
- Date picker
- Stones and pounds inputs
- Save button
- Cancel button

**Props:**

```typescript
interface EditWeightModalProps {
  isOpen: boolean;
  weight: WeightEntry | null;
  onClose: () => void;
  onSave: (id: number, date: string, pounds: number) => void;
}
```

## API Integration

### API Client

**File:** `lib/api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getWeights(
  startDate?: string,
  endDate?: string,
): Promise<WeightEntry[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const response = await fetch(`${API_URL}/weights?${params}`);
  const data = await response.json();
  return data.weights;
}

export async function createWeight(
  date: string,
  pounds: number,
): Promise<WeightEntry> {
  const response = await fetch(`${API_URL}/weights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, pounds }),
  });
  return response.json();
}

export async function updateWeight(
  id: number,
  date: string,
  pounds: number,
): Promise<WeightEntry> {
  const response = await fetch(`${API_URL}/weights/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, pounds }),
  });
  return response.json();
}

export async function deleteWeight(id: number): Promise<void> {
  await fetch(`${API_URL}/weights/${id}`, {
    method: 'DELETE',
  });
}

export async function getGoal(): Promise<{ pounds: number | null }> {
  const response = await fetch(`${API_URL}/goal`);
  return response.json();
}

export async function updateGoal(
  pounds: number | null,
): Promise<{ pounds: number | null }> {
  const response = await fetch(`${API_URL}/goal`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pounds }),
  });
  return response.json();
}
```

## State Management

Use React hooks for state management:

```typescript
// Main page state
const [weights, setWeights] = useState<WeightEntry[]>([]);
const [goalPounds, setGoalPounds] = useState<number | null>(null);
const [unit, setUnit] = useState<'imperial' | 'metric'>('imperial');
const [dateRange, setDateRange] = useState<DateRange>('1m');
const [isLoading, setIsLoading] = useState(false);
```

## Utility Functions

### Date Range Calculation

**File:** `lib/dateUtils.ts`

```typescript
export function getDateRangeFromFilter(range: DateRange): {
  startDate: string;
  endDate: string;
} {
  const endDate = new Date();
  const startDate = new Date();

  switch (range) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '1m':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '3m':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '6m':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case '9m':
      startDate.setMonth(endDate.getMonth() - 9);
      break;
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case 'all':
      return { startDate: '', endDate: '' };
  }

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
}
```

## Styling Guidelines

### Tailwind CSS Theme

- Primary color: Blue (for buttons, links)
- Background: Light gray/white
- Chart colors: Blue for weight line, red for goal line
- Responsive breakpoints: mobile-first approach

### Component Styling

- Form inputs: Rounded borders, focus states
- Buttons: Primary (filled), Secondary (outline), Danger (red, for delete)
- Modals: Centered overlay with backdrop
- Tables: Striped rows, hover states

## User Experience

### Loading States

- Show loading spinner when fetching data
- Disable form during submission
- Show toast notifications for success/error

### Error Handling

- Display validation errors inline on forms
- Show toast notification for API errors
- Graceful degradation if chart fails to render

### Responsive Design

- Mobile: Stack components vertically, full-width chart
- Tablet: Two-column layout where appropriate
- Desktop: Full layout with larger chart

## Build and Deployment

### Development

```bash
npm run dev  # Next.js dev server on port 3000
```

### Production Build

```bash
npm run build  # Generates static export in 'out' directory
```

### Docker Build

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
server {
    listen 3000;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }
}
```

## Testing Considerations

### Unit Tests

- Component rendering
- Conversion functions (pounds <-> stones/kg)
- Date range calculations

### Integration Tests

- Form submission flow
- API integration
- Chart rendering with data

### E2E Tests

- Complete user flow: add weight -> view chart -> set goal -> filter dates
