'use client';

import type { Unit } from '@/lib/types';

interface UnitToggleProps {
    unit: Unit;
    onUnitChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onUnitChange }: UnitToggleProps) {
    return (
        <div className="flex items-center gap-2 bg-white rounded-lg shadow px-3 py-2">
            <span className="text-sm font-medium text-gray-700">Display:</span>
            <div className="flex bg-gray-100 rounded-md p-1">
                <button
                    onClick={() => onUnitChange('imperial')}
                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${unit === 'imperial'
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                >
                    Imperial
                </button>
                <button
                    onClick={() => onUnitChange('metric')}
                    className={`px-3 py-1 text-sm font-medium rounded transition-colors ${unit === 'metric'
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                >
                    Metric
                </button>
            </div>
        </div>
    );
}
