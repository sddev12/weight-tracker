'use client';

import type { DateRange } from '@/lib/types';

interface DateRangeFilterProps {
    selectedRange: DateRange;
    onRangeChange: (range: DateRange) => void;
}

const ranges: { value: DateRange; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '1m', label: 'Last month' },
    { value: '3m', label: 'Last 3 months' },
    { value: '6m', label: 'Last 6 months' },
    { value: '9m', label: 'Last 9 months' },
    { value: '1y', label: 'Last year' },
    { value: 'all', label: 'All time' },
];

export default function DateRangeFilter({
    selectedRange,
    onRangeChange,
}: DateRangeFilterProps) {
    return (
        <div className="flex items-center gap-2">
            <label htmlFor="date-range" className="text-sm font-medium text-gray-700">
                Time period:
            </label>
            <select
                id="date-range"
                value={selectedRange}
                onChange={(e) => onRangeChange(e.target.value as DateRange)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
                {ranges.map((range) => (
                    <option key={range.value} value={range.value}>
                        {range.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
