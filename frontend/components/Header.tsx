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
            <header className="glass border-b border-cyan-500/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                            ⚡ Weight Tracker
                        </h1>
                        <button
                            onClick={() => setIsGoalModalOpen(true)}
                            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all glow-cyan font-semibold"
                        >
                            {goalPounds ? '🎯 Update Goal' : '🎯 Set Goal'}
                        </button>
                    </div>
                    {goalPounds && (
                        <p className="mt-2 text-sm text-cyan-300">
                            🏆 Goal: {formatWeight(goalPounds, 'imperial', 'short')}
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
