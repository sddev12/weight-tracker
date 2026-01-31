# Weight Tracker Frontend

Next.js frontend application for the Weight Tracker.

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Deployment**: Static export served by nginx

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # App header with goal
│   ├── WeightEntryForm.tsx # Weight entry form
│   ├── WeightChart.tsx     # Chart visualization
│   ├── WeightList.tsx      # Weight entries table
│   ├── UnitToggle.tsx      # Imperial/Metric toggle
│   ├── DateRangeFilter.tsx # Date range selector
│   ├── GoalModal.tsx       # Goal setting modal
│   └── EditWeightModal.tsx # Edit entry modal
├── lib/
│   ├── api.ts              # API client functions
│   ├── conversions.ts      # Unit conversion utilities
│   ├── dateUtils.ts        # Date formatting utilities
│   └── types.ts            # TypeScript types
├── Dockerfile              # Docker build configuration
├── nginx.conf              # Nginx server configuration
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json            # Dependencies
```

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

## Development

### Prerequisites

- Node.js 20 or higher
- npm

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Build static export
npm run build

# Output will be in the 'out' directory
```

### Docker Build

```bash
# For Minikube deployment
eval $(minikube docker-env)
docker build -t weight-tracker-frontend:latest .
```

## Features

- ✅ Add weight entries with date, stones, and pounds
- ✅ View weight history in a table
- ✅ Edit and delete entries
- ✅ Visualize weight trends with interactive chart
- ✅ Toggle between imperial (stones/pounds) and metric (kg) units
- ✅ Filter chart by date range (7 days, 1/3/6/9/12 months, all time)
- ✅ Set and track goal weight
- ✅ Responsive design (mobile, tablet, desktop)

## Components

### Header

- Displays app title
- Shows current goal weight
- Button to open goal modal

### WeightEntryForm

- Date picker (default: today, max: today)
- Stones and pounds inputs
- Form validation
- Success/error messages

### WeightChart

- Line chart with Recharts
- X-axis: dates
- Y-axis: weight in selected unit
- Goal weight reference line
- Interactive tooltips

### WeightList

- Table of all weight entries
- Displays in selected unit (imperial/metric)
- Edit and delete buttons for each entry
- Confirmation before deletion

### UnitToggle

- Switch between imperial and metric display
- Persists selection to localStorage

### DateRangeFilter

- Dropdown to select time period
- Options: 7d, 1m, 3m, 6m, 9m, 1y, all time

### GoalModal

- Set goal weight in stones/pounds
- Clear goal option
- Cancel and save buttons

### EditWeightModal

- Edit existing weight entry
- Pre-populated with current values
- Cancel and save buttons

## Unit Conversions

- **Stones to Pounds**: `(stones × 14) + pounds`
- **Pounds to Stones**: `stones = floor(pounds / 14)`, `pounds = pounds % 14`
- **Pounds to Kilograms**: `pounds × 0.453592`
- **Decimal Stones**: `round((pounds / 14) × 100) / 100`

## Notes

- Static export for Kubernetes deployment
- CORS configured to communicate with backend
- All dates stored in ISO 8601 format (YYYY-MM-DD)
- Responsive design with Tailwind CSS
- Client-side state management with React hooks
