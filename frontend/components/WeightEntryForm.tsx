'use client';

import { useState } from 'react';
import { createWeight } from '@/lib/api';
import { stonesToPounds } from '@/lib/conversions';
import { getTodayString } from '@/lib/dateUtils';

interface WeightEntryFormProps {
    onSuccess: () => void;
}

export default function WeightEntryForm({ onSuccess }: WeightEntryFormProps) {
    const [date, setDate] = useState(getTodayString());
    const [stones, setStones] = useState('');
    const [pounds, setPounds] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            await createWeight(date, totalPounds);
            // Clear form
            setDate(getTodayString());
            setStones('');
            setPounds('');
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to add weight entry');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glass rounded-xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-semibold mb-4 text-purple-300">📊 Add Weight Entry</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="date" className="block text-sm font-medium text-cyan-300 mb-1">
                            Date
                        </label>
                        <input
                            type="date"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={getTodayString()}
                            required
                            className="w-full px-3 py-2 bg-slate-800/50 border border-cyan-500/30 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div>
                        <label htmlFor="stones" className="block text-sm font-medium text-cyan-300 mb-1">
                            Stones
                        </label>
                        <input
                            type="number"
                            id="stones"
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
                        <label htmlFor="pounds" className="block text-sm font-medium text-cyan-300 mb-1">
                            Pounds
                        </label>
                        <input
                            type="number"
                            id="pounds"
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

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:from-emerald-600 hover:to-cyan-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed transition-all glow-emerald font-semibold"
                >
                    {isSubmitting ? '⏳ Adding...' : '➕ Add Entry'}
                </button>
            </form>
        </div>
    );
}
