'use client';

import { useState } from 'react';
import { deleteWeight } from '@/lib/api';
import EditWeightModal from './EditWeightModal';
import { formatDisplayDate } from '@/lib/dateUtils';
import { poundsToStones, poundsToKg, poundsToDecimalStones } from '@/lib/conversions';
import type { Weight, Unit } from '@/lib/types';

interface WeightListProps {
    weights: Weight[];
    unit: Unit;
    onUpdate: () => void;
}

export default function WeightList({ weights, unit, onUpdate }: WeightListProps) {
    const [editingWeight, setEditingWeight] = useState<Weight | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this entry?')) {
            return;
        }

        setDeletingId(id);
        try {
            await deleteWeight(id);
            onUpdate();
        } catch (error) {
            console.error('Failed to delete weight:', error);
            alert('Failed to delete entry');
        } finally {
            setDeletingId(null);
        }
    };

    if (weights.length === 0) {
        return (
            <div className="glass rounded-xl p-6 border border-cyan-500/20">
                <h2 className="text-xl font-semibold mb-4 text-cyan-300">📋 Weight Entries</h2>
                <p className="text-slate-400 text-center py-8">📄 No entries yet</p>
            </div>
        );
    }

    return (
        <>
            <div className="glass rounded-xl overflow-hidden border border-cyan-500/20">
                <h2 className="text-xl font-semibold p-6 pb-4 text-cyan-300">📋 Weight Entries</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-cyan-500/20">
                        <thead className="bg-slate-800/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                                    Date
                                </th>
                                {unit === 'imperial' ? (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                                            Stones
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                                            Pounds
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                                            Decimal (st)
                                        </th>
                                    </>
                                ) : (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-cyan-300 uppercase tracking-wider">
                                        Weight (kg)
                                    </th>
                                )}
                                <th className="px-6 py-3 text-right text-xs font-medium text-cyan-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-cyan-500/10">
                            {weights.map((weight) => {
                                const { stones, pounds } = poundsToStones(weight.pounds);
                                const decimalStones = poundsToDecimalStones(weight.pounds);
                                const kg = poundsToKg(weight.pounds);

                                return (
                                    <tr key={weight.id} className="glass-hover transition-all">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                                            {formatDisplayDate(weight.date)}
                                        </td>
                                        {unit === 'imperial' ? (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                                                    {stones}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                                                    {pounds.toFixed(1)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                                                    {decimalStones.toFixed(2)}
                                                </td>
                                            </>
                                        ) : (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                                                {kg.toFixed(2)}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setEditingWeight(weight)}
                                                className="text-purple-400 hover:text-purple-300 mr-4 transition-colors"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(weight.id)}
                                                disabled={deletingId === weight.id}
                                                className="text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                                            >
                                                {deletingId === weight.id ? '⏳ Deleting...' : '🗑️ Delete'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {editingWeight && (
                <EditWeightModal
                    isOpen={true}
                    weight={editingWeight}
                    onClose={() => setEditingWeight(null)}
                    onSave={() => {
                        setEditingWeight(null);
                        onUpdate();
                    }}
                />
            )}
        </>
    );
}
