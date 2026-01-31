'use client';

import { useState, useEffect } from 'react';
import { updateWeight } from '@/lib/api';
import { stonesToPounds, poundsToStones } from '@/lib/conversions';
import { getTodayString } from '@/lib/dateUtils';
import type { Weight } from '@/lib/types';

interface EditWeightModalProps {
    isOpen: boolean;
    weight: Weight | null;
    onClose: () => void;
    onSave: () => void;
}

export default function EditWeightModal({
    isOpen,
    weight,
    onClose,
    onSave,
}: EditWeightModalProps) {
    const [date, setDate] = useState('');
    const [stones, setStones] = useState('');
    const [pounds, setPounds] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (weight) {
            setDate(weight.date);
            const { stones: st, pounds: lbs } = poundsToStones(weight.pounds);
            setStones(st.toString());
            setPounds(lbs.toFixed(1));
        }
    }, [weight]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!weight) return;

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
            await updateWeight(weight.id, date, totalPounds);
            onSave();
        } catch (err: any) {
            setError(err.message || 'Failed to update weight entry');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !weight) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h2 className="text-xl font-semibold mb-4">Edit Weight Entry</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <input
                            type="date"
                            id="edit-date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={getTodayString()}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-stones" className="block text-sm font-medium text-gray-700 mb-1">
                                Stones
                            </label>
                            <input
                                type="number"
                                id="edit-stones"
                                value={stones}
                                onChange={(e) => setStones(e.target.value)}
                                min="0"
                                step="1"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-pounds" className="block text-sm font-medium text-gray-700 mb-1">
                                Pounds
                            </label>
                            <input
                                type="number"
                                id="edit-pounds"
                                value={pounds}
                                onChange={(e) => setPounds(e.target.value)}
                                min="0"
                                max="13.99"
                                step="0.1"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
