'use client';

import { useState, useEffect } from 'react';
import { updateGoal } from '@/lib/api';
import { stonesToPounds, poundsToStones } from '@/lib/conversions';

interface GoalModalProps {
    isOpen: boolean;
    currentGoalPounds: number | null;
    onClose: () => void;
    onSave: (pounds: number | null) => void;
}

export default function GoalModal({
    isOpen,
    currentGoalPounds,
    onClose,
    onSave,
}: GoalModalProps) {
    const [stones, setStones] = useState('');
    const [pounds, setPounds] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (currentGoalPounds) {
            const { stones: st, pounds: lbs } = poundsToStones(currentGoalPounds);
            setStones(st.toString());
            setPounds(lbs.toFixed(1));
        } else {
            setStones('');
            setPounds('');
        }
    }, [currentGoalPounds, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const stonesNum = parseFloat(stones);
        const poundsNum = parseFloat(pounds);

        if (isNaN(stonesNum) || stonesNum < 0) {
            setError('Stones must be a positive number');
            return;
        }

        if (isNaN(poundsNum) || poundsNum < 0 || poundsNum >= 14) {
            setError('Pounds must be between 0 and 13.99');
            return;
        }

        const totalPounds = stonesToPounds(stonesNum, poundsNum);

        setIsSubmitting(true);
        try {
            await updateGoal(totalPounds);
            onSave(totalPounds);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to update goal');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = async () => {
        if (!confirm('Are you sure you want to clear your goal?')) {
            return;
        }

        setIsSubmitting(true);
        try {
            await updateGoal(null);
            onSave(null);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to clear goal');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass rounded-xl shadow-2xl max-w-md w-full p-6 border border-cyan-500/30 glow-cyan">
                <h2 className="text-xl font-semibold mb-4 text-cyan-300">🎯 Set Goal Weight</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="goal-stones" className="block text-sm font-medium text-cyan-300 mb-1">
                                Stones
                            </label>
                            <input
                                type="number"
                                id="goal-stones"
                                value={stones}
                                onChange={(e) => setStones(e.target.value)}
                                min="0"
                                step="1"
                                placeholder="12"
                                required
                                className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label htmlFor="goal-pounds" className="block text-sm font-medium text-cyan-300 mb-1">
                                Pounds
                            </label>
                            <input
                                type="number"
                                id="goal-pounds"
                                value={pounds}
                                onChange={(e) => setPounds(e.target.value)}
                                min="0"
                                max="13.99"
                                step="0.1"
                                placeholder="5"
                                required
                                className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-300 bg-red-900/30 border border-red-500/30 rounded-lg p-3">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="flex gap-2 justify-end">
                        {currentGoalPounds && (
                            <button
                                type="button"
                                onClick={handleClear}
                                disabled={isSubmitting}
                                className="px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-all disabled:opacity-50"
                            >
                                🗑️ Clear Goal
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-slate-300 hover:bg-slate-700/50 rounded-lg transition-all disabled:opacity-50"
                        >
                            ✖️ Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 glow-emerald font-semibold"
                        >
                            {isSubmitting ? '⏳ Saving...' : '✓ Save Goal'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
