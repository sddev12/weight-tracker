'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import { formatDisplayDate } from '@/lib/dateUtils';
import { poundsToKg } from '@/lib/conversions';
import type { Weight, Unit } from '@/lib/types';

interface WeightChartProps {
    weights: Weight[];
    goalPounds: number | null;
    unit: Unit;
    isLoading?: boolean;
}

export default function WeightChart({
    weights,
    goalPounds,
    unit,
    isLoading = false,
}: WeightChartProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="h-96 flex items-center justify-center">
                    <p className="text-gray-500">Loading chart...</p>
                </div>
            </div>
        );
    }

    if (weights.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Weight Progress</h2>
                <div className="h-96 flex items-center justify-center">
                    <p className="text-gray-500">
                        No weight data to display. Add your first entry to get started!
                    </p>
                </div>
            </div>
        );
    }

    const chartData = [...weights]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((w) => ({
            date: w.date,
            displayDate: formatDisplayDate(w.date),
            weight: unit === 'metric' ? poundsToKg(w.pounds) : w.pounds,
        }));

    const goalValue = goalPounds
        ? unit === 'metric'
            ? poundsToKg(goalPounds)
            : goalPounds
        : null;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Weight Progress</h2>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="displayDate"
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis
                        label={{
                            value: unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)',
                            angle: -90,
                            position: 'insideLeft',
                        }}
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
                                        <p className="font-semibold">{payload[0].payload.displayDate}</p>
                                        <p className="text-primary-600">
                                            {unit === 'metric'
                                                ? `${Number(payload[0].value).toFixed(1)} kg`
                                                : `${Number(payload[0].value).toFixed(1)} lbs`}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend />
                    {goalValue && (
                        <ReferenceLine
                            y={goalValue}
                            stroke="#ef4444"
                            strokeDasharray="5 5"
                            label="Goal"
                        />
                    )}
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ fill: '#2563eb', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Weight"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
