'use client';

import { useState } from 'react';
import GoalModal from './GoalModal';
import { formatWeight } from '@/lib/conversions';

interface HeaderProps {
    goalPounds: number | null;
    onUpdateGoal: (pounds: number | null) => void;
}

export default function Header({ goalPounds, onUpdateGoal }: HeaderProps) {
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

    return (
        <>
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Weight Tracker
                        </h1>
                        <button
                            onClick={() => setIsGoalModalOpen(true)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            {goalPounds ? 'Update Goal' : 'Set Goal'}
                        </button>
                    </div>
                    {goalPounds && (
                        <p className="mt-2 text-sm text-gray-600">
                            Goal: {formatWeight(goalPounds, 'imperial', 'short')}
                        </p>
                    )}
                </div>
            </header>

            <GoalModal
                isOpen={isGoalModalOpen}
                currentGoalPounds={goalPounds}
                onClose={() => setIsGoalModalOpen(false)}
                onSave={onUpdateGoal}
            />
        </>
    );
}
