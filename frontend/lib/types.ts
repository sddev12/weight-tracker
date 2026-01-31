export interface Weight {
  id: number;
  date: string;
  pounds: number;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  pounds: number | null;
  updated_at: string | null;
}

export type Unit = 'imperial' | 'metric';

export type DateRange = '7d' | '1m' | '3m' | '6m' | '9m' | '1y' | 'all';

export interface StonesAndPounds {
  stones: number;
  pounds: number;
}
