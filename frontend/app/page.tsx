'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import WeightEntryForm from '@/components/WeightEntryForm';
import WeightChart from '@/components/WeightChart';
import WeightList from '@/components/WeightList';
import UnitToggle from '@/components/UnitToggle';
import DateRangeFilter from '@/components/DateRangeFilter';
import { getWeights, getGoal } from '@/lib/api';
import { getDateRangeFromFilter } from '@/lib/dateUtils';
import type { Weight, DateRange, Unit } from '@/lib/types';

export default function Home() {
    const [weights, setWeights] = useState<Weight[]>([]);
    const [goalPounds, setGoalPounds] = useState<number | null>(null);
    const [unit, setUnit] = useState<Unit>('imperial');
    const [dateRange, setDateRange] = useState<DateRange>('1m');
    const [isLoading, setIsLoading] = useState(false);

    const loadWeights = async () => {
        setIsLoading(true);
        try {
            const { startDate, endDate } = getDateRangeFromFilter(dateRange);
            const data = await getWeights(startDate, endDate);
            setWeights(data);
        } catch (error) {
            console.error('Failed to load weights:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadGoal = async () => {
        try {
            const goal = await getGoal();
            setGoalPounds(goal.pounds);
        } catch (error) {
            console.error('Failed to load goal:', error);
        }
    };

    useEffect(() => {
        loadWeights();
        loadGoal();
    }, [dateRange]);

    const handleWeightAdded = () => {
        loadWeights();
    };

    const handleGoalUpdated = (pounds: number | null) => {
        setGoalPounds(pounds);
    };

    return (
        <div className="min-h-screen">
            <Header goalPounds={goalPounds} onUpdateGoal={handleGoalUpdated} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Weight Entry Form */}
                <div className="mb-8">
                    <WeightEntryForm onSuccess={handleWeightAdded} />
                </div>

                {/* Controls */}
                <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <DateRangeFilter
                        selectedRange={dateRange}
                        onRangeChange={setDateRange}
                    />
                    <UnitToggle unit={unit} onUnitChange={setUnit} />
                </div>

                {/* Chart */}
                <div className="mb-8">
                    <WeightChart
                        weights={weights}
                        goalPounds={goalPounds}
                        unit={unit}
                        isLoading={isLoading}
                    />
                </div>

                {/* Weight List */}
                <div>
                    <WeightList
                        weights={weights}
                        unit={unit}
                        onUpdate={loadWeights}
                    />
                </div>
            </main>
        </div>
    );
}
