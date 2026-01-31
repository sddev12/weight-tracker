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
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Weight Entries</h2>
                <p className="text-gray-500 text-center py-8">No entries yet</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <h2 className="text-xl font-semibold p-6 pb-4">Weight Entries</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                {unit === 'imperial' ? (
                                    <>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stones
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pounds
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Decimal (st)
                                        </th>
                                    </>
                                ) : (
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Weight (kg)
                                    </th>
                                )}
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {weights.map((weight) => {
                                const { stones, pounds } = poundsToStones(weight.pounds);
                                const decimalStones = poundsToDecimalStones(weight.pounds);
                                const kg = poundsToKg(weight.pounds);

                                return (
                                    <tr key={weight.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDisplayDate(weight.date)}
                                        </td>
                                        {unit === 'imperial' ? (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {stones}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {pounds.toFixed(1)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {decimalStones.toFixed(2)}
                                                </td>
                                            </>
                                        ) : (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {kg.toFixed(2)}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => setEditingWeight(weight)}
                                                className="text-primary-600 hover:text-primary-900 mr-4"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(weight.id)}
                                                disabled={deletingId === weight.id}
                                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                            >
                                                {deletingId === weight.id ? 'Deleting...' : 'Delete'}
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
