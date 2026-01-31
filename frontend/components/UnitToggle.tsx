'use client';

import type { Unit } from '@/lib/types';

interface UnitToggleProps {
    unit: Unit;
    onUnitChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onUnitChange }: UnitToggleProps) {
    return (
        <div className="flex items-center gap-3 glass rounded-lg px-4 py-2 border border-cyan-500/20">
            <span className="text-sm font-medium text-cyan-300">🌐 Display:</span>
            <div className="flex bg-slate-800/70 rounded-lg p-1 border border-cyan-500/20">
                <button
                    onClick={() => onUnitChange('imperial')}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${unit === 'imperial'
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    Imperial
                </button>
                <button
                    onClick={() => onUnitChange('metric')}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${unit === 'metric'
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white glow-cyan'
                        : 'text-slate-400 hover:text-slate-200'
                        }`}
                >
                    Metric
                </button>
            </div>
        </div>
    );
}
