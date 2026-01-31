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
import { poundsToKg, poundsToDecimalStones } from '@/lib/conversions';
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
            <div className="glass rounded-xl p-6 border border-cyan-500/20">
                <div className="h-96 flex items-center justify-center">
                    <p className="text-cyan-300">⏳ Loading chart...</p>
                </div>
            </div>
        );
    }

    if (weights.length === 0) {
        return (
            <div className="glass rounded-xl p-6 border border-cyan-500/20">
                <h2 className="text-xl font-semibold mb-4 text-cyan-300">📈 Weight Progress</h2>
                <div className="h-96 flex items-center justify-center">
                    <p className="text-slate-400">
                        📊 No weight data to display. Add your first entry to get started!
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
            weight: unit === 'metric' ? poundsToKg(w.pounds) : poundsToDecimalStones(w.pounds),
        }));

    const goalValue = goalPounds
        ? unit === 'metric'
            ? poundsToKg(goalPounds)
            : poundsToDecimalStones(goalPounds)
        : null;

    return (
        <div className="glass rounded-xl p-6 border border-cyan-500/20">
            <h2 className="text-xl font-semibold mb-4 text-cyan-300">📈 Weight Progress</h2>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(6, 182, 212, 0.1)" />
                    <XAxis
                        dataKey="displayDate"
                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                        stroke="#475569"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                    />
                    <YAxis
                        tick={{ fill: '#94a3b8' }}
                        stroke="#475569"
                        label={{
                            value: unit === 'metric' ? 'Weight (kg)' : 'Weight (st)',
                            angle: -90,
                            position: 'insideLeft',
                            fill: '#94a3b8',
                        }}
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="glass p-3 border border-cyan-500/30 rounded-lg shadow-lg">
                                        <p className="font-semibold text-slate-200">{payload[0].payload.displayDate}</p>
                                        <p className="text-cyan-400 font-semibold">
                                            {unit === 'metric'
                                                ? `${Number(payload[0].value).toFixed(1)} kg`
                                                : `${Number(payload[0].value).toFixed(2)} st`}
                                        </p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Legend wrapperStyle={{ color: '#94a3b8' }} />
                    {goalValue && (
                        <ReferenceLine
                            y={goalValue}
                            stroke="#f59e0b"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            label={{ value: '🎯 Goal', fill: '#fbbf24', fontWeight: 'bold' }}
                        />
                    )}
                    <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#06b6d4"
                        strokeWidth={3}
                        dot={{ fill: '#22d3ee', r: 5, strokeWidth: 2, stroke: '#0e7490' }}
                        activeDot={{ r: 7, fill: '#22d3ee', stroke: '#06b6d4', strokeWidth: 2 }}
                        name="Weight"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
