import type { StonesAndPounds } from './types';

/**
 * Convert stones and pounds to total pounds
 */
export function stonesToPounds(stones: number, pounds: number): number {
  return stones * 14 + pounds;
}

/**
 * Convert total pounds to stones and pounds
 */
export function poundsToStones(totalPounds: number): StonesAndPounds {
  const stones = Math.floor(totalPounds / 14);
  const pounds = totalPounds % 14;
  return { stones, pounds };
}

/**
 * Convert pounds to kilograms
 */
export function poundsToKg(pounds: number): number {
  return pounds * 0.453592;
}

/**
 * Convert pounds to decimal stones
 */
export function poundsToDecimalStones(pounds: number): number {
  return Math.round((pounds / 14) * 100) / 100;
}

/**
 * Format weight for display based on unit
 */
export function formatWeight(
  pounds: number,
  unit: 'imperial' | 'metric',
  format: 'short' | 'long' = 'short'
): string {
  if (unit === 'metric') {
    const kg = poundsToKg(pounds);
    return format === 'short' ? `${kg.toFixed(1)} kg` : `${kg.toFixed(2)} kg`;
  }

  const { stones, pounds: lbs } = poundsToStones(pounds);
  if (format === 'short') {
    return `${stones} st ${lbs.toFixed(0)} lbs`;
  }
  return `${stones} stones ${lbs.toFixed(1)} pounds`;
}
